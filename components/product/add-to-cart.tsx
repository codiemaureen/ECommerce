'use client'; 

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CartItem } from "@/types";
import { addItemToCart } from "@/lib/action/cart.actions";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";



const AddToCart = ({item}: {item: CartItem}) => {
 const router = useRouter();

 const handleAddToCart = async () => {
  const res = await addItemToCart(item);

  if(!res.success){
   return toast.error('Error adding item to cart')
  }
  return toast.success(`${res.message}`,
   {
    action: {
     label: "Go to Cart",
     onClick: () => {
      router.push('/cart')
     }
    },
    className: 'bg-primary text-white hover:bg-gray-800'
   }
  )
 }

 return (
  <Button 
   className="w-full" 
   type="button" 
   onClick={handleAddToCart}>
    <Plus/> Add to Cart
  </Button>

   );
}
 
export default AddToCart;