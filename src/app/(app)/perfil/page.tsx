import { Suspense } from "react";
import { ProfileForm } from "@/components/profile-form";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default function ProfilePage() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Perfil</h1>
        <p className="text-muted-foreground">
          A IA usa estas informações para sugerir opções que façam sentido para você.
        </p>
      </div>
      <Suspense fallback={<p className="text-muted-foreground">Carregando...</p>}>
        <Profile />
      </Suspense>
    </section>
  );
}

async function Profile() {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("goals, current_situation, constraints")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <ProfileForm
      profile={data ?? { goals: "", current_situation: "", constraints: "" }}
    />
  );
}
