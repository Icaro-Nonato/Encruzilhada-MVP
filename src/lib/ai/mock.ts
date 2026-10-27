import type { ClarifyResult, OptionsResult } from "./schemas";

// Respostas falsas para desenvolver as telas sem gastar o limite gratuito
// (AI_MOCK=true). Precisam passar nos schemas de ai/schemas.ts.

export const MOCK_DELAY_MS = 1000;

export const mockClarify: ClarifyResult = {
  needs_clarification: true,
  questions: [
    "Qual é o prazo para você tomar essa decisão?",
    "O que mais te preocupa se der errado?",
  ],
};

const MOCK_OPTIONS: OptionsResult["options"] = [
  {
    title: "Manter tudo como está por mais 3 meses",
    summary: "Ganhar tempo para juntar informações antes de mudar. Reduz o risco, mas adia o problema.",
  },
  {
    title: "Mudar de uma vez",
    summary: "Tomar a decisão agora e se adaptar no caminho. Resolve rápido, com mais incerteza.",
  },
  {
    title: "Testar em pequena escala primeiro",
    summary: "Fazer um experimento curto e barato para ver como seria antes de se comprometer.",
  },
  {
    title: "Pedir a opinião de quem já passou por isso",
    summary: "Conversar com duas ou três pessoas que enfrentaram algo parecido antes de decidir.",
  },
];

// Alterna o começo da lista para "Gerar mais opções" não repetir tudo igual.
export function mockOptions(existingCount: number): OptionsResult {
  const start = existingCount % MOCK_OPTIONS.length;
  const rotated = [...MOCK_OPTIONS.slice(start), ...MOCK_OPTIONS.slice(0, start)];
  return {
    options: rotated.slice(0, 3).map((o) =>
      existingCount > 0 ? { ...o, title: `${o.title} (${existingCount + 1})`.slice(0, 60) } : o,
    ),
  };
}
