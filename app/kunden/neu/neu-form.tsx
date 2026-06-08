"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/form-field";
import { UserRole } from "@/types";
import { isAdminOrTeamleiter } from "@/lib/permissions";
import { validiereNeuerKunde } from "@/lib/validierung";

type ActiveUser = { id: string; vorname: string; nachname: string };

interface Props {
  activeUsers: ActiveUser[];
  currentUserId: string;
  currentUserRole: UserRole;
}


export default function NeuerKundeForm({ activeUsers, currentUserId, currentUserRole }: Props) {
  const router = useRouter();
  const istBerechtigt = isAdminOrTeamleiter(currentUserRole);

  const [formData, setFormData] = useState({
    firma: "",
    ansprechpartner: "",
    branche: "",
    anlagengroesse_kwp: "",
    status: "aktiv",
    telefon: "",
    email: "",
    notiz: "",
    zustaendig_id: currentUserId,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dubletteWarnung, setDubletteWarnung] = useState<{ id: number; name: string; firma: string } | null>(null);
  const [dubletteModalOffen, setDubletteModalOffen] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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
    const result = validiereNeuerKunde({ ...formData, [name]: value });
    const feldFehler = result.find(f => f.feld === name);
    if (feldFehler) {
      setErrors(prev => ({ ...prev, [name]: feldFehler.meldung }));
    }
  }

  async function handleEmailBlur(e: React.FocusEvent<HTMLInputElement>) {
    handleBlur(e);
    const email = e.target.value.trim();
    if (!email) {
      setDubletteWarnung(null);
      return;
    }
    try {
      const res = await fetch("/api/dubletten-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.treffer) {
        setDubletteWarnung(data.treffer);
        setDubletteModalOffen(true);
      } else {
        setDubletteWarnung(null);
      }
    } catch {
      // API-Fehler ignorieren — Formular bleibt bedienbar
    }
  }

  async function handleAnsprechpartnerUebernehmen() {
    if (!dubletteWarnung) return;
    try {
      await fetch(`/api/kunden/${dubletteWarnung.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ansprechpartner: formData.ansprechpartner }),
      });
      router.push(`/kunden/${dubletteWarnung.id}`);
    } catch {
      setDubletteModalOffen(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fehler = validiereNeuerKunde({
      firma: formData.firma,
      ansprechpartner: formData.ansprechpartner,
      telefon: formData.telefon,
      email: formData.email,
    });
    if (fehler.length > 0) {
      const newErrors: Record<string, string> = {};
      fehler.forEach(f => { newErrors[f.feld] = f.meldung });
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

      {/* Dubletten-Modal */}
      {dubletteModalOffen && dubletteWarnung && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-lg font-semibold mb-2">Mögliche Dublette gefunden</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Es gibt bereits einen ähnlichen Kunden:{" "}
              <strong>{dubletteWarnung.name}</strong> bei <strong>{dubletteWarnung.firma}</strong>.
            </p>
            {formData.ansprechpartner && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Soll der Ansprechpartner dort auf{" "}
                <strong>{formData.ansprechpartner}</strong> aktualisiert werden?
              </p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleAnsprechpartnerUebernehmen}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Ansprechpartner übernehmen
              </button>
              <button
                type="button"
                onClick={() => setDubletteModalOffen(false)}
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Trotzdem neu anlegen
              </button>
            </div>
          </div>
        </div>
      )}

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

          <FormField label="Zuständiger Mitarbeiter" required>
            <select
              name="zustaendig_id"
              value={formData.zustaendig_id}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm"
            >
              {activeUsers.map((u) => (
                <option
                  key={u.id}
                  value={u.id}
                  disabled={!istBerechtigt && u.id !== currentUserId}
                >
                  {u.vorname} {u.nachname}
                </option>
              ))}
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
              onBlur={handleEmailBlur}
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
