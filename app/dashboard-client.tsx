"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, CheckCircle, AlertTriangle } from "lucide-react";
import { Kunde } from "@/types";
import FilterBar from "@/components/filter-bar";
import StatKarte from "@/components/stat-karte";
import type { FilterValues, FilterDefinition } from "@/components/filter-bar";
import { supabase } from "@/lib/supabase";

const STATUS_LABEL: Record<string, string> = {
  aktiv:      "Aktiv",
  in_wartung: "In Wartung",
  beschwerde: "Beschwerde",
};

export default function DashboardClient() {
  const router = useRouter();
  const [kunden, setKunden] = useState<Kunde[]>([]);
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>({
    status: "",
    branche: "",
    suche: "",
  });
  const [debouncedSuche, setDebouncedSuche] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSuche(filterValues.suche), 300);
    return () => clearTimeout(t);
  }, [filterValues.suche]);

  useEffect(() => {
    async function fetchKunden() {
      setLaden(true);
      setFehler(null);
      let query = supabase
        .from("kunden")
        .select("*")
        .order("firma", { ascending: true });
      if (filterValues.status) query = query.eq("status", filterValues.status);
      if (filterValues.branche) query = query.eq("branche", filterValues.branche);
      if (debouncedSuche) query = query.ilike("firma", `%${debouncedSuche}%`);
      const { data, error } = await query;
      if (error) {
        setFehler("Laden fehlgeschlagen.");
        setKunden([]);
      } else {
        setKunden(
          (data ?? []).map((k) => ({
            id: k.int_id,
            supabase_uuid: k.id,
            firma: k.firma,
            ansprechpartner: k.ansprechpartner,
            branche: k.branche,
            anlagengroesse_kwp: k.anlagengroesse_kwp,
            status: k.status,
            letzter_kontakt: k.letzter_kontakt,
            telefon: k.telefon,
            email: k.email,
            notiz: k.notiz,
          }))
        );
      }
      setLaden(false);
    }
    fetchKunden();
  }, [filterValues.status, filterValues.branche, debouncedSuche]);

  const branchenOptionen = Array.from(new Set(kunden.map((k) => k.branche).filter(Boolean)))
    .sort()
    .map((b) => ({ value: b, label: b }));

  const statusOptionen = Array.from(new Set(kunden.map((k) => k.status)))
    .sort()
    .map((s) => ({ value: s, label: STATUS_LABEL[s] ?? s }));

  const gesamt = kunden.length;
  const aktive = kunden.filter((k) => k.status === "aktiv").length;
  const beschwerden = kunden.filter((k) => k.status === "beschwerde").length;

  const STATUS_BUTTONS: { value: string; label: string }[] = [
    { value: "", label: "Alle" },
    { value: "aktiv", label: "Aktiv" },
    { value: "in_wartung", label: "In Wartung" },
    { value: "beschwerde", label: "Beschwerde" },
  ];

  const filterDefs: FilterDefinition[] = [
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

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatKarte icon={Users}         label="Gesamtkunden"  wert={gesamt}      farbe="blue"  />
        <StatKarte icon={CheckCircle}   label="Aktive Kunden" wert={aktive}      farbe="green" />
        <StatKarte icon={AlertTriangle} label="Beschwerden"   wert={beschwerden} farbe="red"   />
      </div>

      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-1">
          {STATUS_BUTTONS.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilterValues((prev) => ({ ...prev, status: btn.value }))}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filterValues.status === btn.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <FilterBar
          filters={filterDefs}
          values={filterValues}
          onChange={setFilterValues}
        />
      </div>

      {fehler && (
        <p className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {fehler}
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Firma</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Ansprechpartner</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Branche</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Anlagengroesse (kWp)</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Letzter Kontakt</th>
            </tr>
          </thead>
          <tbody>
            {kunden.map((kunde) => (
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
        {!laden && kunden.length === 0 && !fehler && (
          <p className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
            Keine Kunden gefunden.
          </p>
        )}
        {laden && (
          <p className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
            Laden...
          </p>
        )}
      </div>
    </div>
  );
}
