import { Card, CardContent } from "@/components/ui/card";

type ActionAlertProps = {
  data: string | Record<string, unknown>;
};

const TYPE_COLORS: Record<string, string> = {
  info: "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  warning: "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  success: "border-green-500 bg-green-500/10 text-green-700 dark:text-green-300",
  error: "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300",
};

const TYPE_ICONS: Record<string, string> = {
  info: "ℹ️",
  warning: "⚠️",
  success: "✅",
  error: "❌",
};

export function ActionAlert({ data }: ActionAlertProps) {
  let text = "";
  let type = "info";

  if (typeof data === "string") {
    text = data;
  } else {
    text = (data.text as string) ?? "";
    type = (data.type as string) ?? "info";
  }

  const colorClass = TYPE_COLORS[type] ?? TYPE_COLORS.info;
  const icon = TYPE_ICONS[type] ?? TYPE_ICONS.info;

  return (
    <Card className={`my-2 border-l-4 ${colorClass}`}>
      <CardContent className="p-3 flex items-start gap-2">
        <span>{icon}</span>
        <p className="text-sm">{text}</p>
      </CardContent>
    </Card>
  );
}
