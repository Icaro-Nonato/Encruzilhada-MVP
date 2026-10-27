import { hasPendingQuestions } from "@/lib/validation/clarifications";

// Em que ponto do fluxo de IA o problema está (ver components/ai-flow.tsx).
export type AiStage =
  | { kind: "check" } // nada feito ainda: perguntar à IA se falta informação
  | { kind: "questions"; questions: string[] } // perguntas aguardando resposta
  | { kind: "need-options" } // perguntas resolvidas, mas sem opções (ex.: erro antes)
  | { kind: "has-options" };

export function getAiStage(
  clarifications: { question: string; answer: string | null }[],
  optionCount: number,
): AiStage {
  if (optionCount > 0) return { kind: "has-options" };
  if (hasPendingQuestions(clarifications)) {
    return { kind: "questions", questions: clarifications.map((c) => c.question) };
  }
  if (clarifications.length > 0) return { kind: "need-options" };
  return { kind: "check" };
}
