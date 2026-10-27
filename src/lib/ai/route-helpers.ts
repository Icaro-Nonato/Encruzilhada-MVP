import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { parseClarifications } from "@/lib/validation/clarifications";
import type { AiContext } from "./prompts";

const bodySchema = z.object({ problem_id: z.uuid() });

type Loaded =
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>>; problemId: string; context: AiContext }
  | { ok: false; response: NextResponse };

function fail(error: string, status: number): Loaded {
  return { ok: false, response: NextResponse.json({ error }, { status }) };
}

// Começo comum das rotas de IA: confere o login, valida o corpo e carrega
// o problema e o perfil. O RLS garante que só os dados do usuário voltem.
export async function loadProblemForAi(request: Request): Promise<Loaded> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) {
    return fail("Faça login para continuar.", 401);
  }

  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return fail("Requisição inválida.", 400);
  }
  const problemId = body.data.problem_id;

  const [{ data: problem }, { data: profile }] = await Promise.all([
    supabase
      .from("problems")
      .select("title, description, clarifications")
      .eq("id", problemId)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("goals, current_situation, constraints")
      .eq("id", userId)
      .maybeSingle(),
  ]);
  if (!problem) {
    return fail("Problema não encontrado.", 404);
  }

  return {
    ok: true,
    supabase,
    problemId,
    context: {
      profile,
      problem: { ...problem, clarifications: parseClarifications(problem.clarifications) },
      today: todayInBrazil(),
    },
  };
}

function todayInBrazil() {
  // "en-CA" formata como AAAA-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}
