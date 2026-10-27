import { z } from "zod";

export const userOptionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "O título precisa ter pelo menos 3 caracteres.")
    .max(60, "O título pode ter no máximo 60 caracteres."),
  summary: z
    .string()
    .trim()
    .min(10, "Descreva a opção com pelo menos 10 caracteres.")
    .max(500, "O resumo pode ter no máximo 500 caracteres."),
});
