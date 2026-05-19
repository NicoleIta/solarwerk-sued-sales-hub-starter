"use client";

import { BarChart3, Trophy, Zap, TrendingUp } from "lucide-react";
import { Kunde, PipelineEintrag, PipelineStatus } from "@/types";

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

export default function BerichteClient({
  kunden,
  pipeline,
}: {
  kunden: Kunde[];
  pipeline: PipelineEintrag[];
}) {
  const gewonnen = pipeline.filter((e) => e.status === "gewonnen").length;
  const verloren = pipeline.filter((e) => e.status === "verloren").length;
  const gewinnQuote =
    gewonnen + verloren > 0
      ? Math.round((gewonnen / (gewonnen + verloren)) * 100)
      : 0;

  const avgAnlage =
    kunden.length > 0
      ? Math.round(
          kunden.reduce((sum, k) => sum + k.anlagengroesse_kwp, 0) /
            kunden.length
        )
      : 0;

  const gesamtvolumen = pipeline.reduce((sum, e) => sum + (e.volumen_eur ?? 0), 0);

  const volumenProBranche = pipeline.reduce<Record<string, number>>(
    (acc, e) => {
      acc[e.branche] = (acc[e.branche] ?? 0) + (e.volumen_eur ?? 0);
      return acc;
    },
    {}
  );

  const statusUebersicht = pipeline.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Berichte</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pipeline-Volumen</p>
              <p className="text-2xl font-bold">
                {gesamtvolumen.toLocaleString("de-DE")} €
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gewinn-Quote</p>
              <p className="text-2xl font-bold">{gewinnQuote} %</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ø Anlagengröße</p>
              <p className="text-2xl font-bold">{avgAnlage} kWp</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Deals gesamt</p>
              <p className="text-2xl font-bold">{pipeline.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">Volumen pro Branche</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Branche</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400 text-right">
                  Volumen (€)
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(volumenProBranche)
                .sort(([, a], [, b]) => b - a)
                .map(([branche, volumen]) => (
                  <tr key={branche} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-3">{branche}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {volumen.toLocaleString("de-DE")}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">
              Pipeline-Status Übersicht
            </h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400 text-right">
                  Anzahl
                </th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(STATUS_LABEL) as PipelineStatus[]).map((status) => (
                <tr key={status} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLE[status]}`}
                    >
                      {STATUS_LABEL[status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {statusUebersicht[status] ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
