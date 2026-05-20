import type { ParsedSegment } from "@/lib/chat/actionParser";
import { ActionCard } from "./ActionCard";
import { ActionTable } from "./ActionTable";
import { ActionChart } from "./ActionChart";
import { ActionProgress } from "./ActionProgress";
import { ActionAlert } from "./ActionAlert";
import { ActionList } from "./ActionList";
import { ActionImage } from "./ActionImage";
import { ActionDivider } from "./ActionDivider";
import { ActionInsight } from "./ActionInsight";
import { ActionButton } from "./ActionButton";

type ActionRendererProps = {
  segments: ParsedSegment[];
  onActionClick?: (action: string) => void;
};

export function ActionRenderer({ segments, onActionClick }: ActionRendererProps) {
  return (
    <>
      {segments.map((segment, i) => {
        if (segment.kind === "text") {
          return (
            <span key={i} className="whitespace-pre-wrap">
              {segment.content}
            </span>
          );
        }

        const { action } = segment;

        if (action.type === "Unknown" || !action.parsed) {
          return (
            <pre key={i} className="text-xs bg-muted p-2 rounded my-1 overflow-x-auto">
              {action.content}
            </pre>
          );
        }

        switch (action.type) {
          case "Card":
            return <ActionCard key={i} data={action.parsed as Record<string, unknown>} />;
          case "Table":
            return <ActionTable key={i} data={action.parsed as Record<string, unknown>} />;
          case "Chart":
            return <ActionChart key={i} data={action.parsed as Record<string, unknown>} />;
          case "Progress":
            return <ActionProgress key={i} data={action.parsed as Record<string, unknown>} />;
          case "Alert":
            return <ActionAlert key={i} data={action.parsed as Record<string, unknown>} />;
          case "List":
            return <ActionList key={i} data={action.parsed as string[]} />;
          case "Image":
            return <ActionImage key={i} data={action.parsed as Record<string, unknown>} />;
          case "Divider":
            return <ActionDivider key={i} />;
          case "Insight":
            return <ActionInsight key={i} data={action.parsed as Record<string, unknown>} />;
          case "Button":
            return <ActionButton key={i} data={action.parsed as Record<string, unknown>} onClick={onActionClick} />;
          default:
            return (
              <span key={i} className="text-muted-foreground text-sm italic">
                [{action.type}: {action.content}]
              </span>
            );
        }
      })}
    </>
  );
}
