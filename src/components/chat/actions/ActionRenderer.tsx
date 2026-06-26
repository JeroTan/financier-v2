import { isCompletionMetadataPayload, type ParsedSegment } from "@/lib/chat/actionParser";
import { MarkdownText } from "@/components/ui/MarkdownText";
import { ActionCard } from "./ActionCard";
import { ActionTable } from "./ActionTable";
import { ActionChart } from "./ActionChart";
import { ActionProgress } from "./ActionProgress";
import { ActionAlert } from "./ActionAlert";
import { ActionList } from "./ActionList";
import { ActionImage } from "./ActionImage";
import { ActionDivider } from "./ActionDivider";
import { ActionInsight } from "./ActionInsight";
import { ActionButton, type ButtonDef } from "./ActionButton";

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
            <MarkdownText key={i} className="text-sm">
              {segment.content}
            </MarkdownText>
          );
        }

        const { action } = segment;

        if (action.type === "Unknown" || !action.parsed) {
          if (isCompletionMetadataPayload(action.content)) return null;

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
            return <ActionButton key={i} data={action.parsed as Record<string, unknown> | ButtonDef[]} onClick={onActionClick} />;
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
