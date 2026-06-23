export type ActionType =
  | "Card"
  | "Table"
  | "Chart"
  | "Progress"
  | "Alert"
  | "List"
  | "Image"
  | "Divider"
  | "Insight"
  | "Button";

export type ActionBlock = {
  type: ActionType | "Unknown";
  content: string;
  parsed?: Record<string, unknown> | string[] | string;
};

export type ParsedSegment =
  | { kind: "text"; content: string }
  | { kind: "action"; action: ActionBlock };

const ACTION_REGEX = /@#=_?([A-Za-z]+)=>([\s\S]*?)<=_?\1=#@/g;
const VALID_ACTIONS: ActionType[] = [
  "Card",
  "Table",
  "Chart",
  "Progress",
  "Alert",
  "List",
  "Image",
  "Divider",
  "Insight",
  "Button",
];

export function parseActions(text: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  ACTION_REGEX.lastIndex = 0;

  while ((match = ACTION_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ kind: "text", content: text.slice(lastIndex, match.index) });
    }

    const rawType = match[1];
    if (rawType.toLowerCase() === "done") {
      lastIndex = match.index + match[0].length;
      continue;
    }

    const rawContent = match[2].trim();
    const type = VALID_ACTIONS.includes(rawType as ActionType) ? (rawType as ActionType) : "Unknown";

    const parsed = parseActionContent(type, rawContent);

    segments.push({
      kind: "action",
      action: { type, content: rawContent, parsed },
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ kind: "text", content: text.slice(lastIndex) });
  }

  return segments;
}

type ParserState = "TEXT" | "DETECTING_ACTION" | "PARSING_ACTION";

export class StreamingActionParser {
  private state: ParserState = "TEXT";
  private buffer = "";
  private actionType = "";
  private actionContent = "";
  private readonly markers = ["@#=_", "@#="];

  feed(chunk: string): ParsedSegment[] {
    const newSegments: ParsedSegment[] = [];

    for (const char of chunk) {
      this.buffer += char;

      if (this.state === "TEXT") {
        const marker = this.markers.find((item) => this.buffer.endsWith(item));
        if (marker) {
          const textBefore = this.buffer.slice(0, -marker.length);
          if (textBefore.length > 0) {
            newSegments.push({ kind: "text", content: textBefore });
          }
          this.state = "DETECTING_ACTION";
          this.actionType = "";
          this.actionContent = "";
          this.buffer = "";
        } else if (this.buffer.length > 4) {
          const safeText = this.buffer.slice(0, -4);
          if (safeText.length > 0) {
            newSegments.push({ kind: "text", content: safeText });
          }
          this.buffer = this.buffer.slice(-4);
        }
      } else if (this.state === "DETECTING_ACTION") {
        this.actionType += char;
        if (this.actionType.endsWith("=>")) {
          this.actionType = this.actionType.slice(0, -2);
          this.state = "PARSING_ACTION";
          this.buffer = "";
        } else if (this.actionType.length > 20) {
          newSegments.push({ kind: "text", content: "@#=" + this.actionType });
          this.state = "TEXT";
          this.buffer = "";
          this.actionType = "";
        }
      } else if (this.state === "PARSING_ACTION") {
        this.actionContent += char;
        const closeMarker = [`<=${this.actionType}=#@`, `<=_${this.actionType}=#@`]
          .find((item) => this.actionContent.endsWith(item));
        if (closeMarker) {
          const content = this.actionContent.slice(0, -closeMarker.length).trim();
          const type = VALID_ACTIONS.includes(this.actionType as ActionType)
            ? (this.actionType as ActionType)
            : "Unknown";

          if (this.actionType.toLowerCase() === "done") {
            this.state = "TEXT";
            this.buffer = "";
            this.actionType = "";
            this.actionContent = "";
            continue;
          }

          const parsed = parseActionContent(type, content);

          newSegments.push({
            kind: "action",
            action: { type, content, parsed },
          });

          this.state = "TEXT";
          this.buffer = "";
          this.actionType = "";
          this.actionContent = "";
        }
      }
    }

    return newSegments;
  }

  flush(): ParsedSegment[] {
    const newSegments: ParsedSegment[] = [];

    if (this.state === "TEXT" && this.buffer.length > 0) {
      newSegments.push({ kind: "text", content: this.buffer });
    } else if (this.state === "DETECTING_ACTION" || this.state === "PARSING_ACTION") {
      const raw = "@#=" + this.actionType + "=>" + this.actionContent;
      newSegments.push({ kind: "text", content: raw });
    }

    this.state = "TEXT";
    this.buffer = "";
    this.actionType = "";
    this.actionContent = "";

    return newSegments;
  }

  reset(): void {
    this.state = "TEXT";
    this.buffer = "";
    this.actionType = "";
    this.actionContent = "";
  }
}

function parseActionContent(
  type: ActionType | "Unknown",
  content: string,
): Record<string, unknown> | string[] | string | undefined {
  if (["Card", "Table", "Chart", "Progress", "Button", "Alert"].includes(type)) {
    try {
      return JSON.parse(content) as Record<string, unknown>;
    } catch {
      return type === "Alert" ? content : undefined;
    }
  }

  if (type === "List") {
    return content.split("\n").filter((line) => line.trim().length > 0);
  }

  if (type === "Image" || type === "Insight") {
    return content;
  }

  if (type === "Divider") {
    return [];
  }

  return undefined;
}
