import { getProductBySlug } from "@/lib/action/product.actions";
import ProductPrice from "@/components/product/product-price";
import ProductImages from "@/components/product/product-images";
import AddToCart from "@/components/product/add-to-cart";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";



const ProductDetailsPage = async(props: {
 params: Promise<{slug: string}>

}) => {
 const {slug} = await props.params;
 const product = await getProductBySlug(slug);
 if(!product) return notFound();

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
       <p>{product.rating} of {product.numReviews} Reviews</p>
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
            <AddToCart item={{
              productID:product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              qty: 1,
              image: product.images![0]
            }} />
           </div>
          )}
      </CardContent>
     </Card>
   </div>
  </section>
 </> );
}
 
export default ProductDetailsPage;