"use client";

import { useActionState } from "react";
import { login, signup } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "login" | "signup";

export function AuthForm({
  mode,
  initialError,
}: {
  mode: Mode;
  initialError?: string;
}) {
  const [state, formAction, pending] = useActionState(
    mode === "login" ? login : signup,
    initialError ? { error: initialError } : undefined,
  );
  const isSignup = mode === "signup";

  if (state?.message) {
    return (
      <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${mode}-email`}>E-mail</Label>
        <Input
          id={`${mode}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${mode}-password`}>Senha</Label>
        <Input
          id={`${mode}-password`}
          name="password"
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          minLength={isSignup ? 6 : undefined}
          required
        />
      </div>
      {isSignup && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="signup-confirm-password">Confirmar senha</Label>
          <Input
            id="signup-confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>
      )}

      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="mt-2 h-10">
        {pending
          ? isSignup
            ? "Criando..."
            : "Entrando..."
          : isSignup
            ? "Criar conta"
            : "Entrar"}
      </Button>
    </form>
  );
}
