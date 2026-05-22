import type { LucideIcon } from "lucide-react";

interface StatKarteProps {
  icon: LucideIcon;
  label: string;
  wert: React.ReactNode;
  farbe: "blue" | "green" | "red" | "orange";
}

const farbenMap: Record<StatKarteProps["farbe"], string> = {
  blue:   "text-blue-500",
  green:  "text-green-500",
  red:    "text-red-500",
  orange: "text-orange-500",
};

export default function StatKarte({ icon: Icon, label, wert, farbe }: StatKarteProps) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
      <div className="flex items-center gap-3">
        <Icon className={`h-8 w-8 ${farbenMap[farbe]}`} />
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold">{wert}</p>
        </div>
      </div>
    </div>
  );
}
