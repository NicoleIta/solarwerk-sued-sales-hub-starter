"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { verifyNutzer } from "@/lib/users";

export default function LoginPage() {
  const router = useRouter();
  const [kennung, setKennung] = useState("");
  const [passwort, setPasswort] = useState("");
  const [showPasswort, setShowPasswort] = useState(false);
  const [fehler, setFehler] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nutzer = verifyNutzer(kennung.trim(), passwort);
    if (!nutzer) {
      setFehler("Benutzername oder Passwort falsch.");
      return;
    }
    localStorage.setItem("currentUser", JSON.stringify({ id: nutzer.id, name: nutzer.name, email: nutzer.email }));
    document.cookie = "session=1; path=/; SameSite=Strict";
    router.push("/");
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 shadow-sm"
      >
        <h1 className="mb-2 text-center text-xl font-bold text-gray-900 dark:text-gray-100">
          Anmelden
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Solarwerk Süd · Sales-Hub
        </p>

        {/* Benutzername oder E-Mail */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Benutzername oder E-Mail
          </label>
          <input
            type="text"
            value={kennung}
            onChange={(e) => { setKennung(e.target.value); setFehler(""); }}
            required
            autoComplete="username"
            placeholder="z. B. Nicole Ita oder nicole@solarwerk-sued.de"
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Passwort mit Auge-Toggle */}
        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Passwort
          </label>
          <div className="relative">
            <input
              type={showPasswort ? "text" : "password"}
              value={passwort}
              onChange={(e) => { setPasswort(e.target.value); setFehler(""); }}
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPasswort((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label={showPasswort ? "Passwort verbergen" : "Passwort anzeigen"}
            >
              {showPasswort ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Fehlermeldung */}
        {fehler && (
          <p className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            {fehler}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Einloggen
        </button>
      </form>
    </div>
  );
}
