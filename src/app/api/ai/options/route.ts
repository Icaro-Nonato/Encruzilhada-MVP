import { NextResponse } from "next/server";
import { generateStructured } from "@/lib/ai/generate";
import { mockOptions } from "@/lib/ai/mock";
import { optionsPrompt } from "@/lib/ai/prompts";
import { loadProblemForAi } from "@/lib/ai/route-helpers";
import { optionsSchema } from "@/lib/ai/schemas";

// IA gera de 3 a 4 opções. As opções que já existem vão no prompt para
// que "Gerar mais opções" não repita nada.
export async function POST(request: Request) {
  const loaded = await loadProblemForAi(request);
  if (!loaded.ok) return loaded.response;
  const { supabase, problemId, context } = loaded;

  const { data: existing } = await supabase
    .from("options")
    .select("title, summary")
    .eq("problem_id", problemId);

  const result = await generateStructured({
    kind: "fast",
    schema: optionsSchema,
    prompt: optionsPrompt(context, existing ?? []),
    mock: () => mockOptions(existing?.length ?? 0),
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: result.error.status });
  }

  const { error } = await supabase.from("options").insert(
    result.data.options.map((option) => ({ ...option, problem_id: problemId, source: "ai" })),
  );
  if (error) {
    return NextResponse.json({ error: "Não foi possível salvar as opções." }, { status: 500 });
  }

  return NextResponse.json({ count: result.data.options.length });
}
