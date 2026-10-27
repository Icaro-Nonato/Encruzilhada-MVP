import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type ProfileFields = {
  goals: string;
  current_situation: string;
  constraints: string;
};

// Perfil "vazio" = nenhum dos 3 campos preenchido. Usado para levar o
// usuário a /perfil no primeiro login.
export function isProfileEmpty(profile: ProfileFields | null) {
  if (!profile) return true;
  return [profile.goals, profile.current_situation, profile.constraints].every(
    (value) => value.trim() === "",
  );
}

// Para onde mandar o usuário logo depois de entrar.
export async function getPostLoginPath(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const { data } = await supabase
    .from("profiles")
    .select("goals, current_situation, constraints")
    .eq("id", userId)
    .maybeSingle();
  return isProfileEmpty(data) ? "/perfil" : "/problemas";
}
