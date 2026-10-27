import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = { id: string; email: string };

// Retorna o usuário logado ou redireciona para /login.
// Use em Server Components e Server Actions que exigem autenticação.
export async function getCurrentUser(): Promise<CurrentUser> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    redirect("/login");
  }

  return { id: claims.sub, email: claims.email ?? "" };
}
