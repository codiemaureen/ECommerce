'use server';

import { auth } from '@/auth';
import { formatError } from '../utils';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { getMyCart } from './cart.actions';
import { cookies } from 'next/headers';
import { getUserById } from './user.action';
import { insertOrderSchema } from '../validators';
import { prisma } from '@/db/prisma';
import { Prisma } from '@prisma/client';
import { CartItem } from '@/types';

// Create order and create the order items
export async function createOrder() {
  try {
    // Get Session
    const session = await auth();
    if(!session) throw new Error('User is not authenticated');
    const cookieStore = await cookies();
    const sessionCartId = cookieStore.get('sessionCartId')?.value;
    
    
    // Get Cart
    const cart = await getMyCart(sessionCartId);

    const userId = session.user?.id;
    if(!userId) throw new Error('User not found');
    const user = await getUserById(userId);

    if(!cart || cart.items.length === 0){
      return{
        success: false,
        message: 'You cart is empty', 
        redirectTo: '/cart'
      }
    }
    if(!user.address){
      return{
        success: false,
        message: 'No shipping address',
        redirectTo: '/shipping-address'
      }
    }
    if(!user.paymentMethod){
      return{
        success: false,
        message: 'No payment method',
        redirectTo: '/payment-method'
      }
    }

    const order = insertOrderSchema.parse({
      user: { connect: { id: user.id } },
      shippingAddress: user.address as Prisma.InputJsonValue,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice.toString(),
      shippingPrice: cart.shippingPrice.toString(),
      taxPrice: cart.taxPrice.toString(),
      totalPrice: cart.totalPrice.toString(),
    }) as Prisma.OrderCreateInput;

    // Create a transaction to create order and order items in database
    const insertedOrderId = await prisma.$transaction(async (tx) => {
      // Create order
      const insertedOrder = await tx.order.create({ data: order });

      // Create order items from the cart Items
      for(const item of cart.items as CartItem[]){
        await tx.orderItem.create({
          data: {
            productId: item.productID, 
            orderId: insertedOrder.id,
            qty: item.qty ?? 1,
            price: cart.itemsPrice.toString(), 
            name: item.name ?? "",
            slug: item.slug ?? "",
            image: item.image ?? "",
          },
        });
      }

      // clear the items
      await tx.cart.update({
        where: {id: cart.id},
        data: {
          items: [],
          totalPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          itemsPrice: 0
        }
      })
      return insertedOrder.id
    })
    if(!insertedOrderId) throw new Error('Order not created');

    return {
      success: true,
      message: 'Order created', 
      redirectTo: `/order/${insertedOrderId}`
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
      redirectTo: '/cart', 
    };
  }
}