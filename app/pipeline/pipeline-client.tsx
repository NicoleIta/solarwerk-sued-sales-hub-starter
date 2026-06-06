"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, FileText, XCircle } from "lucide-react";
import { KundenStatus, PipelineStatus, UserRole } from "@/types";
import { PIPELINE_STYLE } from "@/components/pipeline-status-badge";
import StatKarte from "@/components/stat-karte";
import PipelineAutoBadge from "@/components/pipeline-auto-badge";
import { supabase } from "@/lib/supabase";
import { isAdminOrTeamleiter } from "@/lib/permissions";
import { computeKundeStatus } from "@/lib/pipeline-rules";

type ActiveUser = { id: string; vorname: string; nachname: string };

interface Props {
  activeUsers: ActiveUser[];
  currentUserId: string;
  currentUserRole: UserRole;
}

type SupabasePipelineEintrag = {
  id: string;
  titel: string;
  status: PipelineStatus;
  betrag: number;
  datum: string;
  notizen: string;
  kunde_id: string;
  zustaendig_id: string | null;
  kunden: {
    ansprechpartner: string;
    branche: string;
    zustaendig_id: string | null;
    status: string;
    letzter_kontakt: string;
    created_at: string;
  } | null;
};

const STATUS_BUTTONS: { value: PipelineStatus | "alle"; label: string }[] = [
  { value: "alle", label: "Alle" },
  { value: "erstkontakt", label: "Erstkontakt" },
  { value: "angebot_raus", label: "Angebot raus" },
  { value: "verhandlung", label: "Verhandlung" },
  { value: "gewonnen", label: "Gewonnen" },
  { value: "verloren", label: "Verloren" },
];

export default function PipelineClient({ activeUsers, currentUserId, currentUserRole }: Props) {
  const router = useRouter();
  const istBerechtigt = isAdminOrTeamleiter(currentUserRole);

  const [eintraege, setEintraege] = useState<SupabasePipelineEintrag[]>([]);
  const [statusFilter, setStatusFilter] = useState<PipelineStatus | "alle">("alle");
  const [suchbegriff, setSuchbegriff] = useState("");
  const [debouncedSuche, setDebouncedSuche] = useState("");
  const [mitarbeiterFilter, setMitarbeiterFilter] = useState(istBerechtigt ? "" : currentUserId);
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);
  const [kpis, setKpis] = useState<{ aktivesVolumen: number | null; dynamischCount: number | null; dynamischVolumen: number | null }>({ aktivesVolumen: null, dynamischCount: null, dynamischVolumen: null });
  const [kpisLaden, setKpisLaden] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSuche(suchbegriff), 300);
    return () => clearTimeout(t);
  }, [suchbegriff]);

  useEffect(() => {
    async function fetchEintraege() {
      setLaden(true);
      setFehler(null);
      let query = supabase
        .from("pipeline")
        .select("*, kunden(ansprechpartner, branche, zustaendig_id, status, letzter_kontakt, created_at)")
        .order("datum", { ascending: false });
      if (statusFilter !== "alle") query = query.eq("status", statusFilter);
      if (debouncedSuche) query = query.ilike("titel", `%${debouncedSuche}%`);
      const { data, error } = await query;
      if (error) {
        setFehler("Laden fehlgeschlagen.");
        setEintraege([]);
      } else {
        setEintraege((data ?? []) as SupabasePipelineEintrag[]);
      }
      setLaden(false);
    }
    fetchEintraege();
  }, [statusFilter, debouncedSuche]);

  useEffect(() => {
    async function fetchKpis() {
      setKpisLaden(true);
      const dynCountQuery = statusFilter === "alle"
        ? supabase.from("pipeline").select("*", { count: "exact", head: true })
        : supabase.from("pipeline").select("*", { count: "exact", head: true }).eq("status", statusFilter);
      const dynVolQuery = statusFilter === "alle"
        ? supabase.from("pipeline").select("betrag")
        : supabase.from("pipeline").select("betrag").eq("status", statusFilter);

      const [vol, dynCount, dynVol] = await Promise.all([
        supabase.from("pipeline").select("betrag").neq("status", "verloren"),
        dynCountQuery,
        dynVolQuery,
      ]);
      setKpis({
        aktivesVolumen: vol.error ? null : (vol.data ?? []).reduce((s, e) => s + (e.betrag ?? 0), 0),
        dynamischCount: dynCount.error ? null : (dynCount.count ?? 0),
        dynamischVolumen: dynVol.error ? null : (dynVol.data ?? []).reduce((s, e) => s + (e.betrag ?? 0), 0),
      });
      setKpisLaden(false);
    }
    fetchKpis();
  }, [statusFilter, debouncedSuche]);

  const gefilterteEintraege = mitarbeiterFilter
    ? eintraege.filter((e) => e.zustaendig_id === mitarbeiterFilter)
    : eintraege;

  function kpiWert(wert: number | null) {
    if (kpisLaden) return <span className="block h-5 w-10 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />;
    if (wert === null) return <span className="text-gray-400">—</span>;
    if (wert === 0) return <span>0 <span className="text-xs text-gray-400 font-normal">Keine Treffer</span></span>;
    return wert;
  }

  function euroWert(wert: number | null) {
    if (kpisLaden) return <span className="block h-5 w-16 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />;
    if (wert === null) return <span className="text-gray-400">—</span>;
    return `${wert.toLocaleString("de-DE")} €`;
  }

  function userLabel(userId: string | null) {
    if (!userId) return null;
    const u = activeUsers.find((u) => u.id === userId);
    return u ? `${u.vorname} ${u.nachname}` : "—";
  }

  async function zustaendigZuweisen(eintragId: string, zustaendig_id: string | null) {
    await fetch(`/api/pipeline/${eintragId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zustaendig_id }),
    });
    setEintraege((prev) =>
      prev.map((e) => (e.id === eintragId ? { ...e, zustaendig_id } : e))
    );
  }

  const STATUS_INFO: Record<PipelineStatus | "alle", { label: string; farbe: "blue" | "green" | "red" | "orange" }> = {
    alle:         { label: "Einträge gesamt", farbe: "blue"   },
    erstkontakt:  { label: "Erstkontakt",     farbe: "blue"   },
    angebot_raus: { label: "Angebot raus",    farbe: "orange" },
    verhandlung:  { label: "Verhandlung",     farbe: "orange" },
    gewonnen:     { label: "Gewonnen",        farbe: "green"  },
    verloren:     { label: "Verloren",        farbe: "red"    },
  };

  const dynInfo = STATUS_INFO[statusFilter];
  const dealsWert = kpiWert(kpis.dynamischCount);
  const dynWert = statusFilter === "erstkontakt"
    ? <span className="text-gray-400">—</span>
    : euroWert(kpis.dynamischVolumen);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Pipeline</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatKarte icon={TrendingUp} label="Aktives Volumen"  wert={euroWert(kpis.aktivesVolumen)}  farbe="blue"          />
        <StatKarte icon={XCircle}    label={dynInfo.label}    wert={dynWert}                         farbe={dynInfo.farbe} />
        <StatKarte icon={FileText}   label="Deals"            wert={dealsWert}                       farbe={dynInfo.farbe} />
      </div>

      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="flex flex-wrap gap-1">
          {STATUS_BUTTONS.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setStatusFilter(btn.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === btn.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Suche nach Firma..."
          value={suchbegriff}
          onChange={(e) => setSuchbegriff(e.target.value)}
          className="rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm sm:w-64"
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
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Betrag (€)</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Datum</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Zuständig</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Kunde-Status</th>
            </tr>
          </thead>
          <tbody>
            {gefilterteEintraege.map((eintrag) => (
              <tr
                key={eintrag.id}
                onClick={() => router.push(`/pipeline/${eintrag.id}`)}
                className="cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-4 py-3 font-medium">{eintrag.titel}</td>
                <td className="px-4 py-3">{eintrag.kunden?.ansprechpartner ?? "—"}</td>
                <td className="px-4 py-3">{eintrag.kunden?.branche ?? "—"}</td>
                <td className="px-4 py-3">{(eintrag.betrag ?? 0).toLocaleString("de-DE")}</td>
                <td className="px-4 py-3">{eintrag.datum?.slice(0, 10)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${PIPELINE_STYLE[eintrag.status]}`}>
                    {eintrag.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {userLabel(eintrag.kunden?.zustaendig_id ?? null) ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {eintrag.kunden ? (
                    <PipelineAutoBadge
                      status={computeKundeStatus(
                        {
                          id: 0,
                          firma: eintrag.titel,
                          ansprechpartner: eintrag.kunden.ansprechpartner,
                          branche: eintrag.kunden.branche,
                          anlagengroesse_kwp: 0,
                          status: eintrag.kunden.status as KundenStatus,
                          letzter_kontakt: eintrag.kunden.letzter_kontakt,
                          telefon: "",
                          email: "",
                          notiz: "",
                          created_at: eintrag.kunden.created_at,
                        },
                        [],
                        [eintrag]
                      )}
                    />
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!laden && gefilterteEintraege.length === 0 && !fehler && (
          <p className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
            {mitarbeiterFilter ? "Keine Einträge für diesen Mitarbeiter." : "Keine Einträge gefunden."}
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
