"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

// Exclusão em dois cliques: o primeiro só pede confirmação.
// Evita o confirm() do navegador, que fica estranho no celular.
export function DeleteProblemButton({ action }: { action: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button type="button" variant="ghost" size="lg" className="h-10" onClick={() => setConfirming(true)}>
        <Trash2 aria-hidden />
        Excluir
      </Button>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Excluir de vez?</span>
      <Button type="button" variant="ghost" size="lg" className="h-10" onClick={() => setConfirming(false)}>
        Não
      </Button>
      <ConfirmButton />
    </form>
  );
}

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" size="lg" className="h-10" disabled={pending}>
      {pending ? "Excluindo..." : "Sim, excluir"}
    </Button>
  );
}
