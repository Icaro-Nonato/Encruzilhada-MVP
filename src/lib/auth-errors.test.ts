import { describe, expect, it } from "vitest";
import { translateAuthError } from "./auth-errors";

describe("translateAuthError", () => {
  it("traduz códigos conhecidos", () => {
    expect(translateAuthError({ code: "invalid_credentials" })).toBe(
      "E-mail ou senha incorretos.",
    );
  });

  it("usa mensagem genérica para códigos desconhecidos ou ausentes", () => {
    expect(translateAuthError({ code: "algo_novo" })).toBe(
      "Algo deu errado. Tente novamente.",
    );
    expect(translateAuthError({})).toBe("Algo deu errado. Tente novamente.");
  });
});
