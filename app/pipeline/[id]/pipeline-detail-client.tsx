"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PipelineEintrag } from "@/types";

export default function PipelineDetailClient({
  eintrag,
}: {
  eintrag: PipelineEintrag;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    anlagengroesse_kwp: eintrag.anlagengroesse_kwp,
    volumen_eur: eintrag.volumen_eur ?? 0,
    angebotsdatum: eintrag.angebotsdatum,
    status: eintrag.status,
    notiz: eintrag.notiz,
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
        next.volumen_eur = Math.round(Number(value) * 900);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/pipeline/${eintrag.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    router.push("/pipeline");
  }

  return (
    <div>
      <Link
        href="/pipeline"
        className="mb-6 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Pipeline
      </Link>

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
        <h1 className="mb-1 text-2xl font-bold">{eintrag.firma}</h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          {eintrag.ansprechpartner} &middot; {eintrag.branche}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Anlagengrösse (kWp)
              </label>
              <input
                type="number"
                name="anlagengroesse_kwp"
                value={formData.anlagengroesse_kwp}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Volumen (€)
              </label>
              <input
                type="number"
                name="volumen_eur"
                value={formData.volumen_eur}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Angebotsdatum
              </label>
              <input
                type="date"
                name="angebotsdatum"
                value={formData.angebotsdatum}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm"
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
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notiz
            </label>
            <textarea
              name="notiz"
              value={formData.notiz}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
