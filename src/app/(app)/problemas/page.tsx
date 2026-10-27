import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";

// Placeholder — a lista de problemas chega na fatia 2.
export default function ProblemsPage() {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">Problemas</h1>
      <Suspense fallback={<p className="text-muted-foreground">Carregando...</p>}>
        <Greeting />
      </Suspense>
      <p className="text-muted-foreground">Em breve você verá seus problemas aqui.</p>
    </section>
  );
}

async function Greeting() {
  const user = await getCurrentUser();
  return (
    <p className="text-muted-foreground">
      Você está logado como{" "}
      <span className="font-medium text-foreground">{user.email}</span>.
    </p>
  );
}
