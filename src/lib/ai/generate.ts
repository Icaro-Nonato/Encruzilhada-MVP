import "server-only";
import { generateText, Output } from "ai";
import type { z } from "zod";
import { getModel, isMockMode, type ModelKind } from "./client";
import { translateAiError, type AiError } from "./errors";
import { MOCK_DELAY_MS } from "./mock";
import { SYSTEM_PROMPT } from "./prompts";

type Result<T> = { ok: true; data: T; model: string } | { ok: false; error: AiError };

const TIMEOUT_MS = 30_000;

// Ponto único de chamada à IA: escolhe o modelo, valida a resposta com o
// schema e transforma qualquer falha em uma mensagem amigável.
export async function generateStructured<T>({
  kind,
  schema,
  prompt,
  mock,
}: {
  kind: ModelKind;
  schema: z.ZodType<T>;
  prompt: string;
  mock: () => T;
}): Promise<Result<T>> {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
    return { ok: true, data: schema.parse(mock()), model: "mock" };
  }

  try {
    const { model, modelId } = getModel(kind);
    const { output } = await generateText({
      model,
      system: SYSTEM_PROMPT,
      prompt,
      output: Output.object({ schema }),
      maxRetries: 1,
      abortSignal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return { ok: true, data: output, model: modelId };
  } catch (error) {
    console.error("[ai] falha na chamada", error);
    return { ok: false, error: translateAiError(error) };
  }
}
