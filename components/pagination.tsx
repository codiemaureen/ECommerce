'use client';
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";

type PaginationProps = {
 page: number | string;
 totalPages: number;
 urlParamName?: string;
}

const Pagination = ({page, totalPages, UrlParamName}: PaginationProps) => {
 const router =useRouter();
 const searchParams = useSearchParams();

 return ( 
  <div className="flex gap-2">
   <Button size="lg" variant="outline" className="w-28" disabled={Number(page) <= 1}>
    Previous
   </Button>
   <Button size="lg" variant="outline" className="w-28" disabled={Number(page) >= totalPages}>
    Next
   </Button>
  </div>
  );
}
 
export default Pagination;
