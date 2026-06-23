import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ActionCardProps = {
  data: Record<string, unknown>;
};

const formatCurrency = (amount: number | string) => {
  const value = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(value)) return String(amount);

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
};

export function ActionCard({ data }: ActionCardProps) {
  const amount = (data.amount as number | string) ?? 0;
  const type = (data.type as string) ?? "expense";
  const category = (data.category as string) ?? "";
  const date = (data.date as string) ?? "";
  const description = (data.description as string) ?? "";

  const isIncome = type === "income";
  const formattedAmount = formatCurrency(amount);
  const Icon = isIncome ? TrendingUp : TrendingDown;

  return (
    <Card className="border-l-4 border-l-gold-500 my-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span className="font-semibold">{category || "Other"}</span>
          </div>
          <Badge variant={isIncome ? "default" : "destructive"} className={isIncome ? "bg-green-600" : ""}>
            {isIncome ? "+" : "-"}{formattedAmount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {date && <p className="text-xs text-muted-foreground mt-1">{date}</p>}
      </CardContent>
    </Card>
  );
}
