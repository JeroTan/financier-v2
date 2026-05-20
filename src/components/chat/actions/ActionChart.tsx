import { Card, CardContent } from "@/components/ui/card";

type ActionChartProps = {
  data: Record<string, unknown>;
};

export function ActionChart({ data }: ActionChartProps) {
  const points = (data.points as number[]) ?? [];
  const label = (data.label as string) ?? "";

  if (points.length === 0) return null;

  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const height = 40;
  const width = 200;
  const stepX = width / (points.length - 1 || 1);

  const pathPoints = points.map((p, i) => {
    const x = i * stepX;
    const y = height - ((p - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const pathD = `M ${pathPoints.join(" L ")}`;

  return (
    <Card className="my-2">
      <CardContent className="p-3">
        {label && <p className="text-sm font-medium mb-2">{label}</p>}
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-10" preserveAspectRatio="none">
          <path d={pathD} fill="none" stroke="hsl(var(--gold-500))" strokeWidth="2" />
        </svg>
      </CardContent>
    </Card>
  );
}
