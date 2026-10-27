// Prompts enviados à IA. Diretrizes na seção 8.2 do SPEC.

export type Clarification = { question: string; answer: string | null };

export type AiContext = {
  profile: { goals: string; current_situation: string; constraints: string } | null;
  problem: { title: string; description: string; clarifications: Clarification[] };
  today: string; // AAAA-MM-DD
};

export const SYSTEM_PROMPT = `Você ajuda uma pessoa a pensar sobre um problema da vida real e a tomar uma decisão.

Regras:
- Responda sempre em português do Brasil.
- Seja honesto e direto. Aponte riscos e pontos fracos, inclusive das ideias do próprio usuário.
- Leve em conta o perfil e as restrições do usuário. Não sugira o que for inviável para ele.
- Não decida pelo usuário: apresente caminhos e trade-offs.
- Responda apenas no formato JSON pedido.`;

const EMPTY = "(não informado)";

function orEmpty(value: string | undefined) {
  return value?.trim() || EMPTY;
}

// Monta o contexto comum a todas as chamadas (SPEC, seção 8.1).
// Perguntas puladas ou ainda sem resposta ficam de fora.
export function buildContext({ profile, problem, today }: AiContext) {
  const answered = problem.clarifications.filter((c) => c.answer?.trim());

  const lines = [
    `Data de hoje: ${today}`,
    "",
    "## Perfil do usuário",
    `Objetivos: ${orEmpty(profile?.goals)}`,
    `Situação atual: ${orEmpty(profile?.current_situation)}`,
    `Restrições: ${orEmpty(profile?.constraints)}`,
    "",
    "## Problema",
    `Título: ${problem.title}`,
    `Descrição: ${problem.description}`,
  ];

  if (answered.length > 0) {
    lines.push("", "## Esclarecimentos do usuário");
    for (const { question, answer } of answered) {
      lines.push(`P: ${question}`, `R: ${answer!.trim()}`);
    }
  }

  return lines.join("\n");
}

export function clarifyPrompt(context: AiContext) {
  return `${buildContext(context)}

## Tarefa
Decida se falta alguma informação importante para sugerir boas opções para este problema.
- Se o problema já está claro o suficiente, responda needs_clarification = false e questions vazio.
- Se falta algo essencial, faça no máximo 3 perguntas curtas, uma ideia por pergunta.
- Não pergunte o que já está no perfil ou na descrição.`;
}

export function optionsPrompt(context: AiContext, existing: { title: string; summary: string }[]) {
  const avoid =
    existing.length > 0
      ? `\n\nO usuário já tem estas opções. Não as repita nem sugira variações delas:\n${existing
          .map((o) => `- ${o.title}: ${o.summary}`)
          .join("\n")}`
      : "";

  return `${buildContext(context)}

## Tarefa
Sugira de 3 a 4 opções para resolver este problema.
- As opções devem ser realmente diferentes entre si, não variações da mesma ideia.
- Cada opção tem um título de até 60 caracteres e um resumo de 1 a 3 frases.
- Respeite as restrições do perfil.${avoid}`;
}
