import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type GoalCardProps = {
  id: string;
  label: string;
  current: number;
  target: number;
  icon?: string;
  onDelete?: (id: string) => void;
};

export function GoalCard({ id, label, current, target, icon, onDelete }: GoalCardProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {icon && <span>{icon}</span>}
            {label}
          </CardTitle>
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={() => onDelete(id)} className="h-6 w-6 p-0">
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={percentage} className="h-2" />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>${current.toFixed(2)}</span>
          <span>${target.toFixed(2)}</span>
        </div>
        <p className="text-xs text-center mt-1 text-gold-600">{percentage.toFixed(0)}%</p>
      </CardContent>
    </Card>
  );
}
