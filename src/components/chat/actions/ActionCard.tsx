import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ActionCardProps = {
  data: Record<string, unknown>;
};

export function ActionCard({ data }: ActionCardProps) {
  const amount = (data.amount as number | string) ?? 0;
  const type = (data.type as string) ?? "expense";
  const category = (data.category as string) ?? "";
  const date = (data.date as string) ?? "";
  const description = (data.description as string) ?? "";

  const isIncome = type === "income";
  const formattedAmount = typeof amount === "number" ? `$${amount.toFixed(2)}` : `$${amount}`;

  return (
    <Card className="border-l-4 border-l-gold-500 my-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{isIncome ? "📈" : "📉"}</span>
            <span className="font-semibold">{category || "Uncategorized"}</span>
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
