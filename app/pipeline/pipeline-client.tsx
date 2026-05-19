"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Trophy, Euro } from "lucide-react";
import { PipelineEintrag, PipelineStatus } from "@/types";

const STATUS_LABEL: Record<PipelineStatus, string> = {
  erstkontakt: "Erstkontakt",
  angebot_raus: "Angebot raus",
  verhandlung: "Verhandlung",
  gewonnen: "Gewonnen",
  verloren: "Verloren",
};

const STATUS_STYLE: Record<PipelineStatus, string> = {
  erstkontakt: "bg-gray-100 text-gray-700",
  angebot_raus: "bg-blue-100 text-blue-700",
  verhandlung: "bg-orange-100 text-orange-700",
  gewonnen: "bg-green-100 text-green-700",
  verloren: "bg-red-100 text-red-700",
};

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
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Aktives Volumen</p>
              <p className="text-2xl font-bold">
                {gesamtvolumen.toLocaleString("de-DE")} €
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Gewonnen</p>
              <p className="text-2xl font-bold">
                {gewonnenvolumen.toLocaleString("de-DE")} €
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <Euro className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-500">Einträge gesamt</p>
              <p className="text-2xl font-bold">{eintraege.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-4 sm:flex-row">
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as PipelineStatus | "alle")
          }
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
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
          className="rounded-md border border-gray-300 px-3 py-2 text-sm sm:w-80"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Firma</th>
              <th className="px-4 py-3 font-medium text-gray-600">
                Ansprechpartner
              </th>
              <th className="px-4 py-3 font-medium text-gray-600">Branche</th>
              <th className="px-4 py-3 font-medium text-gray-600">
                Volumen (€)
              </th>
              <th className="px-4 py-3 font-medium text-gray-600">
                Angebotsdatum
              </th>
              <th className="px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {gefiltert.map((eintrag) => (
              <tr
                key={eintrag.id}
                onClick={() => router.push(`/pipeline/${eintrag.id}`)}
                className="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
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
                    className={`rounded-full px-2 py-1 text-xs font-medium border-0 cursor-pointer ${STATUS_STYLE[eintrag.status]}`}
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
          <p className="px-4 py-8 text-center text-gray-400">
            Keine Einträge gefunden.
          </p>
        )}
      </div>
    </div>
  );
}
