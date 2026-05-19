"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Kunde, PipelineEintrag, PipelineStatus } from "@/types";
import StatusBadge from "@/app/status-badge";

const PIPELINE_LABEL: Record<PipelineStatus, string> = {
  erstkontakt: "Erstkontakt",
  angebot_raus: "Angebot raus",
  verhandlung: "Verhandlung",
  gewonnen: "Gewonnen",
  verloren: "Verloren",
};

const PIPELINE_STYLE: Record<PipelineStatus, string> = {
  erstkontakt: "bg-gray-100 text-gray-700",
  angebot_raus: "bg-blue-100 text-blue-700",
  verhandlung: "bg-orange-100 text-orange-700",
  gewonnen: "bg-green-100 text-green-700",
  verloren: "bg-red-100 text-red-700",
};

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

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{kunde.firma}</h1>
          <StatusBadge status={kunde.status} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Ansprechpartner</p>
            <p className="font-medium">{kunde.ansprechpartner}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Branche</p>
            <p className="font-medium">{kunde.branche}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Anlagengroesse</p>
            <p className="font-medium">{kunde.anlagengroesse_kwp} kWp</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Letzter Kontakt</p>
            <p className="font-medium">{kunde.letzter_kontakt}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Telefon</p>
            <p className="font-medium">{kunde.telefon}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">E-Mail</p>
            <p className="font-medium">{kunde.email}</p>
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-1 block text-sm text-gray-500">Notiz</label>
          <textarea
            value={notiz}
            onChange={(e) => setNotiz(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-gray-400">
            Aenderungen werden nicht gespeichert.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-800">Pipeline-Einträge</h2>
          <Link
            href={`/pipeline/neu?kundeId=${kunde.id}&firma=${encodeURIComponent(kunde.firma)}&ansprechpartner=${encodeURIComponent(kunde.ansprechpartner)}&branche=${encodeURIComponent(kunde.branche)}`}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            + Neuer Pipeline-Eintrag
          </Link>
        </div>
        {pipelineEintraege.length === 0 ? (
          <p className="px-6 py-4 text-sm text-gray-400">
            Kein Pipeline-Eintrag vorhanden.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-600">Status</th>
                <th className="px-6 py-3 font-medium text-gray-600">Volumen (€)</th>
                <th className="px-6 py-3 font-medium text-gray-600">Angebotsdatum</th>
                <th className="px-6 py-3 font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody>
              {pipelineEintraege.map((e) => (
                <tr key={e.id} className="border-t border-gray-100">
                  <td className="px-6 py-3">
                    <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${PIPELINE_STYLE[e.status]}`}>
                      {PIPELINE_LABEL[e.status]}
                    </span>
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
