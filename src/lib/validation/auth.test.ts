import { describe, expect, it } from "vitest";
import { loginSchema, signupSchema } from "./auth";

function firstError(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.error?.issues[0].message;
}

describe("loginSchema", () => {
  it("aceita e-mail e senha válidos, removendo espaços do e-mail", () => {
    const result = loginSchema.safeParse({ email: "  ana@exemplo.com ", password: "x" });
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("ana@exemplo.com");
  });

  it("rejeita e-mail inválido", () => {
    const result = loginSchema.safeParse({ email: "ana", password: "123456" });
    expect(firstError(result)).toBe("Informe um e-mail válido.");
  });

  it("rejeita senha vazia", () => {
    const result = loginSchema.safeParse({ email: "ana@exemplo.com", password: "" });
    expect(firstError(result)).toBe("Informe a senha.");
  });
});

describe("signupSchema", () => {
  const valid = { email: "ana@exemplo.com", password: "123456", confirmPassword: "123456" };

  it("aceita cadastro válido", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it("rejeita senha com menos de 6 caracteres", () => {
    const result = signupSchema.safeParse({ ...valid, password: "123", confirmPassword: "123" });
    expect(firstError(result)).toBe("A senha precisa ter pelo menos 6 caracteres.");
  });

  it("rejeita senhas diferentes", () => {
    const result = signupSchema.safeParse({ ...valid, confirmPassword: "654321" });
    expect(firstError(result)).toBe("As senhas não coincidem.");
  });
});
