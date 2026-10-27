import { describe, expect, it } from "vitest";
import { parseClarifications } from "./clarifications";
import { userOptionSchema } from "./option";

describe("userOptionSchema", () => {
  const valid = { title: "Fazer um curso", summary: "Estudar à noite por 6 meses." };

  it("aceita opção válida", () => {
    expect(userOptionSchema.safeParse(valid).success).toBe(true);
  });

  it("rejeita título com mais de 60 caracteres", () => {
    expect(userOptionSchema.safeParse({ ...valid, title: "a".repeat(61) }).error?.issues[0].message).toBe(
      "O título pode ter no máximo 60 caracteres.",
    );
  });
});

describe("parseClarifications", () => {
  it("lê o formato salvo no banco", () => {
    expect(parseClarifications([{ question: "Prazo?", answer: null }])).toEqual([
      { question: "Prazo?", answer: null },
    ]);
  });

  it("formato estranho vira lista vazia", () => {
    expect(parseClarifications({ foo: 1 })).toEqual([]);
    expect(parseClarifications(null)).toEqual([]);
  });
});
