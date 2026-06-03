"use client";

import { useState, useMemo } from "react";
import { UserProfile, UserRole, UserPermissions, BereichPermission } from "@/types";
import { ChevronUp, ChevronDown, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { DEFAULT_PERMISSIONS } from "@/lib/permissions";
import LoeschDialog from "@/app/loeschdialog";

const ROLLEN: UserRole[] = ["admin", "manager", "sales", "viewer"];
const ABTEILUNGEN = ["Buchhaltung", "Geschäftsleitung", "Informatik", "Innendienst", "Marketing", "Technik", "Vertrieb"];
const BEREICHE = ["kunden", "pipeline", "berichte", "benutzerverwaltung"] as const;
type Bereich = typeof BEREICHE[number];

const BEREICH_LABEL: Record<Bereich, string> = {
  kunden: "Kunden",
  pipeline: "Pipeline",
  berichte: "Berichte",
  benutzerverwaltung: "Benutzer",
};

const ROLLEN_LABEL: Record<UserRole, string> = {
  admin:   "Admin",
  manager: "Manager",
  sales:   "Vertrieb",
  viewer:  "Nur lesen",
};

const LEER_FORMULAR = {
  vorname: "", nachname: "", email: "", role: "sales" as UserRole,
  abteilung: "", eintrittsdatum: "",
  strasse: "", plz: "", ort: "", geburtstag: "", telefon: "", austrittsdatum: "",
  temp_password: "",
};

type SortKey = "nachname" | "role" | "aktiv";

interface Props {
  profiles: UserProfile[];
  currentUserId: string;
}

export default function UsersClient({ profiles: initial, currentUserId }: Props) {
  const [profiles, setProfiles] = useState<UserProfile[]>(initial);
  const [sortKey, setSortKey] = useState<SortKey>("nachname");
  const [sortAsc, setSortAsc] = useState(true);

  // Modal-Zustände
  const [neuerUserOffen, setNeuerUserOffen] = useState(false);
  const [bearbeitenUser, setBearbeitenUser] = useState<UserProfile | null>(null);
  const [formular, setFormular] = useState(LEER_FORMULAR);
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_PERMISSIONS);
  const [fehler, setFehler] = useState<Record<string, string>>({});
  const [erfolg, setErfolg] = useState("");
  const [laden, setLaden] = useState(false);
  const [globalFehler, setGlobalFehler] = useState("");
  const [loeschUser, setLoeschUser] = useState<UserProfile | null>(null);
  const [loeschLaden, setLoeschLaden] = useState(false);

  // Sortierung
  const sortierte = useMemo(() => {
    return [...profiles].sort((a, b) => {
      let av: string, bv: string;
      if (sortKey === "nachname") {
        av = (a.nachname ?? "").toLowerCase();
        bv = (b.nachname ?? "").toLowerCase();
      } else if (sortKey === "role") {
        av = a.role; bv = b.role;
      } else {
        av = a.aktiv ? "1" : "0"; bv = b.aktiv ? "1" : "0";
      }
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [profiles, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp className="w-3 h-3 opacity-30" />;
    return sortAsc
      ? <ChevronUp className="w-3 h-3" />
      : <ChevronDown className="w-3 h-3" />;
  }

  // Status direkt in Zeile ändern
  async function statusAendern(id: string, aktiv: boolean) {
    if (id === currentUserId && !aktiv) {
      setGlobalFehler("Du kannst dein eigenes Konto nicht deaktivieren.");
      setTimeout(() => setGlobalFehler(""), 4000);
      return;
    }
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aktiv }),
    });
    if (res.ok) {
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, aktiv } : p));
    }
  }

  async function loescheUser() {
    if (!loeschUser) return;
    setLoeschLaden(true);
    const res = await fetch(`/api/admin/users/${loeschUser.id}`, {
      method: "DELETE",
    });
    setLoeschLaden(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setGlobalFehler(json.error ?? "Fehler beim Löschen des Benutzers.");
      setTimeout(() => setGlobalFehler(""), 4000);
      setLoeschUser(null);
      return;
    }
    setProfiles((prev) => prev.filter((p) => p.id !== loeschUser.id));
    setErfolg(`${loeschUser.vorname} ${loeschUser.nachname} wurde gelöscht.`);
    setTimeout(() => setErfolg(""), 4000);
    setLoeschUser(null);
  }

  // Neuer-User-Modal öffnen
  function oeffneNeuerUser() {
    setFormular(LEER_FORMULAR);
    setPermissions(DEFAULT_PERMISSIONS);
    setFehler({});
    setNeuerUserOffen(true);
  }

  // Bearbeiten-Modal öffnen
  function oeffneBearbeiten(p: UserProfile) {
    setFormular({
      vorname: p.vorname ?? "",
      nachname: p.nachname ?? "",
      email: p.email ?? "",
      role: p.role,
      abteilung: p.abteilung ?? "",
      eintrittsdatum: p.eintrittsdatum ?? "",
      strasse: p.strasse ?? "",
      plz: p.plz ?? "",
      ort: p.ort ?? "",
      geburtstag: p.geburtstag ?? "",
      telefon: p.telefon ?? "",
      austrittsdatum: p.austrittsdatum ?? "",
      temp_password: p.temp_password ?? "",
    });
    setPermissions(p.permissions);
    setFehler({});
    setBearbeitenUser(p);
  }

  // Validierung
  function validiere(isNeuerUser = false) {
    const e: Record<string, string> = {};
    if (!formular.vorname.trim())       e.vorname = "Vorname ist erforderlich";
    if (!formular.nachname.trim())      e.nachname = "Nachname ist erforderlich";
    if (!formular.email.trim())         e.email = "E-Mail ist erforderlich";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formular.email))
                                        e.email = "Ungültige E-Mail-Adresse";
    if (!formular.abteilung.trim())     e.abteilung = "Abteilung ist erforderlich";
    if (!formular.eintrittsdatum)       e.eintrittsdatum = "Eintrittsdatum ist erforderlich";
    if (formular.austrittsdatum && formular.eintrittsdatum &&
        formular.austrittsdatum < formular.eintrittsdatum)
                                        e.austrittsdatum = "Austrittsdatum muss nach dem Eintrittsdatum liegen";
    if (isNeuerUser && !formular.temp_password.trim())
                                        e.temp_password = "Temp-Passwort ist erforderlich";
    return e;
  }

  // Neuen User speichern
  async function speichereNeuerUser() {
    const e = validiere(true);
    if (Object.keys(e).length) { setFehler(e); return; }
    setLaden(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formular, permissions }),
    });
    const json = await res.json();
    setLaden(false);
    if (!res.ok) {
      if (json.error?.includes("bereits vergeben") || res.status === 409) {
        setFehler({ email: "Diese E-Mail ist bereits vergeben" });
      } else {
        setFehler({ _global: json.error ?? "Fehler beim Speichern" });
      }
      return;
    }
    const neuesProfil: UserProfile = {
      id: json.id,
      email: formular.email,
      vorname: formular.vorname,
      nachname: formular.nachname,
      role: formular.role,
      abteilung: formular.abteilung,
      eintrittsdatum: formular.eintrittsdatum,
      strasse: formular.strasse || null,
      plz: formular.plz || null,
      ort: formular.ort || null,
      geburtstag: formular.geburtstag || null,
      telefon: formular.telefon || null,
      profilbild_url: null,
      austrittsdatum: formular.austrittsdatum || null,
      aktiv: true,
      permissions,
      temp_password: formular.temp_password || null,
      muss_passwort_aendern: true,
    };
    setProfiles(prev => [...prev, neuesProfil]);
    setNeuerUserOffen(false);
    setErfolg(`${formular.vorname} ${formular.nachname} wurde angelegt.`);
    setTimeout(() => setErfolg(""), 4000);
  }

  // User-Änderungen speichern
  async function speichereBearbeiten() {
    const e = validiere();
    if (Object.keys(e).length) { setFehler(e); return; }
    if (!bearbeitenUser) return;
    setLaden(true);
    const res = await fetch(`/api/admin/users/${bearbeitenUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formular, permissions }),
    });
    const json = await res.json();
    setLaden(false);
    if (!res.ok) {
      setFehler({ _global: json.error ?? "Fehler beim Speichern" });
      return;
    }
    setProfiles(prev => prev.map(p =>
      p.id === bearbeitenUser.id
        ? { ...p, ...formular, permissions }
        : p
    ));
    setBearbeitenUser(null);
    setErfolg("Änderungen wurden gespeichert.");
    setTimeout(() => setErfolg(""), 4000);
  }

  function setzePermission(bereich: Bereich, recht: keyof BereichPermission, wert: boolean) {
    setPermissions(prev => ({
      ...prev,
      [bereich]: { ...prev[bereich], [recht]: wert },
    }));
  }

  const modalOffen = neuerUserOffen || bearbeitenUser !== null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Benutzerverwaltung</h1>
        <button
          onClick={oeffneNeuerUser}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Neuer User
        </button>
      </div>

      {/* Erfolgs-Meldung */}
      {erfolg && (
        <div className="mb-4 flex items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700 px-4 py-3 rounded-lg text-sm">
          <Check className="w-4 h-4 shrink-0" />
          {erfolg}
        </div>
      )}

      {/* Fehler-Banner */}
      {globalFehler && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700 px-4 py-3 rounded-lg text-sm">
          {globalFehler}
        </div>
      )}

      {/* Tabelle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:text-blue-600 select-none"
                  onClick={() => toggleSort("nachname")}
                >
                  <span className="flex items-center gap-1">Name <SortIcon k="nachname" /></span>
                </th>
                <th className="px-4 py-3 text-left">E-Mail</th>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:text-blue-600 select-none"
                  onClick={() => toggleSort("role")}
                >
                  <span className="flex items-center gap-1">Rolle <SortIcon k="role" /></span>
                </th>
                <th className="px-4 py-3 text-left">Abteilung</th>
                <th className="px-4 py-3 text-left">Eintrittsdatum</th>
                <th className="px-4 py-3 text-left">Temp-PW</th>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:text-blue-600 select-none"
                  onClick={() => toggleSort("aktiv")}
                >
                  <span className="flex items-center gap-1">Status <SortIcon k="aktiv" /></span>
                </th>
                <th className="px-4 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {sortierte.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400 dark:text-gray-500 max-w-[80px] truncate">
                    {p.id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {p.vorname} {p.nachname}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {BEREICHE.map(b => {
                        const perm = p.permissions[b];
                        const rechte = [perm.read && "L", perm.edit && "B", perm.delete && "X"].filter(Boolean) as string[];
                        if (!rechte.length) return null;
                        return (
                          <span key={b} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                            {BEREICH_LABEL[b]}: {rechte.join(" ")}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{p.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                      {ROLLEN_LABEL[p.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{p.abteilung}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {p.eintrittsdatum ? new Date(p.eintrittsdatum).toLocaleDateString("de-DE") : "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                    {p.muss_passwort_aendern ? (p.temp_password ?? "—") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={p.aktiv ? "aktiv" : "inaktiv"}
                      disabled={p.id === currentUserId}
                      onChange={(e) => statusAendern(p.id, e.target.value === "aktiv")}
                      className={`text-xs rounded-full px-2 py-0.5 border font-medium cursor-pointer
                        ${p.aktiv
                          ? "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600"}
                        ${p.id === currentUserId ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      <option value="aktiv">Aktiv</option>
                      <option value="inaktiv">Inaktiv</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => oeffneBearbeiten(p)}
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Bearbeiten"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setLoeschUser(p)}
                        disabled={p.id === currentUserId}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={
                          p.id === currentUserId
                            ? "Du kannst dein eigenes Konto nicht löschen"
                            : "Löschen"
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sortierte.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                    Keine Benutzer vorhanden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {loeschUser && (
        <LoeschDialog
          name={`${loeschUser.vorname ?? ""} ${loeschUser.nachname ?? ""}`.trim()}
          typ="Benutzer"
          aktivitaetenCount={0}
          pipelineCount={0}
          onBestaetigen={loescheUser}
          onAbbrechen={() => setLoeschUser(null)}
          isLoading={loeschLaden}
          isSelbst={loeschUser.id === currentUserId}
        />
      )}

      {/* Modal */}
      {modalOffen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setNeuerUserOffen(false); setBearbeitenUser(null); }} />
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-lg h-full overflow-y-auto shadow-2xl border-l border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {bearbeitenUser ? "User bearbeiten" : "Neuer User"}
              </h2>
              <button onClick={() => { setNeuerUserOffen(false); setBearbeitenUser(null); }}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
              </button>
            </div>

            {fehler._global && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700 px-3 py-2 rounded text-sm">
                {fehler._global}
              </div>
            )}

            {/* Pflichtfelder */}
            <fieldset className="flex flex-col gap-4">
              <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Pflichtfelder</legend>

              <div className="grid grid-cols-2 gap-3">
                <Feld label="Vorname" fehler={fehler.vorname}>
                  <input type="text" value={formular.vorname} onChange={e => setFormular(f => ({ ...f, vorname: e.target.value }))} className={eingabeKlasse(fehler.vorname)} />
                </Feld>
                <Feld label="Nachname" fehler={fehler.nachname}>
                  <input type="text" value={formular.nachname} onChange={e => setFormular(f => ({ ...f, nachname: e.target.value }))} className={eingabeKlasse(fehler.nachname)} />
                </Feld>
              </div>

              <Feld label="E-Mail" fehler={fehler.email}>
                <input
                  type="email"
                  value={formular.email}
                  onChange={e => setFormular(f => ({ ...f, email: e.target.value }))}
                  disabled={!!bearbeitenUser}
                  className={`${eingabeKlasse(fehler.email)} ${bearbeitenUser ? "opacity-60 cursor-not-allowed" : ""}`}
                />
              </Feld>

              <div className="grid grid-cols-2 gap-3">
                <Feld label="Rolle" fehler={fehler.role}>
                  <select value={formular.role} onChange={e => setFormular(f => ({ ...f, role: e.target.value as UserRole }))} className={eingabeKlasse(fehler.role)}>
                    {ROLLEN.map(r => <option key={r} value={r}>{ROLLEN_LABEL[r]}</option>)}
                  </select>
                </Feld>
                <Feld label="Abteilung" fehler={fehler.abteilung}>
                  <select value={formular.abteilung} onChange={e => setFormular(f => ({ ...f, abteilung: e.target.value }))} className={eingabeKlasse(fehler.abteilung)}>
                    <option value="">Bitte wählen…</option>
                    {ABTEILUNGEN.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </Feld>
              </div>

              <Feld label="Eintrittsdatum" fehler={fehler.eintrittsdatum}>
                <input type="date" value={formular.eintrittsdatum} onChange={e => setFormular(f => ({ ...f, eintrittsdatum: e.target.value }))} className={eingabeKlasse(fehler.eintrittsdatum)} />
              </Feld>

              {!bearbeitenUser && (
                <Feld label="Temp-Passwort *" fehler={fehler.temp_password}>
                  <input
                    type="text"
                    value={formular.temp_password}
                    onChange={e => setFormular(f => ({ ...f, temp_password: e.target.value }))}
                    placeholder="z. B. Sommer2025!"
                    className={eingabeKlasse(fehler.temp_password)}
                  />
                </Feld>
              )}
            </fieldset>

            {/* Optionale Felder */}
            <fieldset className="flex flex-col gap-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Optionale Felder</legend>

              <Feld label="Straße">
                <input type="text" value={formular.strasse} onChange={e => setFormular(f => ({ ...f, strasse: e.target.value }))} className={eingabeKlasse()} />
              </Feld>
              <div className="grid grid-cols-2 gap-3">
                <Feld label="PLZ">
                  <input type="text" value={formular.plz} onChange={e => setFormular(f => ({ ...f, plz: e.target.value }))} className={eingabeKlasse()} />
                </Feld>
                <Feld label="Ort">
                  <input type="text" value={formular.ort} onChange={e => setFormular(f => ({ ...f, ort: e.target.value }))} className={eingabeKlasse()} />
                </Feld>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Feld label="Geburtstag">
                  <input type="date" value={formular.geburtstag} onChange={e => setFormular(f => ({ ...f, geburtstag: e.target.value }))} className={eingabeKlasse()} />
                </Feld>
                <Feld label="Telefon">
                  <input type="tel" value={formular.telefon} onChange={e => setFormular(f => ({ ...f, telefon: e.target.value }))} className={eingabeKlasse()} />
                </Feld>
              </div>
              <Feld label="Austrittsdatum" fehler={fehler.austrittsdatum}>
                <input type="date" value={formular.austrittsdatum} onChange={e => setFormular(f => ({ ...f, austrittsdatum: e.target.value }))} className={eingabeKlasse(fehler.austrittsdatum)} />
              </Feld>

              {bearbeitenUser && (
                <Feld label="Temp-Passwort (aktuell / neu setzen)">
                  <input
                    type="text"
                    value={formular.temp_password}
                    onChange={e => setFormular(f => ({ ...f, temp_password: e.target.value }))}
                    placeholder={bearbeitenUser?.temp_password ? "" : "Nicht gesetzt — hier neu vergeben"}
                    className={eingabeKlasse()}
                  />
                </Feld>
              )}
            </fieldset>

            {/* Berechtigungen */}
            <fieldset className="flex flex-col gap-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Berechtigungen</legend>
              <div className="rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300">Bereich</th>
                      <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-300">Lesen</th>
                      <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-300">Bearbeiten</th>
                      <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-300">Löschen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {BEREICHE.map(b => (
                      <tr key={b} className="hover:bg-gray-50 dark:hover:bg-gray-700/20">
                        <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 capitalize">{b}</td>
                        {(["read", "edit", "delete"] as (keyof BereichPermission)[]).map(r => (
                          <td key={r} className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={permissions[b][r]}
                              onChange={e => setzePermission(b, r, e.target.checked)}
                              className="accent-blue-600 w-4 h-4 cursor-pointer"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </fieldset>

            {/* Speichern-Button */}
            <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-700 mt-auto">
              <button
                onClick={() => { setNeuerUserOffen(false); setBearbeitenUser(null); }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={bearbeitenUser ? speichereBearbeiten : speichereNeuerUser}
                disabled={laden}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
              >
                {laden ? "Speichern…" : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hilfs-Komponenten
function Feld({ label, fehler, children }: { label: string; fehler?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
      {children}
      {fehler && <p className="text-xs text-red-600 dark:text-red-400">{fehler}</p>}
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
