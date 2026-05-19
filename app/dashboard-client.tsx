"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, CheckCircle, AlertTriangle } from "lucide-react";
import { Kunde, KundenStatus } from "@/types";

export default function DashboardClient({ kunden }: { kunden: Kunde[] }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<KundenStatus | "alle">(
    "alle"
  );
  const [suchbegriff, setSuchbegriff] = useState("");

  const gesamt = kunden.length;
  const aktive = kunden.filter((k) => k.status === "aktiv").length;
  const beschwerden = kunden.filter((k) => k.status === "beschwerde").length;

  const gefilterteKunden = kunden.filter((k) => {
    const statusPasst =
      statusFilter === "alle" || k.status === statusFilter;
    const suchPasst =
      suchbegriff === "" ||
      k.firma.toLowerCase().includes(suchbegriff.toLowerCase()) ||
      k.ansprechpartner.toLowerCase().includes(suchbegriff.toLowerCase());
    return statusPasst && suchPasst;
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Gesamtkunden</p>
              <p className="text-2xl font-bold">{gesamt}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Aktive Kunden</p>
              <p className="text-2xl font-bold">{aktive}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-500">Beschwerden</p>
              <p className="text-2xl font-bold">{beschwerden}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-4 sm:flex-row">
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as KundenStatus | "alle")
          }
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="alle">Alle Status</option>
          <option value="aktiv">Aktiv</option>
          <option value="in_wartung">In Wartung</option>
          <option value="beschwerde">Beschwerde</option>
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
                Anlagengroesse (kWp)
              </th>
              <th className="px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 font-medium text-gray-600">
                Letzter Kontakt
              </th>
            </tr>
          </thead>
          <tbody>
            {gefilterteKunden.map((kunde) => (
              <tr
                key={kunde.id}
                onClick={() => router.push(`/kunden/${kunde.id}`)}
                className="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-medium">{kunde.firma}</td>
                <td className="px-4 py-3">{kunde.ansprechpartner}</td>
                <td className="px-4 py-3">{kunde.branche}</td>
                <td className="px-4 py-3">{kunde.anlagengroesse_kwp}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                      kunde.status === "aktiv"
                        ? "bg-green-100 text-green-700"
                        : kunde.status === "in_wartung"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {kunde.status === "aktiv"
                      ? "Aktiv"
                      : kunde.status === "in_wartung"
                        ? "In Wartung"
                        : "Beschwerde"}
                  </span>
                </td>
                <td className="px-4 py-3">{kunde.letzter_kontakt}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {gefilterteKunden.length === 0 && (
          <p className="px-4 py-8 text-center text-gray-400">
            Keine Kunden gefunden.
          </p>
        )}
      </div>
    </div>
  );
}
