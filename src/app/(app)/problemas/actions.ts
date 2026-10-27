"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { problemSchema } from "@/lib/validation/problem";

export type FormState = { error?: string } | undefined;

// Em todas as ações, o RLS garante no banco que só os problemas do
// usuário logado são lidos ou alterados.

export async function createProblem(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = problemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await getCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("problems")
    .insert(parsed.data)
    .select("id")
    .single();
  if (error) {
    return { error: "Não foi possível criar o problema. Tente novamente." };
  }

  redirect(`/problemas/${data.id}`);
}

export async function updateProblem(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = problemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await getCurrentUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("problems")
    .update(parsed.data)
    .eq("id", id);
  if (error) {
    return { error: "Não foi possível salvar as alterações. Tente novamente." };
  }

  redirect(`/problemas/${id}`);
}

export async function deleteProblem(id: string) {
  await getCurrentUser();
  const supabase = await createClient();
  await supabase.from("problems").delete().eq("id", id);
  redirect("/problemas");
}
