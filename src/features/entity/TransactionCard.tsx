import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type TransactionCardProps = {
  id: string;
  type: string;
  amount: number;
  date: string;
  description: string | null;
  categoryId: string | null;
  categoryName?: string;
  categoryIcon?: string;
  receiptUrl: string | null;
};

export function TransactionCard({ type, amount, date, description, categoryName, categoryIcon, receiptUrl }: TransactionCardProps) {
  const isIncome = type === "income";
  const formattedAmount = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
  const formattedDate = new Date(date).toLocaleDateString();

  return (
    <Card
      className={`border-l-4 hover:shadow-md transition-shadow cursor-pointer ${
        isIncome ? "border-l-green-500" : "border-l-red-500"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {categoryIcon && <span className="text-lg">{categoryIcon}</span>}
              {categoryName && (
                <Badge variant="secondary" className="text-xs">
                  {categoryName}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground truncate">{description}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">{formattedDate}</p>
          </div>
          <span
            className={`text-lg font-semibold flex-shrink-0 ${
              isIncome ? "text-green-600" : "text-red-600"
            }`}
          >
            {isIncome ? "+" : "-"}{formattedAmount}
          </span>
        </div>
        {receiptUrl && (
          <div className="mt-2">
            <img src={receiptUrl} alt="Receipt" className="h-12 w-12 rounded object-cover border" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
