import { cn } from "cn";
import { STATUS_LABELS, type ProblemStatus } from "@/lib/problem-status";

const STATUS_STYLES: Record<ProblemStatus, string> = {
  open: "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  decided: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  resolved: "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200",
};

export function StatusBadge({ status }: { status: ProblemStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", STATUS_STYLES[status])}>
      {STATUS_LABELS[status].one}
    </span>
  );
}
