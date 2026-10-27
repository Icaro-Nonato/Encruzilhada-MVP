"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/(app)/perfil/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Profile = {
  goals: string;
  current_situation: string;
  constraints: string;
};

const FIELDS = [
  {
    name: "goals",
    label: "Objetivos",
    hint: "O que você quer alcançar nos próximos meses ou anos?",
  },
  {
    name: "current_situation",
    label: "Situação atual",
    hint: "Trabalho, estudos, finanças, rotina: o que importa saber sobre o seu momento?",
  },
  {
    name: "constraints",
    label: "Restrições",
    hint: "Limites de tempo, dinheiro, saúde ou outros que uma solução precisa respeitar.",
  },
] as const;

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateProfile, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {FIELDS.map(({ name, label, hint }) => (
        <div key={name} className="flex flex-col gap-2">
          <Label htmlFor={name}>{label}</Label>
          <p id={`${name}-hint`} className="text-sm text-muted-foreground">
            {hint}
          </p>
          <Textarea
            id={name}
            name={name}
            defaultValue={profile[name]}
            aria-describedby={`${name}-hint`}
            maxLength={2000}
            className="min-h-24"
          />
        </div>
      ))}

      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state?.message && (
        <p role="status" className="text-sm text-green-700 dark:text-green-400">
          {state.message}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="h-10 sm:self-start sm:px-6">
        {pending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
