import { getProductBySlug } from "@/lib/action/product.actions";
import { notFound } from "next/navigation";

const ProductDetailsPage = async(props: {
 params: Promise<{slug: string}>

}) => {
 const {slug} = await props.params;
 const product = await getProductBySlug(slug);
 if(!product) return notFound();

 return ( <>{product.name}</> );
}
 
export default ProductDetailsPage;