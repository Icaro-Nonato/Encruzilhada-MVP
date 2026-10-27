"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/app/(app)/problemas/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  cancelHref: string;
  submitLabel: string;
  pendingLabel: string;
  problem?: { title: string; description: string };
};

// Usado tanto para criar quanto para editar um problema.
export function ProblemForm({ action, cancelHref, submitLabel, pendingLabel, problem }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          defaultValue={problem?.title}
          placeholder="Ex.: Aceito a proposta de emprego?"
          minLength={3}
          maxLength={120}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Descrição</Label>
        <p id="description-hint" className="text-sm text-muted-foreground">
          Conte o contexto: o que está acontecendo, o que te preocupa e o que já tentou.
        </p>
        <Textarea
          id="description"
          name="description"
          defaultValue={problem?.description}
          aria-describedby="description-hint"
          minLength={10}
          maxLength={4000}
          required
          className="min-h-40"
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link href={cancelHref} className={buttonVariants({ variant: "ghost", size: "lg", className: "h-10" })}>
          Cancelar
        </Link>
        <Button type="submit" size="lg" disabled={pending} className="h-10 sm:px-6">
          {pending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
