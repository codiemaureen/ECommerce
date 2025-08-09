'use client';

import { Review } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReviewForm from "./review-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getReviews } from "@/lib/action/review.actions";
import { Calendar, UserIcon } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import Rating from "@/components/shared/product/rating";

const ReviewList = ({userId, productId, productSlug}: {
  userId: string,
  productId: string,
  productSlug: string
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  const reload = () =>  {
  console.log(`reloading`);
  };

    useEffect(() => {
    const loadReviews = async () => {
      const res = await getReviews({productId});
      setReviews(res.data)
    }

    loadReviews();
  },[productId]);
  return ( 
    <div className='space-y-4'>
      {reviews.length === 0 && <div>No reviews yet</div>}
      {userId ? (
        <ReviewForm
          userId={userId}
          productId={productId}
          onReviewSubmitted={reload}
        />
      ) : (
        <div>
          Please
          <Link
            className='text-blue-700 px-2'
            href={`/sign-in?callbackUrl=/product/${productSlug}`}
          >
            sign in
          </Link>
          to write a review
        </div>
      )}
      <div className="flex flex-cols">
        {reviews.map((review) => (
          <Card key={review.id} className="w-full">
            <CardHeader>
              <div>
                <CardTitle>{review.title}</CardTitle>
              </div>
              <CardDescription>
                {review.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 text-sm text-muted-foreground">
                <Rating value={review.rating} />
                <div className="flex items-center">
                  <UserIcon className="mr-1 h-3 w-3"/>
                    {review.user ? review.user.name: 'User'}
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3"/>
                  {formatDateTime(review.createdAt).dateTime}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div> 
  );
}

export default ReviewList;