import { z } from "zod";

const email = z.string().trim().pipe(z.email("Informe um e-mail válido."));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Informe a senha."),
});

export const signupSchema = z
  .object({
    email,
    password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });
