import { describe, expect, it } from "vitest";
import { buildContext, optionsPrompt, type AiContext } from "./prompts";

const context: AiContext = {
  profile: { goals: "Juntar dinheiro", current_situation: "", constraints: "Pouco tempo livre" },
  problem: {
    title: "Trocar de emprego?",
    description: "Recebi uma proposta.",
    clarifications: [
      { question: "Qual o prazo?", answer: "Duas semanas" },
      { question: "Pulada?", answer: "" },
      { question: "Sem resposta?", answer: null },
    ],
  },
  today: "2026-10-27",
};

describe("buildContext", () => {
  const text = buildContext(context);

  it("inclui data, perfil e problema", () => {
    expect(text).toContain("Data de hoje: 2026-10-27");
    expect(text).toContain("Objetivos: Juntar dinheiro");
    expect(text).toContain("Situação atual: (não informado)");
    expect(text).toContain("Restrições: Pouco tempo livre");
    expect(text).toContain("Título: Trocar de emprego?");
  });

  it("inclui só as perguntas respondidas", () => {
    expect(text).toContain("P: Qual o prazo?\nR: Duas semanas");
    expect(text).not.toContain("Pulada?");
    expect(text).not.toContain("Sem resposta?");
  });

  it("funciona sem perfil", () => {
    expect(buildContext({ ...context, profile: null })).toContain("Objetivos: (não informado)");
  });
});

describe("optionsPrompt", () => {
  it("lista as opções existentes para evitar repetição", () => {
    const prompt = optionsPrompt(context, [{ title: "Ficar", summary: "Continuar onde está." }]);
    expect(prompt).toContain("- Ficar: Continuar onde está.");
  });

  it("não menciona opções existentes quando não há nenhuma", () => {
    expect(optionsPrompt(context, [])).not.toContain("já tem estas opções");
  });
});
