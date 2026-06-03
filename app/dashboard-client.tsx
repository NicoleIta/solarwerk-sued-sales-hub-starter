"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Users, CheckCircle, AlertTriangle, Wrench, Bell, Check } from "lucide-react";
import { Kunde, UserRole, Wiedervorlage } from "@/types";
import FilterBar from "@/components/filter-bar";
import StatKarte from "@/components/stat-karte";
import type { FilterValues, FilterDefinition } from "@/components/filter-bar";
import { supabase } from "@/lib/supabase";
import { isAdminOrTeamleiter } from "@/lib/permissions";

type ActiveUser = { id: string; vorname: string; nachname: string };

interface Props {
  activeUsers: ActiveUser[];
  currentUserId: string;
  currentUserRole: UserRole;
}

type KundeMitZustaendig = Kunde & { zustaendig_id: string | null };

export default function DashboardClient({ activeUsers, currentUserId, currentUserRole }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const istBerechtigt = isAdminOrTeamleiter(currentUserRole);

  const [zugangsFehler, setZugangsFehler] = useState(searchParams.get("error") === "kein-zugriff");
  const [kunden, setKunden] = useState<KundeMitZustaendig[]>([]);
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>({
    status: "",
    branche: "",
    suche: "",
  });
  const [debouncedSuche, setDebouncedSuche] = useState("");
  const [mitarbeiterFilter, setMitarbeiterFilter] = useState(istBerechtigt ? "" : currentUserId);
  const [kpis, setKpis] = useState<{ gesamt: number | null; aktive: number | null; inWartung: number | null; beschwerden: number | null }>({ gesamt: null, aktive: null, inWartung: null, beschwerden: null });
  const [kpisLaden, setKpisLaden] = useState(true);
  const [wiedervorlagen, setWiedervorlagen] = useState<Wiedervorlage[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSuche(filterValues.suche), 300);
    return () => clearTimeout(t);
  }, [filterValues.suche]);

  useEffect(() => {
    async function fetchWiedervorlagen() {
      const heute = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("wiedervorlagen")
        .select("*, kunden(firma, int_id), pipeline(titel, id)")
        .lte("due_date", heute)
        .eq("status", "offen")
        .order("due_date", { ascending: true });
      setWiedervorlagen((data ?? []) as Wiedervorlage[]);
    }
    fetchWiedervorlagen();
  }, []);

  useEffect(() => {
    async function fetchKunden() {
      setLaden(true);
      setFehler(null);
      let query = supabase
        .from("kunden")
        .select("*")
        .order("firma", { ascending: true });
      if (filterValues.status) query = query.eq("status", filterValues.status);
      if (filterValues.branche) query = query.eq("branche", filterValues.branche);
      if (debouncedSuche) query = query.ilike("firma", `%${debouncedSuche}%`);
      const { data, error } = await query;
      if (error) {
        setFehler("Laden fehlgeschlagen.");
        setKunden([]);
      } else {
        setKunden(
          (data ?? []).map((k) => ({
            id: k.int_id,
            supabase_uuid: k.id,
            firma: k.firma,
            ansprechpartner: k.ansprechpartner,
            branche: k.branche,
            anlagengroesse_kwp: k.anlagengroesse_kwp,
            status: k.status,
            letzter_kontakt: k.letzter_kontakt,
            telefon: k.telefon,
            email: k.email,
            notiz: k.notiz,
            zustaendig_id: k.zustaendig_id ?? null,
          }))
        );
      }
      setLaden(false);
    }
    fetchKunden();
  }, [filterValues.status, filterValues.branche, debouncedSuche]);

  useEffect(() => {
    async function fetchKpis() {
      setKpisLaden(true);
      function baseQuery() {
        let q = supabase.from("kunden").select("*", { count: "exact", head: true });
        if (filterValues.status) q = q.eq("status", filterValues.status);
        if (filterValues.branche) q = q.eq("branche", filterValues.branche);
        if (debouncedSuche) q = q.ilike("firma", `%${debouncedSuche}%`);
        return q;
      }
      const gesamtQuery = supabase.from("kunden").select("*", { count: "exact", head: true });
      const [g, a, w, b] = await Promise.all([
        gesamtQuery,
        baseQuery().eq("status", "aktiv"),
        baseQuery().eq("status", "in_wartung"),
        baseQuery().eq("status", "beschwerde"),
      ]);
      setKpis({
        gesamt: g.error ? null : (g.count ?? 0),
        aktive: a.error ? null : (a.count ?? 0),
        inWartung: w.error ? null : (w.count ?? 0),
        beschwerden: b.error ? null : (b.count ?? 0),
      });
      setKpisLaden(false);
    }
    fetchKpis();
  }, [filterValues.status, filterValues.branche, debouncedSuche]);

  const gefilterteKunden = mitarbeiterFilter
    ? kunden.filter((k) => k.zustaendig_id === mitarbeiterFilter)
    : kunden;

  const branchenOptionen = Array.from(new Set(kunden.map((k) => k.branche).filter(Boolean)))
    .sort()
    .map((b) => ({ value: b, label: b }));

  const STATUS_BUTTONS: { value: string; label: string }[] = [
    { value: "", label: "Alle" },
    { value: "aktiv", label: "Aktiv" },
    { value: "in_wartung", label: "In Wartung" },
    { value: "beschwerde", label: "Beschwerde" },
  ];

  const filterDefs: FilterDefinition[] = [
    {
      key: "branche",
      label: "Alle Branchen",
      type: "select",
      options: branchenOptionen,
    },
    {
      key: "suche",
      label: "Suche nach Firma oder Ansprechpartner...",
      type: "text",
      className: "sm:w-80",
    },
  ];

  function kpiWert(wert: number | null) {
    if (kpisLaden) return <span className="block h-5 w-10 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />;
    if (wert === null) return <span className="text-gray-400">—</span>;
    if (wert === 0) return <span>0 <span className="text-xs text-gray-400 font-normal">Keine Treffer</span></span>;
    return wert;
  }

  function userLabel(userId: string | null) {
    if (!userId) return null;
    const u = activeUsers.find((u) => u.id === userId);
    return u ? `${u.vorname} ${u.nachname}` : "—";
  }

  function formatWvDatum(iso: string) {
    return new Date(iso + "T00:00:00").toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  async function wvErledigen(id: string) {
    await supabase.from("wiedervorlagen").update({ status: "erledigt" }).eq("id", id);
    setWiedervorlagen((prev) => prev.filter((w) => w.id !== id));
  }

  async function zustaendigZuweisen(kundeId: number, zustaendig_id: string | null) {
    await fetch(`/api/kunden/${kundeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zustaendig_id }),
    });
    setKunden((prev) =>
      prev.map((k) => (k.id === kundeId ? { ...k, zustaendig_id } : k))
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      {zugangsFehler && (
        <div className="mb-6 flex items-center justify-between bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700 px-4 py-3 rounded-lg text-sm">
          <span>Kein Zugriff auf diese Seite.</span>
          <button onClick={() => setZugangsFehler(false)} className="text-red-500 hover:text-red-700 dark:hover:text-red-200 ml-4">✕</button>
        </div>
      )}

      {wiedervorlagen.length > 0 && (
        <section className="mb-8 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30 p-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-orange-800 dark:text-orange-300">
            <Bell className="h-4 w-4" />
            Wiedervorlagen ({wiedervorlagen.length})
          </h2>
          <ul className="space-y-2">
            {wiedervorlagen.map((wv) => (
              <li
                key={wv.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-orange-100 bg-white dark:border-orange-900 dark:bg-gray-900 px-4 py-3"
              >
                <div className="min-w-0">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {wv.kunden?.firma ?? wv.pipeline?.titel ?? "—"}
                  </span>
                  {wv.reason && (
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      {wv.reason}
                    </span>
                  )}
                  <span className="ml-2 text-xs font-medium text-orange-600 dark:text-orange-400">
                    {formatWvDatum(wv.due_date)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {wv.kunden && (
                    <Link
                      href={`/kunden/${wv.kunden.int_id}`}
                      className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Zum Kunden →
                    </Link>
                  )}
                  {wv.pipeline && (
                    <Link
                      href={`/pipeline/${wv.pipeline.id}`}
                      className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Zur Pipeline →
                    </Link>
                  )}
                  <button
                    onClick={() => wvErledigen(wv.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-green-300 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Erledigt
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatKarte icon={Users}         label="Gesamtkunden"  wert={kpiWert(kpis.gesamt)}      farbe="blue"   />
        <StatKarte icon={CheckCircle}   label="Aktive Kunden" wert={kpiWert(kpis.aktive)}      farbe="green"  />
        <StatKarte icon={Wrench}        label="In Wartung"    wert={kpiWert(kpis.inWartung)}   farbe="orange" />
        <StatKarte icon={AlertTriangle} label="Beschwerden"   wert={kpiWert(kpis.beschwerden)} farbe="red"    />
      </div>

      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-1">
          {STATUS_BUTTONS.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilterValues((prev) => ({ ...prev, status: btn.value }))}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filterValues.status === btn.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FilterBar
            filters={filterDefs}
            values={filterValues}
            onChange={setFilterValues}
          />
          <select
            value={mitarbeiterFilter}
            onChange={(e) => setMitarbeiterFilter(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm"
          >
            <option value="">Alle Mitarbeiter</option>
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
        </div>
      </div>

      {fehler && (
        <p className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {fehler}
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Firma</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Ansprechpartner</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Branche</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Anlagengroesse (kWp)</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Zuständig</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Letzter Kontakt</th>
            </tr>
          </thead>
          <tbody>
            {gefilterteKunden.map((kunde) => (
              <tr
                key={kunde.id}
                onClick={() => router.push(`/kunden/${kunde.id}`)}
                className="cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-4 py-3 font-medium">{kunde.firma}</td>
                <td className="px-4 py-3">{kunde.ansprechpartner}</td>
                <td className="px-4 py-3">{kunde.branche}</td>
                <td className="px-4 py-3">{kunde.anlagengroesse_kwp}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={kunde.status}
                    onChange={async (e) => {
                      await fetch(`/api/kunden/${kunde.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: e.target.value }),
                      });
                      router.refresh();
                    }}
                    className={`rounded-full px-2 py-1 text-xs font-medium border-0 cursor-pointer ${
                      kunde.status === "aktiv"
                        ? "bg-green-100 text-green-700"
                        : kunde.status === "in_wartung"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    <option value="aktiv">Aktiv</option>
                    <option value="in_wartung">In Wartung</option>
                    <option value="beschwerde">Beschwerde</option>
                  </select>
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  {istBerechtigt ? (
                    <select
                      value={kunde.zustaendig_id ?? ""}
                      onChange={(e) => zustaendigZuweisen(kunde.id, e.target.value || null)}
                      className="rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-2 py-1 text-xs"
                    >
                      <option value="">— nicht zugewiesen —</option>
                      {activeUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.vorname} {u.nachname}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-gray-500">{userLabel(kunde.zustaendig_id) ?? "—"}</span>
                  )}
                </td>
                <td className="px-4 py-3">{kunde.letzter_kontakt}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!laden && gefilterteKunden.length === 0 && !fehler && (
          <p className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
            {mitarbeiterFilter ? "Keine Einträge für diesen Mitarbeiter." : "Keine Kunden gefunden."}
          </p>
        )}
        {laden && (
          <p className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
            Laden...
          </p>
        )}
      </div>
    </div>
  );
}
