import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrderBySummary } from "@/lib/action/order.actions";
import { formatCurrency } from "@/lib/utils";
import { BadgeDollarSign } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Admin Overview '
}

const AdminOverviewPage = async () => {
  const session = await auth();

  if(session.user.role !== 'admin') throw new Error('User is not authorized');

  const summary = await getOrderBySummary();

  return ( 
    <div className="space-y-2">
      <h1 className="h2-bold">
        Dashboard
      </h1>
      <div className="grid gap-4 md:grid-cols-1:lg grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BadgeDollarSign />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalSales._sum.totalPrice?.toString() || 0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>



  );
}

export default AdminOverviewPage;