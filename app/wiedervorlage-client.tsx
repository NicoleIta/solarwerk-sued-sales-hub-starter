"use client";

import { useState, useEffect } from "react";
import { Plus, Check, Loader2, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Wiedervorlage } from "@/types";
import { supabase } from "@/lib/supabase";

function formatDatum(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function istUeberfaellig(iso: string): boolean {
  return iso < new Date().toISOString().slice(0, 10);
}

export default function WiedervorlageClient({
  customerId,
  pipelineEntryId,
  currentUserId,
}: {
  customerId?: string;
  pipelineEntryId?: string;
  currentUserId: string;
}) {
  const [wiedervorlagen, setWiedervorlagen] = useState<Wiedervorlage[]>([]);
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);
  const [formOffen, setFormOffen] = useState(false);
  const [archivOffen, setArchivOffen] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [reason, setReason] = useState("");
  const [dueDateFehler, setDueDateFehler] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erledigenLaden, setErledigenLaden] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWiedervorlagen() {
      let q = supabase
        .from("wiedervorlagen")
        .select("*")
        .eq("user_id", currentUserId);
      if (customerId) q = q.eq("customer_id", customerId);
      if (pipelineEntryId) q = q.eq("pipeline_entry_id", pipelineEntryId);
      const { data, error } = await q.order("due_date", { ascending: true });
      if (error) setFehler("Laden fehlgeschlagen: " + error.message);
      else setWiedervorlagen((data ?? []) as Wiedervorlage[]);
      setLaden(false);
    }
    fetchWiedervorlagen();
  }, [customerId, pipelineEntryId, currentUserId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dueDate) {
      setDueDateFehler(true);
      return;
    }
    setIsSubmitting(true);
    setFehler(null);
    const { data, error } = await supabase
      .from("wiedervorlagen")
      .insert({
        customer_id: customerId ?? null,
        pipeline_entry_id: pipelineEntryId ?? null,
        due_date: dueDate,
        reason: reason.trim() || null,
        user_id: currentUserId,
      })
      .select()
      .single();
    setIsSubmitting(false);
    if (error || !data) {
      setFehler("Fehler beim Speichern: " + (error?.message ?? "Unbekannt"));
      return;
    }
    setWiedervorlagen((prev) =>
      [...prev, data as Wiedervorlage].sort((a, b) =>
        a.due_date.localeCompare(b.due_date)
      )
    );
    setDueDate("");
    setReason("");
    setFormOffen(false);
  }

  async function handleErledigen(id: string) {
    setErledigenLaden(id);
    const { error } = await supabase
      .from("wiedervorlagen")
      .update({ status: "erledigt" })
      .eq("id", id);
    setErledigenLaden(null);
    if (error) {
      setFehler("Fehler: " + error.message);
      return;
    }
    setWiedervorlagen((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: "erledigt" as const } : w))
    );
  }

  const offene = wiedervorlagen.filter((w) => w.status === "offen");
  const erledigte = wiedervorlagen.filter((w) => w.status === "erledigt");

  return (
    <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h2 className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200">
          <Clock className="h-4 w-4" />
          Wiedervorlagen
          {offene.length > 0 && (
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900 dark:text-orange-300">
              {offene.length}
            </span>
          )}
        </h2>
        {!formOffen && (
          <button
            onClick={() => setFormOffen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Wiedervorlage hinzufügen
          </button>
        )}
      </div>

      {fehler && (
        <div className="mx-6 mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {fehler}
        </div>
      )}

      {formOffen && (
        <form
          onSubmit={handleSubmit}
          className="border-b border-gray-100 dark:border-gray-700 px-6 py-4 space-y-3"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-500 dark:text-gray-400">
                Fälligkeitsdatum <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  setDueDateFehler(false);
                }}
                className={`w-full rounded-md border px-3 py-1.5 text-sm dark:bg-gray-800 dark:text-gray-100 ${
                  dueDateFehler
                    ? "border-red-400 dark:border-red-600"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {dueDateFehler && (
                <p className="mt-1 text-xs text-red-500">
                  Bitte ein Datum angeben.
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-500 dark:text-gray-400">
                Grund (optional)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="z. B. Angebot nachfassen"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-1.5 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Speichern
            </button>
            <button
              type="button"
              onClick={() => {
                setFormOffen(false);
                setDueDateFehler(false);
                setDueDate("");
                setReason("");
              }}
              className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {laden ? (
        <p className="px-6 py-4 text-sm text-gray-400">Laden…</p>
      ) : offene.length === 0 && !formOffen ? (
        <p className="px-6 py-4 text-sm text-gray-400 dark:text-gray-500">
          Keine offenen Wiedervorlagen.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {offene.map((wv) => {
            const ueberfaellig = istUeberfaellig(wv.due_date);
            return (
              <li
                key={wv.id}
                className="flex items-center justify-between gap-4 px-6 py-3"
              >
                <div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      ueberfaellig
                        ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    {ueberfaellig ? "Überfällig" : "Offen"}: {formatDatum(wv.due_date)}
                  </span>
                  {wv.reason && (
                    <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">
                      {wv.reason}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleErledigen(wv.id)}
                  disabled={erledigenLaden === wv.id}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-green-300 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950 disabled:opacity-50"
                >
                  {erledigenLaden === wv.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  Erledigt
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {erledigte.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setArchivOffen(!archivOffen)}
            className="flex w-full items-center justify-between px-6 py-3 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span>Archiv ({erledigte.length} erledigt)</span>
            {archivOffen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {archivOffen && (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700 pb-2">
              {erledigte.map((wv) => (
                <li
                  key={wv.id}
                  className="flex items-center gap-3 px-6 py-2.5 opacity-60"
                >
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    <Check className="h-3 w-3" />
                    {formatDatum(wv.due_date)}
                  </span>
                  {wv.reason && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {wv.reason}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
