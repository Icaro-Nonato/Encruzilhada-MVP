import { APICallError, NoObjectGeneratedError, RetryError } from "ai";

export const AI_ERROR_MESSAGES = {
  rateLimit: "A IA atingiu o limite do plano gratuito. Espere um minuto e tente de novo.",
  timeout: "A IA demorou demais para responder. Tente de novo.",
  invalid: "A IA respondeu num formato inesperado. Tente de novo.",
  generic: "Não foi possível falar com a IA agora. Tente de novo.",
} as const;

export type AiError = { message: string; status: number };

// Traduz os erros do AI SDK para mensagens amigáveis e um status HTTP.
export function translateAiError(error: unknown): AiError {
  // Depois de esgotar as tentativas, o AI SDK embrulha o último erro.
  const cause = RetryError.isInstance(error) ? error.lastError : error;

  if (APICallError.isInstance(cause) && cause.statusCode === 429) {
    return { message: AI_ERROR_MESSAGES.rateLimit, status: 429 };
  }
  if (
    cause instanceof Error &&
    (cause.name === "TimeoutError" || cause.name === "AbortError")
  ) {
    return { message: AI_ERROR_MESSAGES.timeout, status: 504 };
  }
  if (NoObjectGeneratedError.isInstance(cause)) {
    return { message: AI_ERROR_MESSAGES.invalid, status: 502 };
  }
  return { message: AI_ERROR_MESSAGES.generic, status: 502 };
}
