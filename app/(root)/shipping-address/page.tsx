import { auth } from '@/auth';
import { getMyCart } from '@/lib/action/cart.actions';
import { getUserById } from '@/lib/action/user.action';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ShippingAddress } from '@/types';
import { cookies } from "next/headers";
import ShippingAddressForm from './shipping-address-form';

export const metadata: Metadata = {
 title: 'Shipping Address'
}

const ShippingAddressPage = async () => {
 // get cart
 const cookieStore = await cookies();
 const sessionCartId = cookieStore.get('sessionCartId')?.value;
 const cart = await getMyCart(sessionCartId);

 if(!cart || cart.items.length === 0) redirect('/cart');

 const session = await auth();

 const userId = session?.user?.id;

 if(!userId) throw new Error('No user ID');

 const user = await getUserById(userId);

 return ( <>
  <ShippingAddressForm address={user.address as ShippingAddress}/>
 </> );
}
 
export default ShippingAddressPage;