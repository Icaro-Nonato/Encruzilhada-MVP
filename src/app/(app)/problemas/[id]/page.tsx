import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { addUserOption, deleteProblem } from "@/app/(app)/problemas/actions";
import { AiFlow } from "@/components/ai-flow";
import { DeleteProblemButton } from "@/components/delete-problem-button";
import { OptionList } from "@/components/option-list";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { UserOptionForm } from "@/components/user-option-form";
import { getAiStage } from "@/lib/ai-stage";
import { formatDate } from "@/lib/format";
import { getOptions, getProblem } from "@/lib/problems";

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
  const options = await getOptions(problem.id);
  const answered = problem.clarifications.filter((c) => c.answer?.trim());

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

      {answered.length > 0 && (
        <dl className="flex flex-col gap-3 rounded-xl bg-muted/50 p-4 text-sm">
          {answered.map(({ question, answer }) => (
            <div key={question} className="flex flex-col gap-1">
              <dt className="text-muted-foreground">{question}</dt>
              <dd className="whitespace-pre-wrap break-words">{answer}</dd>
            </div>
          ))}
        </dl>
      )}

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

      <section aria-labelledby="options-heading" className="flex flex-col gap-3 border-t pt-5">
        <h2 id="options-heading" className="text-lg font-semibold">
          Opções
        </h2>
        {options.length > 0 && <OptionList options={options} />}
        <AiFlow
          problemId={problem.id}
          stage={getAiStage(problem.clarifications, options.length)}
        />
        <UserOptionForm action={addUserOption.bind(null, problem.id)} />
      </section>
    </>
  );
}
