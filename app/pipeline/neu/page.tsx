"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function NeuerPipelineEintragForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const kundeId = searchParams.get("kundeId") ?? "";
  const [formData, setFormData] = useState({
    firma: searchParams.get("firma") ?? "",
    ansprechpartner: searchParams.get("ansprechpartner") ?? "",
    branche: searchParams.get("branche") ?? "",
    anlagengroesse_kwp: "",
    volumen_eur: "",
    angebotsdatum: "",
    status: "erstkontakt",
    notiz: "",
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "anlagengroesse_kwp" && value !== "") {
        next.volumen_eur = String(Math.round(Number(value) * 900));
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (kundeId) {
      router.push(`/kunden/${kundeId}`);
    } else {
      router.push("/pipeline");
    }
  }

  const zurueckHref = kundeId ? `/kunden/${kundeId}` : "/pipeline";

  return (
    <div>
      <Link
        href={zurueckHref}
        className="mb-6 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück
      </Link>

      <h1 className="mb-6 text-2xl font-bold">Neuer Pipeline-Eintrag</h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl rounded-lg border border-gray-200 bg-white p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Firma
            </label>
            <input
              type="text"
              name="firma"
              value={formData.firma}
              readOnly
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Ansprechpartner
            </label>
            <input
              type="text"
              name="ansprechpartner"
              value={formData.ansprechpartner}
              readOnly
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Branche
            </label>
            <input
              type="text"
              name="branche"
              value={formData.branche}
              readOnly
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Anlagengrösse (kWp)
            </label>
            <input
              type="number"
              name="anlagengroesse_kwp"
              value={formData.anlagengroesse_kwp}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Volumen (€)
            </label>
            <input
              type="number"
              name="volumen_eur"
              value={formData.volumen_eur}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Angebotsdatum
            </label>
            <input
              type="date"
              name="angebotsdatum"
              value={formData.angebotsdatum}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="erstkontakt">Erstkontakt</option>
              <option value="angebot_raus">Angebot raus</option>
              <option value="verhandlung">Verhandlung</option>
              <option value="gewonnen">Gewonnen</option>
              <option value="verloren">Verloren</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Notiz
          </label>
          <textarea
            name="notiz"
            value={formData.notiz}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Eintrag speichern
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NeuerPipelineEintragPage() {
  return (
    <Suspense>
      <NeuerPipelineEintragForm />
    </Suspense>
  );
}
