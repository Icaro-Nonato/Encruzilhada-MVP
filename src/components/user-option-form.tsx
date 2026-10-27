"use client";

import { PenLine } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import type { FormState } from "@/app/(app)/problemas/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

// "Escrever minha opção": fica recolhido até o usuário abrir.
export function UserOptionForm({ action }: { action: Action }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, undefined);
  const [submitted, setSubmitted] = useState(false);

  // Depois de salvar com sucesso, fecha o formulário.
  useEffect(() => {
    if (submitted && !pending && !state?.error) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fecha após salvar
      setOpen(false);
      setSubmitted(false);
    }
  }, [submitted, pending, state]);

  if (!open) {
    return (
      <Button type="button" variant="ghost" size="lg" className="h-10 self-start" onClick={() => setOpen(true)}>
        <PenLine aria-hidden />
        Escrever minha opção
      </Button>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={() => setSubmitted(true)}
      className="flex flex-col gap-4 rounded-xl border p-4"
    >
      <h2 className="font-medium">Minha opção</h2>
      <div className="flex flex-col gap-2">
        <Label htmlFor="option-title">Título</Label>
        <Input id="option-title" name="title" minLength={3} maxLength={60} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="option-summary">Resumo</Label>
        <Textarea id="option-summary" name="summary" minLength={10} maxLength={500} required />
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" size="lg" className="h-10" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
        <Button type="submit" size="lg" disabled={pending} className="h-10 sm:px-6">
          {pending ? "Adicionando..." : "Adicionar opção"}
        </Button>
      </div>
    </form>
  );
}
