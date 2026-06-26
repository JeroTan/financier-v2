import { describe, expect, it } from "vitest";
import { parseActions } from "./actionParser";

describe("parseActions", () => {
  it("renders action blocks with strict prompt syntax", () => {
    expect(parseActions("Before @#=_Divider=> <=Divider=#@ After")).toEqual([
      { kind: "text", content: "Before " },
      { kind: "action", action: { type: "Divider", content: "", parsed: [] } },
      { kind: "text", content: " After" },
    ]);
  });

  it("accepts model output that misses the opening underscore", () => {
    expect(parseActions("@#=Divider=> <=Divider=#@")).toEqual([
      { kind: "action", action: { type: "Divider", content: "", parsed: [] } },
    ]);
  });

  it("drops stray done action blocks because SSE owns completion state", () => {
    expect(parseActions("Done @#=done=> {\"status\":\"normal\"} <=done=#@")).toEqual([
      { kind: "text", content: "Done " },
    ]);
  });

  it("drops status metadata variants from model text", () => {
    expect(parseActions("Text @#=_Status=> {\"status\":\"normal\"} <=Status=#@")).toEqual([
      { kind: "text", content: "Text " },
    ]);

    expect(parseActions("Text @#=_Done=> {\"status\":\"normal\"} <=done=#@")).toEqual([
      { kind: "text", content: "Text " },
    ]);

    expect(parseActions("Text\n{\"status\":\"normal\"}")).toEqual([
      { kind: "text", content: "Text" },
    ]);
  });

  it("parses alert and insight data", () => {
    expect(parseActions('@#=_Alert=> {"text":"Careful","type":"warning"} <=Alert=#@')).toEqual([
      { kind: "action", action: { type: "Alert", content: '{"text":"Careful","type":"warning"}', parsed: { text: "Careful", type: "warning" } } },
    ]);

    expect(parseActions("@#=_Insight=> Spend is up today <=Insight=#@")).toEqual([
      { kind: "action", action: { type: "Insight", content: "Spend is up today", parsed: "Spend is up today" } },
    ]);
  });
});
