import { getOrderById } from "@/lib/action/order.actions";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import OrderDetailsTable from "./order-details-table";
import {  DisplayOrder } from "@/types";



export const metadata: Metadata = {
  title: 'Order Details'
}

const OrderDetailPage = async (props: {
  params: Promise<{
    id:string
  }>
  }) => {

  const { id } = await props.params;
  
  const order = await getOrderById(id);
  if(!order) notFound();

  return ( 
    <>
      <OrderDetailsTable order={order as DisplayOrder} />
    </>
    );
}

export default OrderDetailPage;