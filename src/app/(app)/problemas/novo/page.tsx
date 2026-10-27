import { createProblem } from "@/app/(app)/problemas/actions";
import { ProblemForm } from "@/components/problem-form";

export default function NewProblemPage() {
  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold">Novo problema</h1>
      <ProblemForm
        action={createProblem}
        cancelHref="/problemas"
        submitLabel="Criar problema"
        pendingLabel="Criando..."
      />
    </section>
  );
}
