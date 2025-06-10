import { cn } from "@/lib/utils";

const ProductPrice = ({value, className} : {value: number; className?: string}) => {
 //enforcing two decimal
 const stringValue = value.toFixed(2);
 //get the integer and float
 const [dollarAmount, changeAmount] = stringValue.split('.');;
 return ( 
  <>
   <p className={cn('text-2xl', className)}>
    <span className="text-xs align-super">${dollarAmount}</span>
    <span className="text-xs align-super">.{changeAmount}</span>
   </p>
  </>
  );
}
 
export default ProductPrice;