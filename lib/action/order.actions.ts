'use server';

import { auth } from '@/auth';
import { convertToPlanObject, formatError } from '../utils';
import { getMyCart } from './cart.actions';
import { cookies } from 'next/headers';
import { getUserById } from './user.action';
import { insertOrderSchema } from '../validators';
import { prisma } from '@/db/prisma';
import { Prisma } from '@prisma/client';
import { CartItem, PaymentResult, ShippingAddress } from '@/types';
import { paypal } from '../paypal';
import { revalidatePath } from 'next/cache';
import { PAGE_SIZE } from '../constants';
import { sendPurhaseReceipt } from '@/email';


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

export async function getOrderById(orderId: string){
  const data = await prisma.order.findFirst({
    where: {
      id: orderId
    },
    include: {
      orderitems: true,
      user: {select: {name: true, email: true}}
    }
  })
  return convertToPlanObject(data);
}

// Create a new paypal order
export async function createPayPalOrder(orderId: string){
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId
      }
    });

    if(order){
      // Create Paypal order
      const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

      // Update order with paypal order id
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentResult: {
            id: paypalOrder.id,
            status: '',
            pricePaid: 0
          }
        }
      });

      return {
        success: true,
        message: 'Item order created successfully',
        data: paypalOrder.id
      }


    } else {
      throw new Error('Order not found');
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

// Approve paypal order and update order to paid

export async function approvePayPalOrder(orderId: string, data: {orderID: string}){
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId
      },
    });

    if(!order) throw new Error('Order not found');

    const captureData = await paypal.capturePayment(data.orderID)

    if(!captureData || captureData.id !== (order.paymentResult as PaymentResult)?.id || captureData.status !== 'COMPLETED'){
      throw new Error('Error in PayPal payment');
    }

    // Update order to paid
    updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer.email,
        pricePaid: captureData.purchase_units[0]?.payments?.captures[0].amount?.value
      }
    })
    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: 'Order Payment Processed Successfully'
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error) 
    }
  }
}

// Update order to paid 
export async function updateOrderToPaid({
  orderId,
  paymentResult
}: {
  orderId: string,
  paymentResult?: PaymentResult
}){ 
  const order = await prisma.order.findFirst({
    where: {
      id: orderId
    },
    include: {
      orderitems: true
    }
  })

  if(!order) throw new Error('Order not found');

  if(order.isPaid) throw new Error('Order payment already processed');

  // Transaction to update order and account for product stock
  await prisma.$transaction(async (tx) => {
    // iterate over products and update the stock
    for(const item of order.orderitems){
      await tx.product.update({
        where: {
          id: item.productId
        },
        data: { stock: {increment: -item.qty}}
      })
    }

    // Set order to paid
    await tx.order.update({
      where: {id: orderId},
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult
      }
    })
  })

  // Get updated order after transaction
  const updatedOrder = await prisma.order.findFirst({
    where: {id: orderId},
    include: {
      orderitems: true,
      user: { select: {name:true, email: true}}
    }
  })
  if(!updatedOrder) throw new Error('Order not found');

  sendPurhaseReceipt({order: {
    ...updatedOrder,
    shippingAddress: updatedOrder.shippingAddress as ShippingAddress,
    paymentResult: updatedOrder.paymentResult as PaymentResult,
  }});
}

//Get User Orders

export async function getMyOrders({
  limit = PAGE_SIZE,
  page
}: {
  limit?: number;
  page?: number;
}){
  const session = await auth();
  if(!session) throw new Error('User is not authorized');

  const data = await prisma.order.findMany({
    where: { userId: session?.user?.id! },
    orderBy: {createdAt: 'desc'},
    take: limit,
    skip: (page - 1) * limit
  })

  const dataCount = await prisma.order.count({
    where: { userId: session?.user?.id! }
  })

  return {
    data,
    totalPages: Math.ceil(dataCount / limit)
  }
}

type SalesDataType = {
  month: string;
  totalSales: number;
}[];

// Get sales data and order summary
export async function getOrderBySummary() {
  // Get counts for each resource
  const ordersCount = await prisma.order.count();
  const productsCount = await prisma.product.count();
  const usersCount = await prisma.user.count();

  // Calculate the total sales
  const totalSales = await prisma.order.aggregate({
    _sum: {totalPrice: true}
  });

  // Get monthly sales
  const salesDataRaw = await prisma.$queryRaw<Array<{month: string; totalSales: Prisma.Decimal}>>`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`;

  const salesData:SalesDataType = salesDataRaw.map((entry) => ({
    month: entry.month,
    totalSales: Number(entry.totalSales)
  }))
  
  // Get latest sales
  const latestSales = await prisma.order.findMany({
    orderBy: {createdAt: 'desc'},
    include: {
      user: {select: {name: true}}
      },
      take: 6
  });
  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    latestSales,
    salesData
  }
}

// Get all orders
export async function getAllOrders({
  limit = PAGE_SIZE,
  page,
  query
}: {
  limit?: number;
  page: number;
  query: string;
}){
  const queryFilter: Prisma.OrderWhereInput = query && query !== 'all' ? {
    user: {
          name: {
            contains: query,
            mode: 'insensitive',
          } as Prisma.StringFilter,
        }
  }: {};

  const data = await prisma.order.findMany({
    where: {
      ...queryFilter
    },
    orderBy: {createdAt: 'desc'},
    take: limit,
    skip: (page - 1) * limit,
    include: {user: {select: {name: true}}}
  });

  const dataCount = await prisma.order.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit)
  }
}

// Delete an order
export async function deleteOrder(id: string){
  try {
    await prisma.order.delete({
      where: {id}
    });

    revalidatePath('/admin/orders');
    return {
      success: true,
      message: 'Order deleted successfully'
    };
  } catch (error) {
    return{
      success: false,
      message: formatError(error)
    }
  }
}

// Update COD order to Paid
export async function updateOrderToPaidCOD(orderId: string) {
  try {
    await updateOrderToPaid({ orderId});

    revalidatePath(`/order/${orderId}`);

    return{
      success: true,
      message: 'Order marked as paid'
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

//Update COD order to delivered
export async function deliverOrder(orderId: string){
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId
      }
    })

    if(!order) throw new Error('Order not found');
    if(!order.isPaid) throw new Error('Order has not been paid yet');

    await prisma.order.update({
      where: {
        id: orderId
      },
      data: {
        isDelivered: true,
        deliveredAt: new Date()
      }
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: 'Order has been marked delivered'
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}