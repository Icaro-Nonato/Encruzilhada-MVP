"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  answersSchema,
  parseClarifications,
} from "@/lib/validation/clarifications";
import { userOptionSchema } from "@/lib/validation/option";
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

// Salva as respostas das perguntas de esclarecimento. Chamada pelo
// componente do fluxo de IA, que em seguida pede as opções.
export async function saveClarifications(
  problemId: string,
  input: { answers: string[]; skip: boolean },
): Promise<FormState> {
  const parsed = answersSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await getCurrentUser();
  const supabase = await createClient();
  const { data: problem } = await supabase
    .from("problems")
    .select("clarifications")
    .eq("id", problemId)
    .maybeSingle();
  if (!problem) {
    return { error: "Problema não encontrado." };
  }

  const { answers, skip } = parsed.data;
  const clarifications = parseClarifications(problem.clarifications).map((c, i) => ({
    question: c.question,
    answer: skip ? "" : (answers[i] ?? ""),
  }));
  const { error } = await supabase
    .from("problems")
    .update({ clarifications })
    .eq("id", problemId);
  if (error) {
    return { error: "Não foi possível salvar as respostas. Tente novamente." };
  }
}

export async function addUserOption(
  problemId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = userOptionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await getCurrentUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("options")
    .insert({ ...parsed.data, problem_id: problemId, source: "user" });
  if (error) {
    return { error: "Não foi possível adicionar a opção. Tente novamente." };
  }

  refresh();
}
