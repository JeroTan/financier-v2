import { Card, CardContent } from "@/components/ui/card";

type ActionInsightProps = {
  data: string | Record<string, unknown>;
};

export function ActionInsight({ data }: ActionInsightProps) {
  let text = "";

  if (typeof data === "string") {
    text = data;
  } else {
    text = (data.text as string) ?? "";
  }

  if (!text) return null;

  return (
    <Card className="my-2 border-l-4 border-l-gold-500 bg-gold-500/5">
      <CardContent className="p-3 flex items-start gap-2">
        <span className="text-lg">💡</span>
        <p className="text-sm italic text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}
