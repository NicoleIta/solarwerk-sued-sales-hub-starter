import type { PipelineAutoStatus } from "@/lib/pipeline-rules";

const LABEL: Record<PipelineAutoStatus, string> = {
  risiko: "Risiko",
  verloren: "Verloren",
  vernachlaessigt: "Vernachlässigt",
  in_verhandlung: "In Verhandlung",
};

const STYLE: Record<PipelineAutoStatus, string> = {
  risiko: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  verloren: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  vernachlaessigt: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  in_verhandlung: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
};

export default function PipelineAutoBadge({ status }: { status: PipelineAutoStatus | null }) {
  if (!status) return null;
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${STYLE[status]}`}>
      {LABEL[status]}
    </span>
  );
}
