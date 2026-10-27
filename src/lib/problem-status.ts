export const PROBLEM_STATUSES = ["open", "decided", "resolved"] as const;

export type ProblemStatus = (typeof PROBLEM_STATUSES)[number];

// Rótulos usados nos filtros da lista (plural) e no selo do problema (singular).
export const STATUS_LABELS: Record<ProblemStatus, { one: string; many: string }> = {
  open: { one: "Aberto", many: "Abertos" },
  decided: { one: "Decidido", many: "Decididos" },
  resolved: { one: "Resolvido", many: "Resolvidos" },
};

// Lê ?status= da URL; qualquer valor desconhecido vira "open".
export function parseStatus(value: unknown): ProblemStatus {
  return PROBLEM_STATUSES.includes(value as ProblemStatus)
    ? (value as ProblemStatus)
    : "open";
}
