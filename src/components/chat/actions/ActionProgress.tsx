import { Card, CardContent } from "@/components/ui/card";

type ActionProgressProps = {
  data: Record<string, unknown>;
};

export function ActionProgress({ data }: ActionProgressProps) {
  const current = (data.current as number) ?? 0;
  const target = (data.target as number) ?? 100;
  const label = (data.label as string) ?? "";

  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <Card className="my-2">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1">
          {label && <span className="text-sm font-medium">{label}</span>}
          <span className="text-sm text-muted-foreground">{percentage.toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gold-500 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          ${typeof current === "number" ? current.toFixed(2) : current} / ${typeof target === "number" ? target.toFixed(2) : target}
        </p>
      </CardContent>
    </Card>
  );
}
