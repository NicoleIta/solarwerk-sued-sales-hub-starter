"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FormField from "@/components/form-field";

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
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (value.trim()) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    if ((name === "anlagengroesse_kwp" || name === "angebotsdatum") && !value.trim()) {
      setErrors((prev) => ({ ...prev, [name]: "Pflichtfeld" }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.anlagengroesse_kwp.trim()) newErrors.anlagengroesse_kwp = "Pflichtfeld";
    if (!formData.angebotsdatum.trim()) newErrors.angebotsdatum = "Pflichtfeld";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
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

  const inputClass = (field: string) =>
    `w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 ${
      errors[field]
        ? "border-red-500 dark:border-red-500"
        : "border-gray-300 dark:border-gray-600"
    }`;

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
        className="max-w-2xl rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Firma">
            <input
              type="text"
              name="firma"
              value={formData.firma}
              readOnly
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-500 dark:text-gray-400"
            />
          </FormField>

          <FormField label="Ansprechpartner">
            <input
              type="text"
              name="ansprechpartner"
              value={formData.ansprechpartner}
              readOnly
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-500 dark:text-gray-400"
            />
          </FormField>

          <FormField label="Branche">
            <input
              type="text"
              name="branche"
              value={formData.branche}
              readOnly
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-500 dark:text-gray-400"
            />
          </FormField>

          <FormField label="Anlagengrösse (kWp)" required error={errors.anlagengroesse_kwp}>
            <input
              type="number"
              name="anlagengroesse_kwp"
              value={formData.anlagengroesse_kwp}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass("anlagengroesse_kwp")}
            />
          </FormField>

          <FormField label="Volumen (€)">
            <input
              type="number"
              name="volumen_eur"
              value={formData.volumen_eur}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm"
            />
          </FormField>

          <FormField label="Angebotsdatum" required error={errors.angebotsdatum}>
            <input
              type="date"
              name="angebotsdatum"
              value={formData.angebotsdatum}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass("angebotsdatum")}
            />
          </FormField>

          <FormField label="Status">
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
          </FormField>
        </div>

        <div className="mt-4">
          <FormField label="Notiz">
            <textarea
              name="notiz"
              value={formData.notiz}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm"
            />
          </FormField>
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
