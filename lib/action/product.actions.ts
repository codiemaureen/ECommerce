'use server';
import { prisma } from "@/db/prisma";
import { convertToPlanObject, formatError } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";

export async function getLatestProducts(){

 const data = await prisma.product.findMany({
  take: LATEST_PRODUCTS_LIMIT,
  orderBy: {createdAt: 'desc'}
 });
 return convertToPlanObject(data);
}

export async function getProductBySlug(slug: string){
 return await prisma.product.findFirst({
  where: {slug: slug},
 })
}

// Get all products
export async function getAllProducts({
 query,
 limit = PAGE_SIZE,
 page,
 category
}: {
 query: string;
 limit?: number;
 page: number;
 category?: string;
}){
 const data = await prisma.product.findMany({
  skip: (page - 1) * limit,
  take: limit
 })

 const dataCount = await prisma.product.count();

 return{
  data,
  totalPages: Math.ceil(dataCount / limit)
 }
}

// Delete a product
export async function deleteProduct(id: string){
 try {
  const productExists = await prisma.product.findFirst({
   where: {id}
  })

  if(!productExists) throw new Error('Product is not found');
    const orderItemCount = await prisma.orderItem.count({
   where: { productId: id }
  });

  if (orderItemCount > 0) {
   throw new Error('Cannot delete product: It is associated with existing orders.');
  }
  
  await prisma.product.delete({
   where: {id}
  });

  revalidatePath('/admin/products');

  return {
   success: true,
   message: 'Product deleted successfully'
  }
 } catch (error) {
  console.log(formatError(error))
  return {
   success: false,
   message: formatError(error)
  }
 }
}