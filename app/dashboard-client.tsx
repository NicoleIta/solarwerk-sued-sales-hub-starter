"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, CheckCircle, AlertTriangle } from "lucide-react";
import { Kunde, KundenStatus } from "@/types";
import StatusBadge from "./status-badge";
import FilterBar from "@/components/filter-bar";
import StatKarte from "@/components/stat-karte";
import type { FilterValues, FilterDefinition } from "@/components/filter-bar";

const STATUS_LABEL: Record<string, string> = {
  aktiv:      "Aktiv",
  in_wartung: "In Wartung",
  beschwerde: "Beschwerde",
};

export default function DashboardClient({ kunden }: { kunden: Kunde[] }) {
  const router = useRouter();
  const [filterValues, setFilterValues] = useState<FilterValues>({
    status: "",
    branche: "",
    suche: "",
  });

  const branchenOptionen = Array.from(
    new Set(
      kunden
        .filter((k) => {
          const statusPasst = !filterValues.status || k.status === filterValues.status;
          const suchPasst =
            !filterValues.suche ||
            k.firma.toLowerCase().includes(filterValues.suche.toLowerCase()) ||
            k.ansprechpartner.toLowerCase().includes(filterValues.suche.toLowerCase());
          return statusPasst && suchPasst;
        })
        .map((k) => k.branche)
        .filter(Boolean)
    )
  ).sort().map((b) => ({ value: b, label: b }));

  const statusOptionen = Array.from(
    new Set(
      kunden
        .filter((k) => {
          const branchePasst = !filterValues.branche || k.branche === filterValues.branche;
          const suchPasst =
            !filterValues.suche ||
            k.firma.toLowerCase().includes(filterValues.suche.toLowerCase()) ||
            k.ansprechpartner.toLowerCase().includes(filterValues.suche.toLowerCase());
          return branchePasst && suchPasst;
        })
        .map((k) => k.status)
    )
  ).sort().map((s) => ({ value: s, label: STATUS_LABEL[s] ?? s }));

  const gesamt = kunden.length;
  const aktive = kunden.filter((k) => k.status === "aktiv").length;
  const beschwerden = kunden.filter((k) => k.status === "beschwerde").length;

  const filterDefs: FilterDefinition[] = [
    {
      key: "status",
      label: "Alle Status",
      type: "select",
      options: statusOptionen,
    },
    {
      key: "branche",
      label: "Alle Branchen",
      type: "select",
      options: branchenOptionen,
    },
    {
      key: "suche",
      label: "Suche nach Firma oder Ansprechpartner...",
      type: "text",
      className: "sm:w-80",
    },
  ];

  const gefilterteKunden = kunden.filter((k) => {
    const statusPasst = !filterValues.status || k.status === filterValues.status;
    const branchePasst = !filterValues.branche || k.branche === filterValues.branche;
    const suchPasst =
      !filterValues.suche ||
      k.firma.toLowerCase().includes(filterValues.suche.toLowerCase()) ||
      k.ansprechpartner.toLowerCase().includes(filterValues.suche.toLowerCase());
    return statusPasst && branchePasst && suchPasst;
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatKarte icon={Users}         label="Gesamtkunden"  wert={gesamt}      farbe="blue"  />
        <StatKarte icon={CheckCircle}   label="Aktive Kunden" wert={aktive}      farbe="green" />
        <StatKarte icon={AlertTriangle} label="Beschwerden"   wert={beschwerden} farbe="red"   />
      </div>

      <div className="mb-4">
        <FilterBar
          filters={filterDefs}
          values={filterValues}
          onChange={setFilterValues}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Firma</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                Ansprechpartner
              </th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Branche</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                Anlagengroesse (kWp)
              </th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                Letzter Kontakt
              </th>
            </tr>
          </thead>
          <tbody>
            {gefilterteKunden.map((kunde) => (
              <tr
                key={kunde.id}
                onClick={() => router.push(`/kunden/${kunde.id}`)}
                className="cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-4 py-3 font-medium">{kunde.firma}</td>
                <td className="px-4 py-3">{kunde.ansprechpartner}</td>
                <td className="px-4 py-3">{kunde.branche}</td>
                <td className="px-4 py-3">{kunde.anlagengroesse_kwp}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={kunde.status}
                    onChange={async (e) => {
                      await fetch(`/api/kunden/${kunde.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: e.target.value }),
                      });
                      router.refresh();
                    }}
                    className={`rounded-full px-2 py-1 text-xs font-medium border-0 cursor-pointer ${
                      kunde.status === "aktiv"
                        ? "bg-green-100 text-green-700"
                        : kunde.status === "in_wartung"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    <option value="aktiv">Aktiv</option>
                    <option value="in_wartung">In Wartung</option>
                    <option value="beschwerde">Beschwerde</option>
                  </select>
                </td>
                <td className="px-4 py-3">{kunde.letzter_kontakt}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {gefilterteKunden.length === 0 && (
          <p className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
            Keine Kunden gefunden.
          </p>
        )}
      </div>
    </div>
  );
}
