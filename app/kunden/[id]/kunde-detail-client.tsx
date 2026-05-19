"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Kunde } from "@/types";
import StatusBadge from "@/app/status-badge";

export default function KundeDetailClient({ kunde }: { kunde: Kunde }) {
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
    </div>
  );
}
