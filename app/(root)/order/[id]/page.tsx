import { getOrderById } from "@/lib/action/order.actions";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import OrderDetailsTable from "./order-details-table";
import {  DisplayOrder } from "@/types";
import { auth } from "@/auth";
import Stripe from "stripe";


export const metadata: Metadata = {
  title: 'Order Details'
}

const OrderDetailPage = async (props: {
  params: Promise<{
    id:string
  }>
  }) => {
  const session = await auth();
  const { id } = await props.params;
  
  const order = await getOrderById(id);
  if(!order) notFound();

  let client_secret = null;

  // Check if is not paid & using stripe
  if(order.paymentMethod === 'Stripe' && !order.isPaid){
    // Initialize Stripe instance
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalPrice) * 100),
      currency: 'USD',
      metadata: {orderId: order.id}
    });
    client_secret = paymentIntent.client_secret;
  }

  return ( 
    <>
      <OrderDetailsTable 
        order={order as DisplayOrder} 
        stripeClientSecret={client_secret}
        paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb'} 
        isAdmin={session?.user?.role === 'admin' || false}/>
    </>
    );
}

export default OrderDetailPage;