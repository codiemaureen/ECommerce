import { getProductBySlug } from "@/lib/action/product.actions";
import ProductPrice from "@/components/shared/product/product-price";
import ProductImages from "@/components/shared/product/product-images";
import AddToCart from "@/components/shared/product/add-to-cart";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getMyCart } from "@/lib/action/cart.actions";
import { cookies } from "next/headers";
import ReviewList from "./review-list";
import { auth } from "@/auth";
import Rating from "@/components/shared/product/rating";


const ProductDetailsPage = async(props: {
  params: Promise<{slug: string}>

}) => {
  const {slug} = await props.params;
  const product = await getProductBySlug(slug);
  if(!product) return notFound();

  const session = await auth();
  const userId = session?.user?.id;
  
  const cookieStore =  await cookies();
  const sessionCartId = cookieStore.get("sessionCartId")?.value;
  const cart = await getMyCart(sessionCartId);

  return ( <>
    <section>
    <div className="grid-grid-cols-1 md:grid-cols-5">
      {/* images column */}
      <div className="cols-span-2">
      <ProductImages images={product.images}/>
      </div>
      {/* datails column */}
      <div className="cols-span-2 p-5">
        <div className="flex-flex-col gap-6">
        <p>{product.brand} {product.category}</p>
        <h1 className="h3-bold">{product.name}</h1>
        <Rating value={Number(product.rating)} />
        <p>{product.numReviews}</p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <ProductPrice 
          className="w-24 rounded-full bg-green-100 text-green-700 px-5 py-2"
          value={Number(product.price)}/>
        </div>
        </div>
        <div className="mt-10">
        <p className="semi-bold">Description</p>
        <p>{product.description}</p>
        </div>
      </div>
      {/* action column */}
      <Card>
        <CardContent
        className="p-4">
          <div
          className="mb-2 flex justify-between">
            <div>Price</div>
            <div>
            <ProductPrice value={Number(product.price)}/>
            </div>
          </div>
          <div
            className="mb-2 flex justify-between">
            <div>Status</div>
            {product.stock > 0 ? (<Badge variant="outline">In Stock</Badge>) : (
              <Badge variant="destructive">Out of Stock</Badge>)}
            </div>
            {product.stock > 0 && (
            <div className="flex-center">
              <AddToCart 
                cart={cart}
                item={{
                  productID:product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  qty: 1,
                  image: product.images![0]
                }}
              />
            </div>
            )}
        </CardContent>
      </Card>
    </div>
    </section>
    <section className="mt-10">
      <h2 className="h2-bold">
        <ReviewList
          userId={userId || ''}
          productId={product.id}
          productSlug={product.slug} />
      </h2>
    </section>
  </> );
}

export default ProductDetailsPage;