import { APICallError, NoObjectGeneratedError, RetryError } from "ai";
import { describe, expect, it } from "vitest";
import { AI_ERROR_MESSAGES, translateAiError } from "./errors";

function apiError(statusCode: number) {
  return new APICallError({
    message: "erro",
    url: "https://exemplo",
    requestBodyValues: {},
    statusCode,
  });
}

describe("translateAiError", () => {
  it("traduz limite do plano gratuito (429), mesmo depois das tentativas", () => {
    expect(translateAiError(apiError(429))).toEqual({ message: AI_ERROR_MESSAGES.rateLimit, status: 429 });
    const retry = new RetryError({ message: "x", reason: "maxRetriesExceeded", errors: [apiError(429)] });
    expect(translateAiError(retry).status).toBe(429);
  });

  it("traduz timeout", () => {
    const timeout = new DOMException("tempo esgotado", "TimeoutError");
    expect(translateAiError(timeout).message).toBe(AI_ERROR_MESSAGES.timeout);
  });

  it("traduz JSON inválido", () => {
    const invalid = new NoObjectGeneratedError({
      message: "x",
      text: "{",
      response: { id: "1", timestamp: new Date(), modelId: "m" },
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      finishReason: "stop",
    } as unknown as ConstructorParameters<typeof NoObjectGeneratedError>[0]);
    expect(translateAiError(invalid).message).toBe(AI_ERROR_MESSAGES.invalid);
  });

  it("usa mensagem genérica para o resto", () => {
    expect(translateAiError(apiError(500)).message).toBe(AI_ERROR_MESSAGES.generic);
    expect(translateAiError("???").message).toBe(AI_ERROR_MESSAGES.generic);
  });
});
