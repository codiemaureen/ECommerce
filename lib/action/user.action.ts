'use server';

import { shippingAddressSchema, signInFormSchema, signUpFormSchema, paymentMethodSchema } from "../validators";
import { auth, signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { AuthActionState, ShippingAddress } from "@/types";
import { hashSync } from "bcryptjs";
import { prisma } from "@/db/prisma";
import { formatError } from "../utils";

// sign in the user with credentials

export async function signInWithCredentials(prevState: AuthActionState, formData: FormData) {
 try {
  const user = signInFormSchema.parse({
   email: formData.get('email'),
   password: formData.get('password'),
  });

  await signIn('credentials', user);
  return { success: true, message: 'Signed in Successfully'}
 } catch (error) {
  if(isRedirectError(error)){
   throw error;
  }
  return { success: false, message: 'Invalid mail or password' }
 }
}

//sign user out
export async function signOutUser(){
 await signOut();
}

//sign user up
export async function signUpUser(prevState: AuthActionState, formData: FormData){
 try {
  const user = signUpFormSchema.parse({
   name: formData.get('name'),
   email: formData.get('email'),
   password: formData.get('password'),
   confirmPassword: formData.get('confirmPassword'),
  });
  const unalteredPassword = user.password;
  user.password = hashSync(user.password, 10);

  await prisma.user.create({
   data: {
    name: user.name,
    email: user.email,
    password: user.password,
    role: 'User'
   }
  });

  await signIn('credentials', {
   email: user.email,
   password: unalteredPassword
  })

  return {
   success: true,
   message: 'User registered successfully'
  }
 } catch (error) {
  if(isRedirectError(error)){
   throw error;
  }
  return { success: false, message: formatError(error) }
 }
}

export async function getUserById(userId: string){
 const user = await prisma.user.findFirst({
  where: {id: userId}
 });
 if(!user) throw new Error('User not found');
 return user;
}

export async function updateUserAddress(data: ShippingAddress){
 try {
  const session = await auth();

  const currentUser = prisma.user.findFirst({
   where: {id: session?.user?.id}
  });

  if(!currentUser) throw new Error('User not found');

  const address = shippingAddressSchema.parse(data);

  await prisma.user.update({
   where: {id: (await currentUser).id},
   data:{address}
  })
  
 } catch (error) {
  return { 
   success: false,
   message: formatError(error)
  }
 }

 return {
  success: true,
  message: 'User address updated successfully'
 }
}

export async function updateUserPaymentMethod(data: z.infer<typeof paymentMethodSchema>){
 try {
  const session = await auth();
  const currentUser = await prisma.user.findFirst({
   where: {id: session?.user?.id}
  })

  if(!currentUser) throw new Error('User not found');

  const paymentMethod = paymentMethodSchema.parse(data);

  await prisma.user.update({
   where: {id: currentUser.id},
   data: {paymentMethod: paymentMethod.type}
  });
  
  return {
   success: true,
   message: 'User updated successfully'
  }
 } catch (error) {
  return {
   success: false, 
   message: formatError(error)
  }
 }
}