import { z } from "zod";
import { insertProductSchema, 
         insertCartSchema, 
         cartItemSchema, 
         shippingAddressSchema,
         insertOrderItemSchema,
         insertOrderSchema} from "@/lib/validators";


export type AuthActionState = {
 success: boolean;
 message: string;
};

export type Product = z.infer<typeof insertProductSchema> & {
 id: string;
 rating: string;
 numReviews: number;
 createdAt: Date;
}

export type Cart = z.infer<typeof insertCartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>
export type OrderItem = z.infer<typeof insertOrderItemSchema>
export type Order = z.infer<typeof insertOrderSchema>