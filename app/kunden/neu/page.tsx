"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/form-field";

const REQUIRED_FIELDS = ["firma", "ansprechpartner", "telefon", "email"] as const;

export default function NeuerKundePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firma: "",
    ansprechpartner: "",
    branche: "",
    anlagengroesse_kwp: "",
    status: "aktiv",
    telefon: "",
    email: "",
    notiz: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    if (REQUIRED_FIELDS.includes(name as typeof REQUIRED_FIELDS[number]) && !value.trim()) {
      setErrors((prev) => ({ ...prev, [name]: "Pflichtfeld" }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    for (const field of REQUIRED_FIELDS) {
      if (!formData[field].trim()) newErrors[field] = "Pflichtfeld";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    await fetch("/api/kunden", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    router.push("/");
  }

  const inputClass = (field: string) =>
    `w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 ${
      errors[field]
        ? "border-red-500 dark:border-red-500"
        : "border-gray-300 dark:border-gray-600"
    }`;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Neuen Kunden anlegen</h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Firma" required error={errors.firma}>
            <input
              type="text"
              name="firma"
              value={formData.firma}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass("firma")}
            />
          </FormField>

          <FormField label="Ansprechpartner" required error={errors.ansprechpartner}>
            <input
              type="text"
              name="ansprechpartner"
              value={formData.ansprechpartner}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass("ansprechpartner")}
            />
          </FormField>

          <FormField label="Branche">
            <input
              type="text"
              name="branche"
              value={formData.branche}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm"
            />
          </FormField>

          <FormField label="Anlagengroesse (kWp)">
            <input
              type="number"
              name="anlagengroesse_kwp"
              value={formData.anlagengroesse_kwp}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm"
            />
          </FormField>

          <FormField label="Status">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm"
            >
              <option value="aktiv">Aktiv</option>
              <option value="in_wartung">In Wartung</option>
              <option value="beschwerde">Beschwerde</option>
            </select>
          </FormField>

          <FormField label="Telefon" required error={errors.telefon}>
            <input
              type="text"
              name="telefon"
              value={formData.telefon}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass("telefon")}
            />
          </FormField>

          <FormField label="E-Mail" required error={errors.email}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass("email")}
            />
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
            Kunde anlegen
          </button>
        </div>
      </form>
    </div>
  );
}
