"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { cn } from "cn";

type Option = { id: string; title: string; summary: string; source: string };

// Lista de opções com seleção única: tocar numa opção seleciona ela e
// desmarca a anterior. Tocar de novo na selecionada desmarca.
// A opção escolhida é a que será analisada na fatia 4.
export function OptionList({ options }: { options: Option[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div role="radiogroup" aria-label="Escolha uma opção" className="flex flex-col gap-3">
      {options.map((option) => {
        const selected = option.id === selectedId;
        const Icon = selected ? CheckCircle2 : Circle;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setSelectedId(selected ? null : option.id)}
            className={cn(
              "flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              selected && "border-primary bg-muted/50 ring-1 ring-primary",
            )}
          >
            <Icon
              className={cn("mt-0.5 size-5 shrink-0", selected ? "text-primary" : "text-muted-foreground")}
              aria-hidden
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium break-words">{option.title}</span>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {option.source === "ai" ? "IA" : "Sua opção"}
                </span>
              </div>
              <p className="text-sm break-words text-muted-foreground">{option.summary}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
