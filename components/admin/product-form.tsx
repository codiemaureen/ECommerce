'use client';

import { productDefaultValues } from "@/lib/constants";
import { insertProductSchema, updateProductSchema } from "@/lib/validators";
import { Product } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, ControllerRenderProps, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import slugify from 'slugify';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { createProduct, updateProduct } from "@/lib/action/product.actions";

const ProductForm = ({type, product, productId}: {
  type: 'Create' | 'Update';
  product?: Product;
  productId?: string;
  }) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof insertProductSchema>>({
    resolver: type === 'Update' ? zodResolver(updateProductSchema) : zodResolver(insertProductSchema),
    defaultValues: product && type === 'Update' ? product : productDefaultValues,
  })

  const onSubmit:SubmitHandler<z.infer<typeof insertProductSchema>> = async (values) => {
    if(type === 'Create'){
      const res = await createProduct(values);

      if(!res.success){
          toast.error(res.message)
      } else {
        toast.success(res.message)
        router.push('/admin/products')
      }
    }
    // on update
    if(type === 'Update'){
      if(!productId){
        router.push(`/admin/products`)
        return;
      }
      const res = await updateProduct({...values, id: productId});

      if(!res.success){
          toast.error(res.message)
      } else {
        toast.success(res.message)
        router.push('/admin/products')
      }
    }
  }


  return ( 
    <Form {...form}>
      <form 
        method="POST"
        className="space-y-8"
        onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col md:flex-row gap-5 items-start">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Product name..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Slug Field + Button */}
          <div className="w-full">
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Product slug..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              className="mt-2 bg-gray-500 hover:bg-amber-300 text-white"
              onClick={() =>
                form.setValue("slug", slugify(form.getValues("name"), { lower: true }))
              }
            >
              Generate
            </Button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-5">
        {/* Category */}
        <FormField
          control={form.control}
          name='category'
          render={({field}: {field: ControllerRenderProps<z.infer<typeof insertProductSchema>, 'category'>}) => (
            <FormItem className="w-full">
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="Enter Category..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}/>
        {/* Brand */}
        <FormField
          control={form.control}
          name='brand'
          render={({field}: {field: ControllerRenderProps<z.infer<typeof insertProductSchema>, 'brand'>}) => (
            <FormItem className="w-full">
              <FormLabel>Brand</FormLabel>
              <FormControl>
                <Input placeholder="Enter Brand..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}/>
        </div>
        <div className="flex flex-col md:flex-row gap-5">
        {/* Price */}
        <FormField
          control={form.control}
          name='price'
          render={({field}: {field: ControllerRenderProps<z.infer<typeof insertProductSchema>, 'price'>}) => (
            <FormItem className="w-full">
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input placeholder="Enter Product Price..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}/>
        {/* Stock */}
        <FormField
          control={form.control}
          name='stock'
          render={({field}: {field: ControllerRenderProps<z.infer<typeof insertProductSchema>, 'stock'>}) => (
            <FormItem className="w-full">
              <FormLabel>Stock</FormLabel>
              <FormControl>
                <Input placeholder="Enter Product Stock..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}/>
        </div>
        <div className="upload-field flex flex-col md:flex-row gap-5">
        {/* Images */}
        
        </div>
        <div className="upload-field">
        {/* isfeatured */}
        </div>
        <div>
        {/* description */}
        <FormField
          control={form.control}
          name='description'
          render={({field}: {field: ControllerRenderProps<z.infer<typeof insertProductSchema>, 'description'>}) => (
            <FormItem className="w-full">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter Product Description..." {...field} className="resize none"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}/>
        </div>
        <div>
        {/* submit button */}
        <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="button col-span-2 w-full">
          {form.formState.isSubmitting ? 'Submitting' : `${type} Product`}
        </Button>
        </div>
      </form>
    </Form>
    );
}
 
export default ProductForm;