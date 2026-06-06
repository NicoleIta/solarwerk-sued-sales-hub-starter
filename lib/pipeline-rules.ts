import type { Kunde } from "@/types";

export const NEGLECTED_THRESHOLD_DAYS = 14;

export type PipelineAutoStatus = "risiko" | "verloren" | "vernachlaessigt" | "in_verhandlung";

type AktivitaetMin = { erstellt_am: string };
type AngebotMin = { status: string };

export function computeKundeStatus(
  kunde: Kunde,
  aktivitaeten: AktivitaetMin[],
  angebote: AngebotMin[]
): PipelineAutoStatus | null {
  // Regel 1 (höchste Priorität): Risiko — gilt auch in Abschluss-Stufe
  if (kunde.status === "beschwerde") return "risiko";

  // Abschluss-Stufe: Aktivitäts-Regeln überspringen
  if (angebote.some((a) => a.status === "gewonnen")) return null;

  const now = Date.now();

  let referenzMs: number;

  if (aktivitaeten.length > 0) {
    referenzMs = Math.max(...aktivitaeten.map((a) => new Date(a.erstellt_am).getTime()));
  } else {
    // Keine Aktivität: Kunden-Datum als Referenz (created_at bevorzugt, letzter_kontakt als Fallback)
    const kundeDatumStr = kunde.created_at ?? kunde.letzter_kontakt;
    referenzMs = new Date(kundeDatumStr).getTime();
    const kundeTagsAlt = (now - referenzMs) / (1000 * 60 * 60 * 24);
    // Neuer Kunde ohne Aktivität: kein Badge
    if (kundeTagsAlt <= NEGLECTED_THRESHOLD_DAYS) return null;
  }

  const tage = (now - referenzMs) / (1000 * 60 * 60 * 24);

  // Regel 2: Verloren
  if (tage > 90) return "verloren";

  // Regel 3: Vernachlässigt (strict >, nicht >=)
  if (tage > NEGLECTED_THRESHOLD_DAYS) return "vernachlaessigt";

  // Regel 4: In Verhandlung
  if (angebote.some((a) => a.status === "angebot_raus" || a.status === "verhandlung")) {
    return "in_verhandlung";
  }

  return null;
}
