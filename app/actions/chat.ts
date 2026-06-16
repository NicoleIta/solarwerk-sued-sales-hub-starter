"use server";

import { getKunden, getPipeline } from "@/lib/data";
import type { Kunde, PipelineEintrag } from "@/types";

export type Nachricht = { role: "user" | "assistant"; content: string };

function findeRelevanteKunden(query: string, kunden: Kunde[]): Kunde[] {
  const woerter = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const treffer = kunden.filter((k) =>
    woerter.some(
      (w) =>
        (k.firma ?? "").toLowerCase().includes(w) ||
        (k.ansprechpartner ?? "").toLowerCase().includes(w) ||
        (k.branche ?? "").toLowerCase().includes(w) ||
        (k.status ?? "").toLowerCase().includes(w) ||
        (k.notiz ?? "").toLowerCase().includes(w)
    )
  );
  return treffer.length > 0 ? treffer : kunden;
}

function findeRelevantePipeline(query: string, pipeline: PipelineEintrag[]): PipelineEintrag[] {
  const woerter = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const treffer = pipeline.filter((p) =>
    woerter.some(
      (w) =>
        (p.firma ?? "").toLowerCase().includes(w) ||
        (p.ansprechpartner ?? "").toLowerCase().includes(w) ||
        (p.branche ?? "").toLowerCase().includes(w) ||
        (p.status ?? "").toLowerCase().includes(w) ||
        (p.notiz ?? "").toLowerCase().includes(w)
    )
  );
  return treffer.length > 0 ? treffer : pipeline;
}

function formatKunden(kunden: Kunde[]): string {
  return kunden
    .map(
      (k) =>
        `- ${k.firma ?? "–"} | ${k.ansprechpartner ?? "–"} | ${k.branche ?? "–"} | Status: ${k.status ?? "–"} | Anlage: ${k.anlagengroesse_kwp ?? "–"} kWp | Kontakt: ${k.letzter_kontakt ?? "–"} | Notiz: ${k.notiz ?? "–"}`
    )
    .join("\n");
}

function formatPipeline(pipeline: PipelineEintrag[]): string {
  return pipeline
    .map(
      (p) =>
        `- ${p.firma ?? "–"} | ${p.ansprechpartner ?? "–"} | ${p.branche ?? "–"} | Status: ${p.status ?? "–"} | Volumen: ${(p.volumen_eur ?? 0).toLocaleString("de-DE")} € | Anlage: ${p.anlagengroesse_kwp ?? "–"} kWp | Notiz: ${p.notiz ?? "–"}`
    )
    .join("\n");
}

const SYSTEM_PROMPT = `Du bist ein CRM-Assistent für Solarwerk Süd, einem Solaranlagen-Unternehmen in Bayern.
Du hast Zugriff auf Kundendaten und Pipeline-Informationen und hilfst Vertriebsmitarbeitern dabei, schnell Informationen zu finden.

Regeln:
- Antworte immer auf Deutsch
- Antworte strukturiert und präzise — keine unnötigen Erklärungen
- Wenn Daten fehlen oder du nichts Passendes findest: sage das höflich
- Beantworte nur Fragen zu Kunden, Pipeline und Vertrieb bei Solarwerk Süd
- Für alle anderen Themen: "Ich bin auf CRM-Themen für Solarwerk Süd spezialisiert und kann dabei leider nicht helfen."`;

export async function sendeChatNachricht(
  nachricht: string,
  verlauf: Nachricht[]
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return "Konfigurationsfehler: OPENROUTER_API_KEY fehlt.";
  }

  const kunden = getKunden();
  const pipeline = getPipeline();

  const relevanteKunden = findeRelevanteKunden(nachricht, kunden);
  const relevantePipeline = findeRelevantePipeline(nachricht, pipeline);

  const kontext = `## Kundendaten (${relevanteKunden.length} Einträge)
${formatKunden(relevanteKunden)}

## Pipeline (${relevantePipeline.length} Einträge)
${formatPipeline(relevantePipeline)}`;

  const messages = [
    ...verlauf.map((m) => ({ role: m.role, content: m.content })),
    {
      role: "user" as const,
      content: `${nachricht}\n\n---\nAktueller CRM-Kontext:\n${kontext}`,
    },
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20_000);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4-6",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("OpenRouter Fehler:", response.status, errBody);
      return "Momentan nicht verfügbar — bitte erneut versuchen.";
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      console.error("Unerwartete API-Antwort:", JSON.stringify(data));
      return "Momentan nicht verfügbar — bitte erneut versuchen.";
    }

    return text;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return "Zeitüberschreitung — bitte erneut versuchen.";
    }
    console.error("Chat-Fehler:", err);
    return "Momentan nicht verfügbar — bitte erneut versuchen.";
  } finally {
    clearTimeout(timeoutId);
  }
}
