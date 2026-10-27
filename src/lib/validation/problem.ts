import { z } from "zod";

export const problemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "O título precisa ter pelo menos 3 caracteres.")
    .max(120, "O título pode ter no máximo 120 caracteres."),
  description: z
    .string()
    .trim()
    .min(10, "Descreva o problema com pelo menos 10 caracteres.")
    .max(4000, "A descrição pode ter no máximo 4000 caracteres."),
});
