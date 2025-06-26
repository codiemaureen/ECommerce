'use server';

import { cookies } from "next/headers";
import { CartItem } from "@/types";
import { convertToPlanObject, formatError } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema } from "../validators";

export async function addItemToCart(data: CartItem){
 try {
  // check for cart cookie value
  const sessionCartId = (await cookies()).get('sessionCartId')?.value;
  if(!sessionCartId) throw new Error('Cart session not founds');

  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;
  // get cart
  const cart = await getMyCart();

  // parse and validate item
  const item = cartItemSchema.parse(data);

  // find product in database

  const product = await prisma.product.findFirst({
   where: {id: item.productID}
  });

  console.log(product)
  return {
   success: true,
   message: 'Item added to cart'
  }
 } catch (error) {
  return {
   success: false,
   message: formatError(error)
  }
 }
}

export async function getMyCart(){
   // check for cart cookie value
   const sessionCartId = (await cookies()).get('sessionCartId')?.value;
   if(!sessionCartId) throw new Error('Cart session not founds');
 
   const session = await auth();
   const userId = session?.user?.id ? (session.user.id as string) : undefined;

   // get user cart from database

   const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId} : { sessionCartId: sessionCartId}
   })

   if(!cart) return undefined;

   // convert decimals and return

   return convertToPlanObject({
    ...cart, 
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
   })
}