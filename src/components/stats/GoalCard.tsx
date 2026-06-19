import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, X } from "lucide-react";

type GoalCardProps = {
  id: string;
  label: string;
  current: number;
  target: number;
  icon?: string;
  onDelete?: (id: string) => void;
};

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
}).format(amount);

export function GoalCard({ id, label, current, target, icon, onDelete }: GoalCardProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <Card className="rounded-lg border-outline-variant shadow-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-fixed text-on-primary-fixed">
              {icon ? <span aria-hidden="true">{icon}</span> : <Target className="h-4 w-4" aria-hidden="true" />}
            </span>
            {label}
          </CardTitle>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(id)}
              className="h-8 w-8 p-0"
              aria-label={`Delete ${label} goal`}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={percentage} className="h-2" />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{formatCurrency(current)}</span>
          <span>{formatCurrency(target)}</span>
        </div>
        <p className="mt-1 text-center text-xs font-semibold text-primary">{percentage.toFixed(0)}%</p>
      </CardContent>
    </Card>
  );
}
