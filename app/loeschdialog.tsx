"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface LoeschDialogProps {
  name: string;
  typ: string;
  aktivitaetenCount: number;
  pipelineCount: number;
  countFehler?: boolean;
  onBestaetigen: () => void | Promise<void>;
  onAbbrechen: () => void;
  isLoading: boolean;
  isSelbst?: boolean;
}

export default function LoeschDialog({
  name,
  typ,
  aktivitaetenCount,
  pipelineCount,
  countFehler,
  onBestaetigen,
  onAbbrechen,
  isLoading,
  isSelbst,
}: LoeschDialogProps) {
  const hatAbhaengigkeiten =
    !countFehler && (aktivitaetenCount > 0 || pipelineCount > 0);

  const [passwort, setPasswort] = useState("");
  const [pwFehler, setPwFehler] = useState("");
  const [pwLaden, setPwLaden] = useState(false);

  const infoParts: string[] = [];
  if (aktivitaetenCount > 0)
    infoParts.push(
      `${aktivitaetenCount} ${aktivitaetenCount === 1 ? "Aktivität" : "Aktivitäten"}`
    );
  if (pipelineCount > 0)
    infoParts.push(
      `${pipelineCount} ${pipelineCount === 1 ? "Pipeline-Eintrag" : "Pipeline-Einträge"}`
    );

  async function handleBestaetigen() {
    if (hatAbhaengigkeiten) {
      setPwLaden(true);
      setPwFehler("");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) {
        setPwFehler("Benutzer nicht gefunden.");
        setPwLaden(false);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwort,
      });
      setPwLaden(false);
      if (error) {
        setPwFehler("Falsches Passwort. Bitte erneut versuchen.");
        return;
      }
    }
    await onBestaetigen();
  }

  const loeschenDisabled =
    isSelbst ||
    isLoading ||
    pwLaden ||
    (hatAbhaengigkeiten && !passwort.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-900 p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {name} löschen?
          </h2>
          <button
            onClick={onAbbrechen}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {typ}:{" "}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {name}
          </span>
          {infoParts.length > 0 && (
            <> &middot; {infoParts.join(", ")}</>
          )}
        </p>

        {countFehler && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Abhängigkeiten konnten nicht geladen werden.
          </div>
        )}

        {hatAbhaengigkeiten && (
          <div className="mb-4 flex items-start gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-400">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Dieser {typ} hat verknüpfte Daten ({infoParts.join(", ")}).
              Das Löschen entfernt diese Daten unwiderruflich.
            </span>
          </div>
        )}

        {isSelbst && (
          <div className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
            Du kannst dein eigenes Konto nicht löschen.
          </div>
        )}

        {hatAbhaengigkeiten && (
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Passwort bestätigen
            </label>
            <input
              type="password"
              value={passwort}
              onChange={(e) => {
                setPasswort(e.target.value);
                setPwFehler("");
              }}
              placeholder="Dein Passwort eingeben…"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm"
            />
            {pwFehler && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {pwFehler}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onAbbrechen}
            disabled={isLoading || pwLaden}
            className="rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Abbrechen
          </button>
          <button
            onClick={handleBestaetigen}
            disabled={loeschenDisabled}
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {(isLoading || pwLaden) && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Endgültig löschen
          </button>
        </div>
      </div>
    </div>
  );
}
