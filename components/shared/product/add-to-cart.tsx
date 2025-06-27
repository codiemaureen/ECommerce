'use client'; 

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Cart, CartItem } from "@/types";
import { addItemToCart, removeItemFromCart } from "@/lib/action/cart.actions";
import { Button } from "../../ui/button";
import { Plus, Minus, Loader } from "lucide-react";



const AddToCart = ({cart, item}: {cart?: Cart, item: CartItem}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();


  const handleAddToCart = async () => {
    startTransition(async () => {
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
    })
  };

  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productID)
      return res.success ? 
      toast.success(`${res.message}`,
        {
          action: {
          label: "Go to Cart",
          onClick: () => {
            router.push('/cart')
          }
          },
          className: 'bg-primary text-white hover:bg-gray-800'
        }
      ) : toast.error(`${res.message}`,      
        {
          action: {
          label: "Go to Cart",
          onClick: () => {
            router.push('/cart')
          }
          },
          className: 'bg-primary text-white hover:bg-gray-800'
        })
    })
  }


  const existItem = cart && cart.items.find((x) => x.productID === item.productID);

  return existItem ? (
    <div>
      <Button type='button' variant="outline" onClick={handleRemoveFromCart} className="cursor-pointer">
        {isPending ? (<Loader className="w-4 h-4" animate-spin/>) : (<Minus className="h-4 w-4"/>)}
      </Button>
      <span className="px-2">{existItem.qty}</span>
      <Button 
        className="cursor-pointer" 
        type="button" 
        onClick={handleAddToCart}>
        {isPending ? (<Loader className="w-4 h-4" animate-spin/>) : (<Plus className="h-4 w-4"/>)}
      </Button>
    </div>
  ) : 
  (
    <Button 
      className="w-full cursor-pointer" 
      type="button" 
      onClick={handleAddToCart}>
        {isPending ? (<Loader className="w-4 h-4" animate-spin/>) : (<Plus/>)}{' '} Add to Cart
    </Button>
  );
}

export default AddToCart;