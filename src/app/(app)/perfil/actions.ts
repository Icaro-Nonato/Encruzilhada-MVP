"use server";

import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validation/profile";

export type FormState = { error?: string; message?: string } | undefined;

export async function updateProfile(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const user = await getCurrentUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", user.id);
  if (error) {
    return { error: "Não foi possível salvar o perfil. Tente novamente." };
  }

  return { message: "Perfil salvo." };
}
