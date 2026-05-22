"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Trophy, Euro } from "lucide-react";
import { PipelineEintrag, PipelineStatus } from "@/types";
import { PIPELINE_LABEL, PIPELINE_STYLE } from "@/components/pipeline-status-badge";
import StatKarte from "@/components/stat-karte";

export default function PipelineClient({
  eintraege,
}: {
  eintraege: PipelineEintrag[];
}) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<PipelineStatus | "alle">(
    "alle"
  );
  const [suchbegriff, setSuchbegriff] = useState("");

  const aktive = eintraege.filter((e) => e.status !== "verloren");
  const gewonnen = eintraege.filter((e) => e.status === "gewonnen");
  const gesamtvolumen = aktive.reduce((sum, e) => sum + e.volumen_eur, 0);
  const gewonnenvolumen = gewonnen.reduce((sum, e) => sum + e.volumen_eur, 0);

  const gefiltert = eintraege.filter((e) => {
    const statusPasst = statusFilter === "alle" || e.status === statusFilter;
    const suchPasst =
      suchbegriff === "" ||
      e.firma.toLowerCase().includes(suchbegriff.toLowerCase()) ||
      e.ansprechpartner.toLowerCase().includes(suchbegriff.toLowerCase());
    return statusPasst && suchPasst;
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Pipeline</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatKarte icon={TrendingUp} label="Aktives Volumen" wert={`${gesamtvolumen.toLocaleString("de-DE")} €`}  farbe="blue"   />
        <StatKarte icon={Trophy}     label="Gewonnen"        wert={`${gewonnenvolumen.toLocaleString("de-DE")} €`} farbe="green"  />
        <StatKarte icon={Euro}       label="Einträge gesamt" wert={eintraege.length}                               farbe="orange" />
      </div>

      <div className="mb-4 flex flex-col gap-4 sm:flex-row">
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as PipelineStatus | "alle")
          }
          className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm"
        >
          <option value="alle">Alle Status</option>
          <option value="erstkontakt">Erstkontakt</option>
          <option value="angebot_raus">Angebot raus</option>
          <option value="verhandlung">Verhandlung</option>
          <option value="gewonnen">Gewonnen</option>
          <option value="verloren">Verloren</option>
        </select>
        <input
          type="text"
          placeholder="Suche nach Firma oder Ansprechpartner..."
          value={suchbegriff}
          onChange={(e) => setSuchbegriff(e.target.value)}
          className="rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm sm:w-80"
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
                Volumen (€)
              </th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                Angebotsdatum
              </th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {gefiltert.map((eintrag) => (
              <tr
                key={eintrag.id}
                onClick={() => router.push(`/pipeline/${eintrag.id}`)}
                className="cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-4 py-3 font-medium">{eintrag.firma}</td>
                <td className="px-4 py-3">{eintrag.ansprechpartner}</td>
                <td className="px-4 py-3">{eintrag.branche}</td>
                <td className="px-4 py-3">
                  {(eintrag.volumen_eur ?? 0).toLocaleString("de-DE")}
                </td>
                <td className="px-4 py-3">{eintrag.angebotsdatum}</td>
                <td className="px-4 py-3">
                  <select
                    value={eintrag.status}
                    onChange={async (e) => {
                      await fetch(`/api/pipeline/${eintrag.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: e.target.value }),
                      });
                      router.refresh();
                    }}
                    className={`rounded-full px-2 py-1 text-xs font-medium border-0 cursor-pointer ${PIPELINE_STYLE[eintrag.status]}`}
                  >
                    <option value="erstkontakt">Erstkontakt</option>
                    <option value="angebot_raus">Angebot raus</option>
                    <option value="verhandlung">Verhandlung</option>
                    <option value="gewonnen">Gewonnen</option>
                    <option value="verloren">Verloren</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {gefiltert.length === 0 && (
          <p className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
            Keine Einträge gefunden.
          </p>
        )}
      </div>
    </div>
  );
}
