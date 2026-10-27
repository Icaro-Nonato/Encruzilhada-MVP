import { z } from "zod";

const field = z
  .string()
  .trim()
  .max(2000, "Use no máximo 2000 caracteres.")
  .default("");

export const profileSchema = z.object({
  goals: field,
  current_situation: field,
  constraints: field,
});
