import { describe, expect, it } from "vitest";
import { getModel, isMockMode } from "./client";

const env = { AI_PROVIDER: "google", AI_MODEL_FAST: "modelo-rapido", AI_MODEL_SMART: "modelo-forte" };

describe("getModel", () => {
  it("escolhe o modelo pelo tipo", () => {
    expect(getModel("fast", env).modelId).toBe("modelo-rapido");
    expect(getModel("smart", env).modelId).toBe("modelo-forte");
  });

  it("dá erro claro sem provedor válido", () => {
    expect(() => getModel("fast", { ...env, AI_PROVIDER: "outro" })).toThrow("AI_PROVIDER");
  });

  it("dá erro claro sem modelo", () => {
    expect(() => getModel("smart", { ...env, AI_MODEL_SMART: "" })).toThrow("AI_MODEL_SMART");
  });
});

describe("isMockMode", () => {
  it("só liga com AI_MOCK=true", () => {
    expect(isMockMode({ AI_MOCK: "true" })).toBe(true);
    expect(isMockMode({ AI_MOCK: "false" })).toBe(false);
    expect(isMockMode({})).toBe(false);
  });
});
