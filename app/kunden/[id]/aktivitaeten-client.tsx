"use client";

import { useState } from "react";
import { Phone, Mail, FileText, CalendarDays, Plus, Trash2, Loader2 } from "lucide-react";
import { Aktivitaet, AktivitaetTyp } from "@/types";
import { supabase } from "@/lib/supabase";

const TYP_ICON: Record<AktivitaetTyp, React.ReactNode> = {
  Anruf:          <Phone className="h-4 w-4" />,
  "E-Mail":       <Mail className="h-4 w-4" />,
  Notiz:          <FileText className="h-4 w-4" />,
  "Besuch/Termin":<CalendarDays className="h-4 w-4" />,
};

const TYP_COLOR: Record<AktivitaetTyp, string> = {
  Anruf:          "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  "E-Mail":       "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  Notiz:          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  "Besuch/Termin":"bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

function formatDatum(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AktivitaetenClient({
  kundeUuid,
  initialAktivitaeten,
  currentUserId,
}: {
  kundeUuid: string;
  initialAktivitaeten: Aktivitaet[];
  currentUserId: string;
}) {
  const [aktivitaeten, setAktivitaeten] = useState<Aktivitaet[]>(initialAktivitaeten);
  const [modalOffen, setModalOffen] = useState(false);
  const [typ, setTyp] = useState<AktivitaetTyp>("Anruf");
  const [betreff, setBetreff] = useState("");
  const [inhalt, setInhalt] = useState("");
  const [betreffFehler, setBetreffFehler] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);

  function oeffneModal() {
    setTyp("Anruf");
    setBetreff("");
    setInhalt("");
    setBetreffFehler(false);
    setFehler(null);
    setModalOffen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!betreff.trim()) {
      setBetreffFehler(true);
      return;
    }
    setIsSubmitting(true);
    setFehler(null);

    const { data, error } = await supabase
      .from("aktivitaeten")
      .insert({
        kunde_id: kundeUuid,
        typ,
        betreff: betreff.trim(),
        inhalt: inhalt.trim() || null,
        erstellt_von: currentUserId,
      })
      .select()
      .single();

    setIsSubmitting(false);

    if (error || !data) {
      setFehler("Fehler beim Speichern: " + (error?.message ?? "Unbekannt"));
      return;
    }

    setAktivitaeten([data as Aktivitaet, ...aktivitaeten]);
    setModalOffen(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Aktivität wirklich löschen?")) return;
    setDeleteLoading(id);
    const { error } = await supabase.from("aktivitaeten").delete().eq("id", id);
    setDeleteLoading(null);
    if (error) {
      setFehler("Fehler beim Löschen: " + error.message);
      return;
    }
    setAktivitaeten((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200">
          Aktivitäts-Historie
        </h2>
        <button
          onClick={oeffneModal}
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Aktivität anlegen
        </button>
      </div>

      {fehler && (
        <div className="mx-6 mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {fehler}
        </div>
      )}

      {/* Leerzustand */}
      {aktivitaeten.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Noch keine Aktivitäten erfasst.
          </p>
          <button
            onClick={oeffneModal}
            className="inline-flex items-center gap-1.5 rounded-md border border-blue-300 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950"
          >
            <Plus className="h-3.5 w-3.5" />
            Erste Aktivität anlegen
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {aktivitaeten.map((a) => (
            <li key={a.id} className="flex items-start gap-4 px-6 py-4">
              <span
                className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${TYP_COLOR[a.typ as AktivitaetTyp]}`}
              >
                {TYP_ICON[a.typ as AktivitaetTyp]}
                {a.typ}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {a.betreff}
                </p>
                {a.inhalt && (
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    {a.inhalt}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {formatDatum(a.erstellt_am)}
                </p>
              </div>
              {a.erstellt_von === currentUserId && (
                <button
                  onClick={() => handleDelete(a.id)}
                  disabled={deleteLoading === a.id}
                  className="ml-auto shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400 disabled:opacity-40"
                  title="Aktivität löschen"
                >
                  {deleteLoading === a.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Modal */}
      {modalOffen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOffen(false);
          }}
        >
          <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
              Aktivität anlegen
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-500 dark:text-gray-400">
                  Typ <span className="text-red-500">*</span>
                </label>
                <select
                  value={typ}
                  onChange={(e) => setTyp(e.target.value as AktivitaetTyp)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-1.5 text-sm"
                >
                  <option>Anruf</option>
                  <option>E-Mail</option>
                  <option>Notiz</option>
                  <option>Besuch/Termin</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-500 dark:text-gray-400">
                  Betreff <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={betreff}
                  onChange={(e) => {
                    setBetreff(e.target.value);
                    if (e.target.value.trim()) setBetreffFehler(false);
                  }}
                  className={`w-full rounded-md border px-3 py-1.5 text-sm dark:bg-gray-800 dark:text-gray-100 ${
                    betreffFehler
                      ? "border-red-400 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="z. B. Erstgespräch geführt"
                />
                {betreffFehler && (
                  <p className="mt-1 text-xs text-red-500">
                    Betreff darf nicht leer sein.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-500 dark:text-gray-400">
                  Inhalt (optional)
                </label>
                <textarea
                  value={inhalt}
                  onChange={(e) => setInhalt(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-1.5 text-sm"
                  placeholder="Details zur Aktivität…"
                />
              </div>

              {fehler && (
                <p className="text-sm text-red-600 dark:text-red-400">{fehler}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOffen(false)}
                  className="rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
