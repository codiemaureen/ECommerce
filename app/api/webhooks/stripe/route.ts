import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateOrderToPaid } from "@/lib/action/order.actions";

export async function POST(req: NextRequest){
 // build the webhook event
 const event = await Stripe.webhooks.constructEvent(
  await req.text(),
  req.headers.get('stripe-signature') as string,
  process.env.STRIPE_WEBHOOK_SECRET as string
 );

 if(event.type === 'charge.succeeded'){
  const { object } = event.data;

  // Update order status
  await updateOrderToPaid({
   orderId: object.metadata.orderId,
   paymentResult: {
    id: object.id,
    status: 'COMPLETED',
    email_address: object.billing_details.email!,
    pricePaid: (object.amount / 100).toFixed(),
   }
  });
  return NextResponse.json({
   message: 'updateOrdertoPaid was successful'
  })
 }

 return NextResponse.json({
  message: 'event is not charge.succeeded'
 });
}


