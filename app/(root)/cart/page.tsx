import CartTable from "./cart-table";
import { cookies } from "next/headers";
import { getMyCart } from "@/lib/action/cart.actions";

export const metadata = {
 title: 'Shopping Cart'
}

const CartPage = async () => {
 const cookieStore = await cookies();
 const sessionCartId = cookieStore.get("sessionCartId")?.value;
 const cart = await getMyCart(sessionCartId);

 return ( 
  <>
   <CartTable cart={cart}/>
  </>
  );
}
 
export default CartPage;