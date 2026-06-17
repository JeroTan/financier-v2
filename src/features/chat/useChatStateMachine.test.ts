import { describe, expect, it } from "vitest";
import { nextChatState } from "./useChatStateMachine";

describe("chat state machine", () => {
  it("starts a send from idle", () => {
    expect(nextChatState("idle", "send")).toBe("loading");
  });

  it("streams and completes a response", () => {
    expect(nextChatState("loading", "response")).toBe("streaming");
    expect(nextChatState("streaming", "done")).toBe("idle");
  });

  it("resets after an error", () => {
    expect(nextChatState("error", "reset")).toBe("idle");
  });
});
