import { Button } from "@/components/ui/button";

export type ButtonDef = {
  label: string;
  action?: string;
  variant?: "default" | "secondary" | "outline" | "destructive";
};

type ActionButtonProps = {
  data: Record<string, unknown> | ButtonDef[];
  onClick?: (action: string) => void;
};

export function ActionButton({ data, onClick }: ActionButtonProps) {
  let buttons: ButtonDef[] = [];

  if (Array.isArray(data)) {
    buttons = data as ButtonDef[];
  } else {
    const label = (data.label as string) ?? "";
    const action = (data.action as string) ?? label;
    const variant = (data.variant as ButtonDef["variant"]) ?? "default";
    buttons = [{ label, action, variant }];
  }

  buttons = buttons.filter((button) => button.label?.trim());

  if (buttons.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 my-2">
      {buttons.map((btn, i) => (
        <Button
          key={i}
          type="button"
          variant={btn.variant ?? "default"}
          size="sm"
          disabled={!onClick}
          onClick={() => onClick?.(btn.action ?? btn.label)}
        >
          {btn.label}
        </Button>
      ))}
    </div>
  );
}
