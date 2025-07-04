'use client';

import { ShippingAddress } from "@/types";
import { shippingAddressSchema } from "@/lib/validators";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { ControllerRenderProps, useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { shippingAddressDefaultValues } from "@/lib/constants";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader } from "lucide-react";
import { updateUserAddress } from "@/lib/action/user.action";

const ShippingAddressForm = ({address}: {address: ShippingAddress}) => {
  const router =  useRouter();

  const form = useForm<z.infer<typeof shippingAddressSchema>>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: address || shippingAddressDefaultValues,
  })

  const [isPending, startTransition] =  useTransition();
  const onSubmit:SubmitHandler<z.infer<typeof shippingAddressSchema>> = async (values) =>{
    startTransition(async () => {
      const res = await updateUserAddress(values);

      if(!res) {
        toast.error(res.message)
        return;
      };
      router.push('/payment-method')
    })
    return;
  }
  
  return ( 
  <>
    <div className="max-w-md mx-auto space-y-4">
    <h1 className="h2-bold mt-4">
      Shipping Address
    </h1>
    <p className="text-sm text-muted-forground">
      Please enter your shipping address
    </p>
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-5">
            <FormField
            control={form.control}
              name="fullName"
              render={({ field }: {field: ControllerRenderProps<z.infer<typeof shippingAddressSchema>, 'fullName'>}) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-5">
            <FormField
              control={form.control}
              name="streetAddress"
              render={({ field }: {field: ControllerRenderProps<z.infer<typeof shippingAddressSchema>, 'streetAddress'>}) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-5">
            <FormField
              control={form.control}
              name="city"
              render={({ field }: {field: ControllerRenderProps<z.infer<typeof shippingAddressSchema>, 'city'>}) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-5">
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }: {field: ControllerRenderProps<z.infer<typeof shippingAddressSchema>, 'postalCode'>}) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Zip Code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-5">
            <FormField
              control={form.control}
              name="country"
              render={({ field }: {field: ControllerRenderProps<z.infer<typeof shippingAddressSchema>, 'country'>}) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-2">
          <Button 
            type="submit" 
            disabled={isPending}
            className="cursor-pointer">
            {isPending 
              ? (<Loader animate-spin='true' className="w-4 h-4"/>)
              : (<ArrowRight className="h-4 w-4" />)} Continue Checkout
            </Button>
          </div>
        </form>
      </Form>
    </div>
  </> );
}
 
export default ShippingAddressForm;