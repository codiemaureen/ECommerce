'use client';

import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { createOrder } from "@/lib/action/order.actions";
import { Check, Loader } from "lucide-react";

const PlaceOrderForm = () => {
  const router = useRouter();
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const res = await createOrder();
    if(res.redirectTo){
      console.log('response',res)
    router.push(res.redirectTo)
    }
  }
  const PlaceOrderButton = () => {
    const {pending} = useFormStatus();
    return(
    <Button disabled={pending} type="submit" className="w-full">
      {pending ? (<Loader
      className="w-4 h-4" animate-spin="true" />) : (<Check className="w-4 h-4" animate-spin="true" />)}{' '} Place Order
    </Button>
    )
  }
  return ( 
    <form 
    onSubmit={handleSubmit}
    className="w-full">
      <PlaceOrderButton />
    </form>
  );
}

export default PlaceOrderForm;