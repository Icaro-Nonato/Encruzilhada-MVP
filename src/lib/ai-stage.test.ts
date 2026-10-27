import { describe, expect, it } from "vitest";
import { getAiStage } from "./ai-stage";

describe("getAiStage", () => {
  it("problema novo: pergunta à IA", () => {
    expect(getAiStage([], 0)).toEqual({ kind: "check" });
  });

  it("perguntas sem resposta: mostra o formulário", () => {
    expect(getAiStage([{ question: "Prazo?", answer: null }], 0)).toEqual({
      kind: "questions",
      questions: ["Prazo?"],
    });
  });

  it("perguntas respondidas ou puladas, sem opções: falta gerar opções", () => {
    expect(getAiStage([{ question: "Prazo?", answer: "" }], 0)).toEqual({ kind: "need-options" });
  });

  it("com opções: mostra a lista", () => {
    expect(getAiStage([{ question: "Prazo?", answer: null }], 3)).toEqual({ kind: "has-options" });
  });
});
