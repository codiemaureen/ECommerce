'use server';

import { cookies } from "next/headers";
import { CartItem } from "@/types";
import { convertToPlanObject, formatError, round2 } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { Prisma } from '@prisma/client'
const { Decimal } = Prisma;


const calcPrice = (items: CartItem[]) => {
   const itemsPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
   ),
   shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
   taxPrice = round2(0.15 * itemsPrice),
   totalPrice = round2(itemsPrice + taxPrice + shippingPrice);

   return {
      itemsPrice: itemsPrice.toFixed(2),
      shippingPrice: shippingPrice.toFixed(2),
      taxPrice: taxPrice.toFixed(2),
      totalPrice: totalPrice.toFixed(2)
   }
}

export async function addItemToCart(data: CartItem){
   try {
      // check for cart cookie value
      const sessionCartId = (await cookies()).get('sessionCartId')?.value;
      if(!sessionCartId) throw new Error('Cart session not founds');
      const session = await auth();

      // Get user ID
      const userId = session?.user?.id ? (session.user.id as string) : undefined;

      // get cart
      const cart = await getMyCart();

      // parse and validate item
      const item = cartItemSchema.parse(data);

      // find product in database
      const product = await prisma.product.findFirst({
         where: {id: item.productID}
      });

      if(!product) throw new Error('Product not found');

      if(!cart){
         const newCart = insertCartSchema.parse({
            userId: userId,
            items:[item],
            sessionCartId: sessionCartId,
            ...calcPrice([item])
         });
         
         // add to database
         await prisma.cart.create({
            data: {
               sessionCartId: newCart.sessionCartId,
               user: newCart.userId
                  ? { connect: { id: newCart.userId } }
                  : undefined,
               items: newCart.items,
               itemsPrice: new Decimal(newCart.itemsPrice),
               totalPrice: new Decimal(newCart.totalPrice),
               shippingPrice: new Decimal(newCart.shippingPrice),
               taxPrice: new Decimal(newCart.taxPrice)
            }
         });

         // revalidate product page
         revalidatePath(`/product/${product.slug}`)

         return {
            success: true,
            message: 'Item added to cart'
         }
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