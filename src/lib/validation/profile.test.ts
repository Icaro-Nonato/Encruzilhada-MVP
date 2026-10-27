import { describe, expect, it } from "vitest";
import { profileSchema } from "./profile";

describe("profileSchema", () => {
  it("aceita campos vazios ou ausentes", () => {
    const result = profileSchema.safeParse({ goals: "" });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ goals: "", current_situation: "", constraints: "" });
  });

  it("remove espaços das pontas", () => {
    const result = profileSchema.safeParse({ goals: "  juntar dinheiro  " });
    expect(result.data?.goals).toBe("juntar dinheiro");
  });

  it("rejeita texto com mais de 2000 caracteres", () => {
    const result = profileSchema.safeParse({ constraints: "a".repeat(2001) });
    expect(result.error?.issues[0].message).toBe("Use no máximo 2000 caracteres.");
  });
});
