import { PipelineStatus } from "@/types";

export const PIPELINE_LABEL: Record<PipelineStatus, string> = {
  erstkontakt:  "Erstkontakt",
  angebot_raus: "Angebot raus",
  verhandlung:  "Verhandlung",
  gewonnen:     "Gewonnen",
  verloren:     "Verloren",
};

export const PIPELINE_STYLE: Record<PipelineStatus, string> = {
  erstkontakt:  "bg-gray-100 text-gray-700",
  angebot_raus: "bg-blue-100 text-blue-700",
  verhandlung:  "bg-orange-100 text-orange-700",
  gewonnen:     "bg-green-100 text-green-700",
  verloren:     "bg-red-100 text-red-700",
};

export default function PipelineStatusBadge({ status }: { status: PipelineStatus }) {
  return (
    <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${PIPELINE_STYLE[status]}`}>
      {PIPELINE_LABEL[status]}
    </span>
  );
}
