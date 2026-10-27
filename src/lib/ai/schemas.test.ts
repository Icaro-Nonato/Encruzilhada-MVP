import { describe, expect, it } from "vitest";
import { mockClarify, mockOptions } from "./mock";
import { clarifySchema, optionsSchema } from "./schemas";

const option = { title: "Opção", summary: "Resumo curto." };

describe("clarifySchema", () => {
  it("aceita até 3 perguntas", () => {
    expect(clarifySchema.safeParse({ needs_clarification: true, questions: ["a", "b", "c"] }).success).toBe(true);
  });

  it("rejeita mais de 3 perguntas", () => {
    expect(
      clarifySchema.safeParse({ needs_clarification: true, questions: ["a", "b", "c", "d"] }).success,
    ).toBe(false);
  });
});

describe("optionsSchema", () => {
  it("aceita de 3 a 4 opções", () => {
    expect(optionsSchema.safeParse({ options: [option, option, option] }).success).toBe(true);
    expect(optionsSchema.safeParse({ options: [option, option, option, option] }).success).toBe(true);
  });

  it("rejeita 2 ou 5 opções", () => {
    expect(optionsSchema.safeParse({ options: [option, option] }).success).toBe(false);
    expect(optionsSchema.safeParse({ options: Array(5).fill(option) }).success).toBe(false);
  });

  it("rejeita título com mais de 60 caracteres", () => {
    const long = { ...option, title: "a".repeat(61) };
    expect(optionsSchema.safeParse({ options: [long, option, option] }).success).toBe(false);
  });
});

describe("mock", () => {
  it("as respostas falsas passam nos schemas", () => {
    expect(clarifySchema.safeParse(mockClarify).success).toBe(true);
    for (const existing of [0, 3, 7]) {
      expect(optionsSchema.safeParse(mockOptions(existing)).success).toBe(true);
    }
  });
});
