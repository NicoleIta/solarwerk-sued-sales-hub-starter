"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/kunden", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    router.push("/");
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Neuen Kunden anlegen</h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Firma
            </label>
            <input
              type="text"
              name="firma"
              value={formData.firma}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ansprechpartner
            </label>
            <input
              type="text"
              name="ansprechpartner"
              value={formData.ansprechpartner}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Branche
            </label>
            <input
              type="text"
              name="branche"
              value={formData.branche}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Anlagengroesse (kWp)
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
              Status
            </label>
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
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Telefon
            </label>
            <input
              type="text"
              name="telefon"
              value={formData.telefon}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              E-Mail
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm"
            />
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
            Kunde anlegen
          </button>
        </div>
      </form>
    </div>
  );
}
