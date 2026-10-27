import { NextResponse } from "next/server";
import { generateStructured } from "@/lib/ai/generate";
import { mockClarify } from "@/lib/ai/mock";
import { clarifyPrompt } from "@/lib/ai/prompts";
import { loadProblemForAi } from "@/lib/ai/route-helpers";
import { clarifySchema } from "@/lib/ai/schemas";

// IA verifica se falta informação no problema. Se faltar, salva as
// perguntas em problems.clarifications (sem resposta ainda).
export async function POST(request: Request) {
  const loaded = await loadProblemForAi(request);
  if (!loaded.ok) return loaded.response;
  const { supabase, problemId, context } = loaded;

  const result = await generateStructured({
    kind: "fast",
    schema: clarifySchema,
    prompt: clarifyPrompt(context),
    mock: () => mockClarify,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: result.error.status });
  }

  const questions = result.data.needs_clarification ? result.data.questions : [];
  if (questions.length > 0) {
    const { error } = await supabase
      .from("problems")
      .update({ clarifications: questions.map((question) => ({ question, answer: null })) })
      .eq("id", problemId);
    if (error) {
      return NextResponse.json({ error: "Não foi possível salvar as perguntas." }, { status: 500 });
    }
  }

  return NextResponse.json({ questions });
}
