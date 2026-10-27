import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import {
  PROBLEM_STATUSES,
  STATUS_LABELS,
  parseStatus,
  type ProblemStatus,
} from "@/lib/problem-status";
import { createClient } from "@/lib/supabase/server";

export default function ProblemsPage({ searchParams }: PageProps<"/problemas">) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Problemas</h1>
        <Link href="/problemas/novo" className={buttonVariants({ size: "lg", className: "h-10" })}>
          <Plus aria-hidden />
          Novo problema
        </Link>
      </div>
      <Suspense fallback={<p className="text-muted-foreground">Carregando...</p>}>
        {searchParams.then(({ status }) => (
          <ProblemList status={parseStatus(status)} />
        ))}
      </Suspense>
    </section>
  );
}

async function ProblemList({ status }: { status: ProblemStatus }) {
  await getCurrentUser();
  const supabase = await createClient();
  const { data: problems, error } = await supabase
    .from("problems")
    .select("id, title, description, created_at")
    .eq("status", status)
    .order("created_at", { ascending: false });

  return (
    <>
      <StatusFilter current={status} />
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          Não foi possível carregar seus problemas. Recarregue a página.
        </p>
      ) : problems.length === 0 ? (
        <EmptyState status={status} />
      ) : (
        <ul className="flex flex-col gap-3">
          {problems.map((problem) => (
            <li key={problem.id}>
              <Link
                href={`/problemas/${problem.id}`}
                className="flex flex-col gap-1 rounded-xl border bg-card p-4 hover:bg-muted/50"
              >
                <span className="font-medium break-words">{problem.title}</span>
                <span className="line-clamp-2 text-sm break-words text-muted-foreground">
                  {problem.description}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(problem.created_at)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function StatusFilter({ current }: { current: ProblemStatus }) {
  return (
    <nav aria-label="Filtrar por status" className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
      {PROBLEM_STATUSES.map((status) => (
        <Link
          key={status}
          href={status === "open" ? "/problemas" : `/problemas?status=${status}`}
          aria-current={status === current ? "page" : undefined}
          className={cn(
            "rounded-md px-2 py-1.5 text-center text-sm font-medium text-muted-foreground",
            status === current && "bg-background text-foreground shadow-sm",
          )}
        >
          {STATUS_LABELS[status].many}
        </Link>
      ))}
    </nav>
  );
}

const EMPTY_MESSAGES: Record<ProblemStatus, string> = {
  open: "Nenhum problema aberto. Que tal descrever o que está te travando?",
  decided: "Nenhuma decisão tomada ainda.",
  resolved: "Nenhum problema resolvido ainda.",
};

function EmptyState({ status }: { status: ProblemStatus }) {
  return (
    <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
      {EMPTY_MESSAGES[status]}
    </p>
  );
}
