import { z } from "zod";

// Formato de problems.clarifications. answer = null: ainda sem resposta;
// answer = "": o usuário pulou a pergunta.
export const clarificationsSchema = z.array(
  z.object({ question: z.string(), answer: z.string().nullable() }),
);

// Lê o JSON do banco com segurança: qualquer formato estranho vira lista vazia.
export function parseClarifications(value: unknown) {
  const parsed = clarificationsSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function hasPendingQuestions(clarifications: { answer: string | null }[]) {
  return clarifications.some((c) => c.answer === null);
}

// Respostas enviadas pelo formulário, na mesma ordem das perguntas.
// skip = true: o usuário pulou todas.
export const answersSchema = z.object({
  answers: z.array(z.string().trim().max(1000, "Use no máximo 1000 caracteres por resposta.")),
  skip: z.boolean(),
});
