import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { parseStatus } from "@/lib/problem-status";
import { createClient } from "@/lib/supabase/server";

// Busca um problema do usuário logado. Se não existir (ou for de outra
// pessoa, o que o RLS esconde), mostra a página 404.
export async function getProblem(id: string) {
  await getCurrentUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("problems")
    .select("id, title, description, status, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    notFound();
  }
  return { ...data, status: parseStatus(data.status) };
}
