import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { deleteProblem } from "@/app/(app)/problemas/actions";
import { DeleteProblemButton } from "@/components/delete-problem-button";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { getProblem } from "@/lib/problems";

export default function ProblemPage({ params }: PageProps<"/problemas/[id]">) {
  return (
    <section className="flex flex-col gap-5">
      <Link
        href="/problemas"
        className="flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Problemas
      </Link>
      <Suspense fallback={<p className="text-muted-foreground">Carregando...</p>}>
        {params.then(({ id }) => (
          <ProblemDetail id={id} />
        ))}
      </Suspense>
    </section>
  );
}

async function ProblemDetail({ id }: { id: string }) {
  const problem = await getProblem(id);

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold break-words">{problem.title}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <StatusBadge status={problem.status} />
          <span>Criado em {formatDate(problem.created_at)}</span>
        </div>
      </div>

      <p className="whitespace-pre-wrap break-words">{problem.description}</p>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/problemas/${problem.id}/editar`}
          className={buttonVariants({ variant: "outline", size: "lg", className: "h-10" })}
        >
          <Pencil aria-hidden />
          Editar
        </Link>
        <DeleteProblemButton action={deleteProblem.bind(null, problem.id)} />
      </div>

      {/* Placeholder — opções e análises chegam nas fatias 3 e 4. */}
      <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        Em breve a IA vai sugerir opções para este problema.
      </div>
    </>
  );
}
