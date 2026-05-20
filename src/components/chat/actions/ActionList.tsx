import { Card, CardContent } from "@/components/ui/card";

type ActionListProps = {
  data: string[] | Record<string, unknown>;
};

export function ActionList({ data }: ActionListProps) {
  let items: string[] = [];

  if (Array.isArray(data)) {
    items = data;
  } else if (typeof data === "object" && data !== null) {
    items = (data.items as string[]) ?? Object.values(data).map(String);
  }

  if (items.length === 0) return null;

  return (
    <Card className="my-2">
      <CardContent className="p-3">
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="text-gold-500 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
