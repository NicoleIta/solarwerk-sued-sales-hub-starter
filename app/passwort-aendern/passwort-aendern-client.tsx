"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PasswortAendernClient() {
  const router = useRouter();
  const [neues_passwort, setNeuesPasswort] = useState("");
  const [bestaetigung, setBestaetigung] = useState("");
  const [fehler, setFehler] = useState<Record<string, string>>({});
  const [laden, setLaden] = useState(false);

  function validiere() {
    const e: Record<string, string> = {};
    if (!neues_passwort) e.neues_passwort = "Neues Passwort ist erforderlich";
    else if (neues_passwort.length < 8) e.neues_passwort = "Mindestens 8 Zeichen erforderlich";
    if (!bestaetigung) e.bestaetigung = "Bestätigung ist erforderlich";
    else if (neues_passwort && neues_passwort !== bestaetigung)
      e.bestaetigung = "Passwörter stimmen nicht überein";
    return e;
  }

  async function absenden() {
    const e = validiere();
    if (Object.keys(e).length) { setFehler(e); return; }
    setFehler({});
    setLaden(true);
    const res = await fetch("/api/passwort-aendern", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ neues_passwort, bestaetigung }),
    });
    const json = await res.json();
    setLaden(false);
    if (!res.ok) {
      setFehler({ _global: json.error ?? "Fehler beim Speichern" });
      return;
    }
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Passwort ändern</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Bitte lege jetzt dein persönliches Passwort fest.
          </p>
        </div>

        {fehler._global && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700 px-3 py-2 rounded text-sm">
            {fehler._global}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Neues Passwort
            </label>
            <input
              type="password"
              value={neues_passwort}
              onChange={e => setNeuesPasswort(e.target.value)}
              placeholder="Mind. 8 Zeichen"
              className={eingabeKlasse(fehler.neues_passwort)}
            />
            {fehler.neues_passwort && (
              <p className="text-xs text-red-600 dark:text-red-400">{fehler.neues_passwort}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Passwort bestätigen
            </label>
            <input
              type="password"
              value={bestaetigung}
              onChange={e => setBestaetigung(e.target.value)}
              placeholder="Passwort wiederholen"
              className={eingabeKlasse(fehler.bestaetigung)}
            />
            {fehler.bestaetigung && (
              <p className="text-xs text-red-600 dark:text-red-400">{fehler.bestaetigung}</p>
            )}
          </div>
        </div>

        <button
          onClick={absenden}
          disabled={laden}
          className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
        >
          {laden ? "Speichern…" : "Passwort festlegen"}
        </button>
      </div>
    </div>
  );
}

function eingabeKlasse(fehler?: string) {
  return `w-full px-3 py-2 text-sm rounded-lg border transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white
    ${fehler
      ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
      : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
    } outline-none`;
}
