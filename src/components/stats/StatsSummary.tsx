import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type StatsSummaryProps = {
  totalIncome: number;
  totalExpenses: number;
  net: number;
  loading?: boolean;
};

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
}).format(amount);

export function StatsSummary({ totalIncome, totalExpenses, net, loading }: StatsSummaryProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-16" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Income</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">+{formatCurrency(totalIncome)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">-{formatCurrency(totalExpenses)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Net</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${net >= 0 ? "text-green-600" : "text-red-600"}`}>
            {net >= 0 ? "+" : ""}{formatCurrency(net)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
