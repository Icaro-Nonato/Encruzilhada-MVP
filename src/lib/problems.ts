import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { parseStatus } from "@/lib/problem-status";
import { createClient } from "@/lib/supabase/server";
import { parseClarifications } from "@/lib/validation/clarifications";

// Busca um problema do usuário logado. Se não existir (ou for de outra
// pessoa, o que o RLS esconde), mostra a página 404.
export async function getProblem(id: string) {
  await getCurrentUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("problems")
    .select("id, title, description, status, clarifications, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    notFound();
  }
  return {
    ...data,
    status: parseStatus(data.status),
    clarifications: parseClarifications(data.clarifications),
  };
}

export async function getOptions(problemId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("options")
    .select("id, title, summary, source")
    .eq("problem_id", problemId)
    .order("created_at", { ascending: true });
  return data ?? [];
}
