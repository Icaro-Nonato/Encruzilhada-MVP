import { z } from "zod";

// Formatos das respostas da IA (SPEC, seção 8.3). O AI SDK envia estes
// schemas para o modelo e valida a resposta antes de devolvê-la.

export const clarifySchema = z.object({
  needs_clarification: z.boolean(),
  questions: z
    .array(z.string().describe("Pergunta curta e direta, em português"))
    .max(3)
    .describe("No máximo 3 perguntas. Vazio se needs_clarification for false."),
});

export type ClarifyResult = z.infer<typeof clarifySchema>;

export const optionsSchema = z.object({
  options: z
    .array(
      z.object({
        title: z.string().max(60).describe("Título da opção, até 60 caracteres"),
        summary: z.string().describe("Resumo da opção em 1 a 3 frases"),
      }),
    )
    .min(3)
    .max(4),
});

export type OptionsResult = z.infer<typeof optionsSchema>;
