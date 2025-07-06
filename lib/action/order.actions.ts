'use server';

import { isRedirectError } from 'next/dist/client/components/redirect';
import { formatError } from '../utils';
import { auth } from '@/auth';
import { getMyCart } from './cart.actions';
import { getUserById } from './user.action';
import { insertOrderSchema } from '../validators';
import { prisma } from '@/db/prisma';
import { CartItem, } from '@/types';
import { Prisma } from '@prisma/client';
import { cookies } from 'next/headers';

// Create order and create the order items
export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error('User is not authenticated');

    const cookieStore = await cookies();
    const sessionCartId = cookieStore.get("sessionCartId")?.value;
    const cart = await getMyCart(sessionCartId);
    const userId = session?.user?.id;
    if (!userId) throw new Error('User not found');

    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: 'Your cart is empty',
        redirectTo: '/cart',
      };
    }

    if (!user.address) {
      return {
        success: false,
        message: 'No shipping address',
        redirectTo: '/shipping-address',
      };
    }

    if (!user.paymentMethod) {
      return {
        success: false,
        message: 'No payment method',
        redirectTo: '/payment-method',
      };
    }

    // Create order object
    const order = insertOrderSchema.parse({
      user: {
        connect: {
          id: user.id,
        },
      },
      shippingAddress: user.address as Prisma.InputJsonValue,
      paymentMethod: user.paymentMethod,
      itemsPrice:  new Prisma.Decimal(cart.itemsPrice),
      shippingPrice:  new Prisma.Decimal(cart.shippingPrice),
      taxPrice:  new Prisma.Decimal(cart.taxPrice),
      totalPrice:  new Prisma.Decimal(cart.totalPrice),
    }) as Prisma.OrderCreateInput;;

    // Create a transaction to create order and order items in database
    const insertedOrderId = await prisma.$transaction(async (tx) => {
      // Create order
      const insertedOrder = await tx.order.create({ data: order });
      // Create order items from the cart items
      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            orderId: insertedOrder.id,
            productId: item.productID!, // match your Prisma model field name exactly
            qty: item.qty!,
            price: new Prisma.Decimal(item.price),
            name: item.name!,
            slug: item.slug!,
            image: item.image!,
          },
        });
      }
      
      // Clear cart
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          itemsPrice: 0,
        },
      });
      return insertedOrder.id;
    });
    if(!insertedOrderId) throw new Error('Order not created');

    return{
      success: true,
      message:'Order Created', redirectTo: `/order/${insertedOrderId}`
    }
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}