'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { DisplayOrder, ShippingAddress } from "@/types";
import { Order as PrismaOrder, OrderItem, User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { 
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer
} from '@paypal/react-paypal-js';
import { createPayPalOrder, approvePayPalOrder } from "@/lib/action/order.actions";
import { toast } from "sonner";

export type Order = PrismaOrder & {
  shippingAddress: ShippingAddress;
  orderitems: OrderItem[];
  user: Pick<User, "name" | "email">;
};

const OrderDetailsTable = ({ order, paypalClientId }: {order:  DisplayOrder, paypalClientId: string}) => {
  const {
    id,
    shippingAddress,
    orderitems,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    paymentMethod,
    isDelivered,
    isPaid,
    paidAt,
    deliveredAt
  } = order;

  const PrintLoadingState = () => {
    const [{isPending, isRejected}] = usePayPalScriptReducer();
    let status = '';

    if(isPending){
      status = 'Loading PayPal...';
    } else if (isRejected) {
      status = 'Error Loading PayPal'
    }
    return status;
  }

  const handleCreatePayPalOrder = async () => {
    const res = await createPayPalOrder(order.id);

    if(!res.success) {
      toast.error(res.message)
    }

    return res.data;
  }

  const handleApprovePayPalOrder = async (data: {orderID: string;}) => {
    const res = await approvePayPalOrder(order.id, data);
    
    if(!res.success){
      toast.error(res.message)
    } else {
      toast.success(res.message)
    }
  }
  return ( <>
    <h1 className="py-4 text-2xl">Order {formatId(id)}</h1>
    <div className="grid md:grid-cols-3 md:gap-5">
      <div className="col-span-2 space-4-y overflow-x-auto">
        <Card>
          <CardContent className="p-4 gap-4">
            <h2 className="text-xl pb-4">
              Payment Method
            </h2>
            <p className="mb-2">{paymentMethod}</p>
            {isPaid 
              ? (<Badge variant="secondary"> Paid at {formatDateTime(paidAt!).dateTime} </Badge>) 
              : (<Badge variant="destructive"> Not Paid </Badge>)
            }
          </CardContent>
        </Card>
        <Card className="my-2">
          <CardContent className="p-4 gap-4">
            <h2 className="text-xl pb-4">
              Shipping Address
            </h2>
            <p>{shippingAddress.fullName}</p>
            <p className="mb-2">{shippingAddress.streetAddress}, {shippingAddress.city}{' '}
                {shippingAddress.postalCode}, {shippingAddress.country}
            </p>
            {isDelivered 
              ? (<Badge variant="secondary"> Delivered At {formatDateTime(deliveredAt!).dateTime} </Badge>) 
              : (<Badge variant="destructive"> Not Delivered </Badge>)
            }
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 gap-4">
            <h2 className="text-xl.pb-4">Order Items</h2>
            <Table>
              <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
              {orderitems.map((item) => (
                <TableRow key={item.slug}>
                <TableCell>
                  <Link href={`/product/${item.slug}`} className="flex items-center">
                  <Image src={item.image} alt={item.name} width={50} height={50}/>
                  <span className="px-2">{item.name}</span>
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="px-2">{item.qty}</span>
                </TableCell>
                <TableCell>
                  <span className="text-right">${item.price}</span>
                </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardContent className="p-4 gap-4 space-y-4">
            <div className="flex justify-between">
            <div>Items</div>
            <div>{formatCurrency(order.itemsPrice)}</div>
            </div>
            <div className="flex justify-between">
            <div>Tax Price</div>
            <div>{formatCurrency(order.taxPrice)}</div>
            </div>
            <div className="flex justify-between">
            <div>Shipping Price</div>
            <div>{formatCurrency(order.shippingPrice)}</div>
            </div>
            <div className="flex justify-between">
            <div>Total Price</div>
            <div>{formatCurrency(order.totalPrice)}</div>
            </div>
            {/* PayPal Payment */}
            {!isPaid && paymentMethod === 'PayPal' && (
              <div>
                <PayPalScriptProvider options={{clientId: paypalClientId}}>
                  <PrintLoadingState />
                  <PayPalButtons createOrder={handleCreatePayPalOrder} onApprove={handleApprovePayPalOrder}/>
                </PayPalScriptProvider>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>

  </>
  );
}

export default OrderDetailsTable;