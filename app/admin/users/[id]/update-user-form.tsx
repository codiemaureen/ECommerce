'use client';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { updateUserSchema } from "@/lib/validators";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { USER_ROLES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

const UpdateUserForm = ({user} : {
 user: z.infer<typeof updateUserSchema>
}) => {
 const form = useForm<z.infer<typeof updateUserSchema>>({
  resolver: zodResolver(updateUserSchema),
  defaultValues: user
 });

 const submitHandler = () => {
  return;
 }

 return ( 
   <Form {...form}>
    <form method="POST" onSubmit={form.handleSubmit(submitHandler)}>
     {/* email */}
      <div className="flex flex-col md:flex-row gap-5 items-start py-2">
          <FormField
            control={form.control}
            name="email"
            disabled={true}
            render={({ field } : {
             field: ControllerRenderProps<
              z.infer<typeof updateUserSchema>, 'email'
             >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter user email..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
         {/* name */}
        <div className="flex flex-col md:flex-row gap-5 items-start py-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field } : {
             field: ControllerRenderProps<
              z.infer<typeof updateUserSchema>, 'name'
             >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter user name..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
         </div>
         {/* role */}
        <div className="flex flex-col md:flex-row gap-5 items-start py-2">
          <FormField
            control={form.control}
            name='role'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof updateUserSchema>,
                'role'
              >;
            }) => (
              <FormItem className='w-full'>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder='Select a role'>
                        {field.value && (field.value.charAt(0).toUpperCase() + field.value.slice(1))}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {USER_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-between mt-4">
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
             {form.formState.isSubmitting ? 'Submitting...' : 'Update User'}
            </Button>
        </div>
    </form>
   </Form>
  );
}
 
export default UpdateUserForm;