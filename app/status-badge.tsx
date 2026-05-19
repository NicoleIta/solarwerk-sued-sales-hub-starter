import { KundenStatus } from "@/types";

const LABEL: Record<KundenStatus, string> = {
  aktiv: "Aktiv",
  in_wartung: "In Wartung",
  beschwerde: "Beschwerde",
};

const STYLE: Record<KundenStatus, string> = {
  aktiv: "bg-green-100 text-green-700",
  in_wartung: "bg-orange-100 text-orange-700",
  beschwerde: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }: { status: KundenStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${STYLE[status]}`}
    >
      {LABEL[status]}
    </span>
  );
}
