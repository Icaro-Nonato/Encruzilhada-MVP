import "server-only";
import { createGoogle } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

export type ModelKind = "fast" | "smart";

type Env = Record<string, string | undefined>;

// Provedores suportados. Para adicionar outro: instale o pacote
// (ex.: @ai-sdk/anthropic) e acrescente uma linha aqui.
const PROVIDERS: Record<string, (env: Env) => (modelId: string) => LanguageModel> = {
  google: (env) => createGoogle({ apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY }),
};

// Escolhe provedor e modelo a partir das variáveis de ambiente.
// Nunca fixe o nome do modelo no código: ele muda com frequência.
export function getModel(kind: ModelKind, env: Env = process.env) {
  const provider = env.AI_PROVIDER;
  const modelId = kind === "fast" ? env.AI_MODEL_FAST : env.AI_MODEL_SMART;
  const variable = kind === "fast" ? "AI_MODEL_FAST" : "AI_MODEL_SMART";

  if (!provider || !PROVIDERS[provider]) {
    throw new Error(`AI_PROVIDER inválido ou ausente: "${provider ?? ""}".`);
  }
  if (!modelId) {
    throw new Error(`Defina ${variable} no .env.local.`);
  }

  return { model: PROVIDERS[provider](env)(modelId), modelId };
}

// Com AI_MOCK=true, as rotas usam respostas falsas (ai/mock.ts).
export function isMockMode(env: Env = process.env) {
  return env.AI_MOCK === "true";
}
