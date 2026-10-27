import { Suspense } from "react";
import { updateProblem } from "@/app/(app)/problemas/actions";
import { ProblemForm } from "@/components/problem-form";
import { getProblem } from "@/lib/problems";

export default function EditProblemPage({ params }: PageProps<"/problemas/[id]/editar">) {
  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold">Editar problema</h1>
      <Suspense fallback={<p className="text-muted-foreground">Carregando...</p>}>
        {params.then(({ id }) => (
          <EditForm id={id} />
        ))}
      </Suspense>
    </section>
  );
}

async function EditForm({ id }: { id: string }) {
  const problem = await getProblem(id);

  return (
    <ProblemForm
      action={updateProblem.bind(null, problem.id)}
      problem={problem}
      cancelHref={`/problemas/${problem.id}`}
      submitLabel="Salvar"
      pendingLabel="Salvando..."
    />
  );
}
