'use server';
import { prisma } from "@/db/prisma";
import { convertToPlanObject, formatError } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
import { insertProductSchema, updateProductSchema } from "../validators";
import z from "zod";
import { Prisma } from "@prisma/client";

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

export async function getProductById(productId: string){
 const data = await prisma.product.findFirst({
  where: {id: productId},
 });
 return convertToPlanObject(data);
}

// Get all products
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
  // price,
  // rating,
  // sort,
}: {
  query: string;
  limit?: number;
  page: number;
  category?: string;
  // price?: string;
  // rating?: string;
  // sort?: string;
}) {
  // Query filter
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== 'all'
      ? {
          name: {
            contains: query,
            mode: 'insensitive',
          } as Prisma.StringFilter,
        }
      : {};
  const categoryFilter = category && category !== 'all' ? { category } : {};
  
  const data = await prisma.product.findMany({
    where: {
      ...queryFilter,
      ...categoryFilter,
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  const dataCount = await prisma.product.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
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

// create a product
export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    await prisma.product.create({
      data: data as Prisma.ProductCreateInput
    });

    revalidatePath(`/admin/products`);

    return {
     success: true,
     message: 'Product created successfully'
    }
 } catch (error) {
  return {
   success: false,
   message: formatError(error)
  }
 }
} 


// update a product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {

   const product = updateProductSchema.parse(data);

    const productExists = await prisma.product.findFirst({
      where: {id: product.id}
    });
    
    if(!productExists) throw new Error('Product not found')
    
    await prisma.product.update({
     where: {id: product.id},
     data: product
    })

    revalidatePath('/admin/products');
    
    return {
     success: true,
     message: 'Product updated successfully'
    }

 } catch (error) {
  return {
   success: false,
   message: formatError(error)
  }
 }
} 