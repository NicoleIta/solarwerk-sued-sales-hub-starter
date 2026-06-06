"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, Zap } from "lucide-react";
import { Aktivitaet, Kunde, KundenStatus, PipelineEintrag } from "@/types";
import StatusBadge from "@/app/status-badge";
import PipelineAutoBadge from "@/components/pipeline-auto-badge";
import type { PipelineAutoStatus } from "@/lib/pipeline-rules";
import InfoField from "@/components/info-field";
import PipelineStatusBadge from "@/components/pipeline-status-badge";
import AktivitaetenClient from "./aktivitaeten-client";
import WiedervorlageClient from "@/app/wiedervorlage-client";
import LoeschDialog from "@/app/loeschdialog";
import { supabase } from "@/lib/supabase";
import { generateEmail } from "@/app/actions/generate-email";
import { generateNaechsteAktion, NaechsteAktion } from "@/app/actions/generate-naechste-aktion";

export default function KundeDetailClient({
  kunde,
  pipelineEintraege,
  aktivitaeten,
  currentUserId,
  canDelete,
  pipelineStatus,
}: {
  kunde: Kunde;
  pipelineEintraege: PipelineEintrag[];
  aktivitaeten: Aktivitaet[];
  currentUserId: string;
  canDelete: boolean;
  pipelineStatus: PipelineAutoStatus | null;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Kunde>(kunde);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailModal, setEmailModal] = useState<{ text: string; error?: boolean } | null>(null);
  const [kopiert, setKopiert] = useState(false);
  const [aktionLoading, setAktionLoading] = useState(false);
  const [aktionErgebnis, setAktionErgebnis] = useState<NaechsteAktion | null>(null);
  const [aktionFehler, setAktionFehler] = useState<string | null>(null);
  const [loeschDialogOffen, setLoeschDialogOffen] = useState(false);
  const [loeschAktivitaetenCount, setLoeschAktivitaetenCount] = useState(0);
  const [loeschPipelineCount, setLoeschPipelineCount] = useState(0);
  const [loeschWiedervorlagenCount, setLoeschWiedervorlagenCount] = useState(0);
  const [loeschCountFehler, setLoeschCountFehler] = useState(false);

  function handleChange(field: keyof Kunde, value: string | number) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleCancel() {
    setFormData(kunde);
    setIsEditing(false);
    setError(null);
  }

  async function handleSave() {
    if (!formData.firma.trim()) {
      setError("Firmenname darf nicht leer sein.");
      return;
    }
    setIsLoading(true);
    setError(null);
    const { error: sbError } = await supabase
      .from("kunden")
      .update({
        firma: formData.firma,
        ansprechpartner: formData.ansprechpartner,
        branche: formData.branche,
        anlagengroesse_kwp: formData.anlagengroesse_kwp,
        status: formData.status,
        letzter_kontakt: formData.letzter_kontakt,
        telefon: formData.telefon,
        email: formData.email,
        notiz: formData.notiz,
      })
      .eq("id", kunde.supabase_uuid!);
    setIsLoading(false);
    if (sbError) {
      setError("Fehler beim Speichern: " + sbError.message);
      return;
    }
    setIsEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    setIsLoading(true);
    let aktCount = 0;
    let wvCount = 0;
    let countFehler = false;

    try {
      const { count, error } = await supabase
        .from("aktivitaeten")
        .select("*", { count: "exact", head: true })
        .eq("kunde_id", kunde.supabase_uuid!);
      if (error) countFehler = true;
      else aktCount = count ?? 0;
    } catch {
      countFehler = true;
    }

    try {
      const { count } = await supabase
        .from("wiedervorlagen")
        .select("*", { count: "exact", head: true })
        .eq("customer_id", kunde.supabase_uuid!)
        .eq("status", "offen");
      wvCount = count ?? 0;
    } catch {
      // nicht kritisch — nur Kontextinfo
    }

    setIsLoading(false);
    setLoeschAktivitaetenCount(aktCount);
    setLoeschPipelineCount(pipelineEintraege.length);
    setLoeschWiedervorlagenCount(wvCount);
    setLoeschCountFehler(countFehler);
    setLoeschDialogOffen(true);
  }

  async function fuehreLoeschenAus() {
    setIsLoading(true);
    setError(null);
    const { error: sbError } = await supabase
      .from("kunden")
      .delete()
      .eq("id", kunde.supabase_uuid!);
    setIsLoading(false);
    if (sbError) {
      setError("Fehler beim Löschen: " + sbError.message);
      setLoeschDialogOffen(false);
      return;
    }
    router.push("/");
  }

  async function handleEmailGenerieren() {
    setEmailLoading(true);
    try {
      const text = await generateEmail({
        firma: formData.firma,
        ansprechpartner: formData.ansprechpartner,
        branche: formData.branche,
        notiz: formData.notiz ?? undefined,
      });
      setEmailModal({ text });
    } catch (e) {
      setEmailModal({ text: (e as Error).message, error: true });
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleAktionGenerieren() {
    setAktionLoading(true);
    setAktionErgebnis(null);
    setAktionFehler(null);
    try {
      const ergebnis = await generateNaechsteAktion({
        firma: formData.firma,
        ansprechpartner: formData.ansprechpartner,
        branche: formData.branche,
        status: formData.status,
        letzter_kontakt: formData.letzter_kontakt || null,
        notiz: formData.notiz ?? null,
      });
      setAktionErgebnis(ergebnis);
    } catch (e) {
      setAktionFehler((e as Error).message);
    } finally {
      setAktionLoading(false);
    }
  }

  async function handleKopieren() {
    if (!emailModal) return;
    await navigator.clipboard.writeText(emailModal.text);
    setKopiert(true);
    setTimeout(() => setKopiert(false), 2000);
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-1.5 text-sm";

  return (
    <div>
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurueck zum Dashboard
      </Link>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          {isEditing ? (
            <input
              value={formData.firma}
              onChange={(e) => handleChange("firma", e.target.value)}
              className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-2 py-1 text-2xl font-bold"
            />
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{formData.firma}</h1>
              <PipelineAutoBadge status={pipelineStatus} />
            </div>
          )}
          {isEditing ? (
            <select
              value={formData.status}
              onChange={(e) =>
                handleChange("status", e.target.value as KundenStatus)
              }
              className="rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-2 py-1 text-sm"
            >
              <option value="aktiv">Aktiv</option>
              <option value="in_wartung">In Wartung</option>
              <option value="beschwerde">Beschwerde</option>
            </select>
          ) : (
            <StatusBadge status={formData.status} />
          )}
        </div>

        {isEditing ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-500 dark:text-gray-400">
                Ansprechpartner
              </label>
              <input
                value={formData.ansprechpartner}
                onChange={(e) => handleChange("ansprechpartner", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-500 dark:text-gray-400">
                Branche
              </label>
              <input
                value={formData.branche}
                onChange={(e) => handleChange("branche", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-500 dark:text-gray-400">
                Anlagengröße (kWp)
              </label>
              <input
                type="number"
                value={formData.anlagengroesse_kwp}
                onChange={(e) =>
                  handleChange("anlagengroesse_kwp", Number(e.target.value))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-500 dark:text-gray-400">
                Letzter Kontakt
              </label>
              <input
                type="date"
                value={formData.letzter_kontakt}
                onChange={(e) => handleChange("letzter_kontakt", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-500 dark:text-gray-400">
                Telefon
              </label>
              <input
                value={formData.telefon ?? ""}
                onChange={(e) => handleChange("telefon", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-500 dark:text-gray-400">
                E-Mail
              </label>
              <input
                type="email"
                value={formData.email ?? ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoField label="Ansprechpartner" value={formData.ansprechpartner} />
            <InfoField label="Branche" value={formData.branche} />
            <InfoField
              label="Anlagengroesse"
              value={`${formData.anlagengroesse_kwp} kWp`}
            />
            <InfoField label="Letzter Kontakt" value={formData.letzter_kontakt} />
            <InfoField label="Telefon" value={formData.telefon} />
            <InfoField label="E-Mail" value={formData.email} />
          </div>
        )}

        <div className="mt-6">
          <label className="mb-1 block text-sm text-gray-500 dark:text-gray-400">
            Notiz
          </label>
          {isEditing ? (
            <textarea
              value={formData.notiz ?? ""}
              onChange={(e) => handleChange("notiz", e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm"
            />
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {formData.notiz || "—"}
            </p>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Speichern
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Abbrechen
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Bearbeiten
              </button>
              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Löschen
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-4">
        <h2 className="mb-3 font-semibold text-gray-800 dark:text-gray-200">Aktionen</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleEmailGenerieren}
            disabled={emailLoading}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {emailLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            E-Mail generieren
          </button>
          <button
            onClick={handleAktionGenerieren}
            disabled={aktionLoading}
            className="inline-flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {aktionLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Nächste Aufgabe generieren
          </button>
        </div>

        {aktionFehler && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {aktionFehler}
          </div>
        )}

        {aktionErgebnis && (
          <div className="mt-4 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
            <div className="mb-2">
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                aktionErgebnis.badge === "dringend"
                  ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  : aktionErgebnis.badge === "warten"
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              }`}>
                {aktionErgebnis.badge}
              </span>
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-200">{aktionErgebnis.aktion}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{aktionErgebnis.begruendung}</p>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">
            Pipeline-Einträge
          </h2>
          <Link
            href={`/pipeline/neu?kundeId=${kunde.id}&firma=${encodeURIComponent(formData.firma)}&ansprechpartner=${encodeURIComponent(formData.ansprechpartner)}&branche=${encodeURIComponent(formData.branche)}`}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            + Neuer Pipeline-Eintrag
          </Link>
        </div>
        {pipelineEintraege.length === 0 ? (
          <p className="px-6 py-4 text-sm text-gray-400 dark:text-gray-500">
            Kein Pipeline-Eintrag vorhanden.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                  Volumen (€)
                </th>
                <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                  Angebotsdatum
                </th>
                <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400"></th>
              </tr>
            </thead>
            <tbody>
              {pipelineEintraege.map((e) => (
                <tr
                  key={e.id}
                  className="border-t border-gray-100 dark:border-gray-700"
                >
                  <td className="px-6 py-3">
                    <PipelineStatusBadge status={e.status} />
                  </td>
                  <td className="px-6 py-3">
                    {(e.volumen_eur ?? 0).toLocaleString("de-DE")} €
                  </td>
                  <td className="px-6 py-3">{e.angebotsdatum}</td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      href={`/pipeline/${e.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Bearbeiten →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AktivitaetenClient
        kundeUuid={kunde.supabase_uuid!}
        initialAktivitaeten={aktivitaeten}
        currentUserId={currentUserId}
      />

      <WiedervorlageClient
        customerId={kunde.supabase_uuid!}
        currentUserId={currentUserId}
      />

      {loeschDialogOffen && (
        <LoeschDialog
          name={formData.firma}
          typ="Kunde"
          aktivitaetenCount={loeschAktivitaetenCount}
          pipelineCount={loeschPipelineCount}
          wiedervorlagenCount={loeschWiedervorlagenCount}
          countFehler={loeschCountFehler}
          onBestaetigen={fuehreLoeschenAus}
          onAbbrechen={() => setLoeschDialogOffen(false)}
          isLoading={isLoading}
        />
      )}

      {emailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white dark:bg-gray-900 p-6 shadow-xl">
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">
              {emailModal.error ? "Fehler" : "E-Mail-Entwurf"}
            </h3>
            <pre className="mb-4 max-h-80 overflow-y-auto whitespace-pre-wrap rounded-md bg-gray-50 dark:bg-gray-800 p-4 text-sm text-gray-700 dark:text-gray-300">
              {emailModal.text}
            </pre>
            <div className="flex justify-end gap-3">
              {!emailModal.error && (
                <button
                  onClick={handleKopieren}
                  className="rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {kopiert ? "Kopiert!" : "Kopieren"}
                </button>
              )}
              <button
                onClick={() => {
                  setEmailModal(null);
                  setKopiert(false);
                }}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
