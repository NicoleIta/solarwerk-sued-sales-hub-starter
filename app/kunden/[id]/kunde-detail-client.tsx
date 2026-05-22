"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Kunde, PipelineEintrag } from "@/types";
import StatusBadge from "@/app/status-badge";
import InfoField from "@/components/info-field";
import PipelineStatusBadge from "@/components/pipeline-status-badge";

export default function KundeDetailClient({
  kunde,
  pipelineEintraege,
}: {
  kunde: Kunde;
  pipelineEintraege: PipelineEintrag[];
}) {
  const [notiz, setNotiz] = useState(kunde.notiz);

  return (
    <div>
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurueck zum Dashboard
      </Link>

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{kunde.firma}</h1>
          <StatusBadge status={kunde.status} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoField label="Ansprechpartner" value={kunde.ansprechpartner} />
          <InfoField label="Branche"         value={kunde.branche} />
          <InfoField label="Anlagengroesse"  value={`${kunde.anlagengroesse_kwp} kWp`} />
          <InfoField label="Letzter Kontakt" value={kunde.letzter_kontakt} />
          <InfoField label="Telefon"         value={kunde.telefon} />
          <InfoField label="E-Mail"          value={kunde.email} />
        </div>

        <div className="mt-6">
          <label className="mb-1 block text-sm text-gray-500 dark:text-gray-400">Notiz</label>
          <textarea
            value={notiz}
            onChange={(e) => setNotiz(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Aenderungen werden nicht gespeichert.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">Pipeline-Einträge</h2>
          <Link
            href={`/pipeline/neu?kundeId=${kunde.id}&firma=${encodeURIComponent(kunde.firma)}&ansprechpartner=${encodeURIComponent(kunde.ansprechpartner)}&branche=${encodeURIComponent(kunde.branche)}`}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            + Neuer Pipeline-Eintrag
          </Link>
        </div>
        {pipelineEintraege.length === 0 ? (
          <p className="px-6 py-4 text-sm text-gray-400 dark:text-gray-500">
            Kein Pipeline-Eintrag vorhanden.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">Volumen (€)</th>
                <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">Angebotsdatum</th>
                <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400"></th>
              </tr>
            </thead>
            <tbody>
              {pipelineEintraege.map((e) => (
                <tr key={e.id} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-6 py-3">
                    <PipelineStatusBadge status={e.status} />
                  </td>
                  <td className="px-6 py-3">{(e.volumen_eur ?? 0).toLocaleString("de-DE")} €</td>
                  <td className="px-6 py-3">{e.angebotsdatum}</td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      href={`/pipeline/${e.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Bearbeiten →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
