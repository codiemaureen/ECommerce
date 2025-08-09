'use server';

import z from "zod";
import { insertReviewSchema } from "../validators";
import { formatError } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";

// Create & Update Reviews
export async function createUpdateReview(data: z.infer<typeof insertReviewSchema>){
 try {
  const session = await auth();
  if(!session)throw new Error('User is not authenicated');

  // Validate and store the review
  const review = insertReviewSchema.parse({
   ...data,
   userId: session?.user?.id
  });

  // get the product that is being reviewed
  const product = await prisma.product.findFirst({
   where: {id: review.productId}
  });

  if(!product)throw Error('Product not found');

  // check if user has already reviewed the product
  const reviewExists = await prisma.review.findFirst({
   where: {
    productId: review.productId,
    userId: review.userId
   }
  });
  
  await prisma.$transaction(async(tx) => {
   if(reviewExists){
    // update review
    await tx.review.update({
     where: {id: reviewExists.id},
     data: {
      title: review.title,
      description: review. description,
      rating: review.rating
     }
    })
   } else {
    // create the review
    await tx.review.create({
      data: {
       title: review.title,
       description: review.description,
       rating: review.rating,
       product: { connect: { id: review.productId } },
       user: { connect: { id: review.userId } },
     }

    })
   }
   // Get the average rating
   const averageRating = await tx.review.aggregate({
    _avg: {rating: true},
    where: {productId: review.productId}
   });

   // Get number of reviews
   const numReviews = await tx.review.count({
    where: {productId: review.productId}
   });

   // Update the rating and the num reviews in the product table
   await tx.product.update({
    where: {id: review.productId},
    data: {
     rating: averageRating._avg.rating || 0,
     numReviews
    }
   })
  });

  revalidatePath(`/product/${product.slug}`);

  return{
   success: true,
   message: 'Review updated successfully'
  }
 } catch (error) {
  return {
   success: false,
   message: formatError(error)
  }
 }
}