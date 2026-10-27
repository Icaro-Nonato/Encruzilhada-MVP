import { describe, expect, it } from "vitest";
import { parseStatus } from "./problem-status";

describe("parseStatus", () => {
  it("aceita status válidos", () => {
    expect(parseStatus("decided")).toBe("decided");
  });

  it("usa 'open' para valores ausentes ou desconhecidos", () => {
    expect(parseStatus(undefined)).toBe("open");
    expect(parseStatus("qualquer")).toBe("open");
    expect(parseStatus(["resolved"])).toBe("open");
  });
});
