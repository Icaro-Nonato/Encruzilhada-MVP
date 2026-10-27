import { describe, expect, it } from "vitest";
import { problemSchema } from "./problem";

function firstError(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.error?.issues[0].message;
}

describe("problemSchema", () => {
  const valid = { title: "Trocar de emprego?", description: "Recebi uma proposta nova e estou em dúvida." };

  it("aceita problema válido, removendo espaços", () => {
    const result = problemSchema.safeParse({ ...valid, title: `  ${valid.title}  ` });
    expect(result.success).toBe(true);
    expect(result.data?.title).toBe(valid.title);
  });

  it("rejeita título curto", () => {
    expect(firstError(problemSchema.safeParse({ ...valid, title: "ab" }))).toBe(
      "O título precisa ter pelo menos 3 caracteres.",
    );
  });

  it("rejeita título longo", () => {
    expect(firstError(problemSchema.safeParse({ ...valid, title: "a".repeat(121) }))).toBe(
      "O título pode ter no máximo 120 caracteres.",
    );
  });

  it("rejeita descrição curta, contando sem espaços das pontas", () => {
    expect(firstError(problemSchema.safeParse({ ...valid, description: "   curta   " }))).toBe(
      "Descreva o problema com pelo menos 10 caracteres.",
    );
  });
});
