'use server';

import { signInFormSchema, signUpFormSchema } from "../validators";
import { signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { AuthActionState } from "@/types";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";


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
export async function signUpUser(prevState: unknown, formData: FormData){
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
    password: user.password
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
  return { success: false, message: 'User not registered' }
 }
}