"use client";

import { Loader2, RotateCcw, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { saveClarifications } from "@/app/(app)/problemas/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AiStage } from "@/lib/ai-stage";

type Step = "clarify" | "options";

const LOADING_TEXT: Record<Step | "saving" | "refresh", string> = {
  clarify: "A IA está lendo seu problema...",
  options: "A IA está pensando em opções...",
  saving: "Salvando suas respostas...",
  refresh: "Carregando...",
};

async function callAi(path: string, problemId: string) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problem_id: problemId }),
  }).catch(() => null);
  const data = await response?.json().catch(() => null);
  if (!response?.ok) {
    throw new Error(data?.error ?? "Não foi possível falar com a IA agora. Tente de novo.");
  }
  return data;
}

// Conduz o fluxo do SPEC (seção 5): esclarecimento → opções.
// Cada chamada salva no banco; depois, router.refresh() faz o servidor
// renderizar a página de novo com os dados novos.
export function AiFlow({ problemId, stage }: { problemId: string; stage: AiStage }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Step | "saving" | null>(null);
  const [error, setError] = useState<{ message: string; retry: () => void } | null>(null);
  const [refreshing, startRefresh] = useTransition();
  const started = useRef(false);

  async function run(step: Step) {
    setError(null);
    setBusy(step);
    try {
      const data = await callAi(`/api/ai/${step === "clarify" ? "clarify" : "options"}`, problemId);
      // Sem perguntas: segue direto para as opções.
      if (step === "clarify" && data.questions.length === 0) {
        return run("options");
      }
      startRefresh(() => router.refresh());
    } catch (e) {
      setError({ message: (e as Error).message, retry: () => run(step) });
    } finally {
      setBusy((current) => (current === step ? null : current));
    }
  }

  async function submitAnswers(answers: string[], skip: boolean) {
    setError(null);
    setBusy("saving");
    const result = await saveClarifications(problemId, { answers, skip });
    setBusy(null);
    if (result?.error) {
      setError({ message: result.error, retry: () => submitAnswers(answers, skip) });
      return;
    }
    run("options");
  }

  // Ao abrir um problema novo, pergunta à IA uma única vez. A ref evita a
  // chamada dupla quando o React executa os efeitos duas vezes no dev.
  useEffect(() => {
    if (stage.kind === "check" && !started.current) {
      started.current = true;
      run("clarify");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- roda só ao montar
  }, []);

  const loading = busy ?? (refreshing ? "refresh" : null);

  if (loading) {
    return (
      <div role="status" className="flex items-center gap-2 rounded-xl border p-4 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        {LOADING_TEXT[loading]}
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/30 p-4">
        <p className="text-sm text-destructive">{error.message}</p>
        <Button type="button" variant="outline" size="lg" className="h-10 self-start" onClick={error.retry}>
          <RotateCcw aria-hidden />
          Tentar de novo
        </Button>
      </div>
    );
  }

  if (stage.kind === "questions") {
    return <QuestionsForm questions={stage.questions} onSubmit={submitAnswers} />;
  }

  const label = stage.kind === "has-options" ? "Gerar mais opções" : "Gerar opções com a IA";
  return (
    <Button
      type="button"
      variant={stage.kind === "has-options" ? "outline" : "default"}
      size="lg"
      className="h-10 self-start"
      onClick={() => run(stage.kind === "check" ? "clarify" : "options")}
    >
      <Sparkles aria-hidden />
      {label}
    </Button>
  );
}

function QuestionsForm({
  questions,
  onSubmit,
}: {
  questions: string[];
  onSubmit: (answers: string[], skip: boolean) => void;
}) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSubmit(questions.map((_, i) => String(data.get(`answer-${i}`) ?? "")), false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-medium">A IA quer entender melhor</h2>
        <p className="text-sm text-muted-foreground">
          Responda o que quiser. Perguntas em branco são ignoradas.
        </p>
      </div>
      {questions.map((question, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Label htmlFor={`answer-${i}`}>{question}</Label>
          <Textarea id={`answer-${i}`} name={`answer-${i}`} maxLength={1000} />
        </div>
      ))}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" size="lg" className="h-10" onClick={() => onSubmit([], true)}>
          Pular
        </Button>
        <Button type="submit" size="lg" className="h-10 sm:px-6">
          Enviar respostas
        </Button>
      </div>
    </form>
  );
}
