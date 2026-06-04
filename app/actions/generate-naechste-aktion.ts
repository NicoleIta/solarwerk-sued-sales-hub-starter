"use server";

interface AktionParams {
  firma: string;
  ansprechpartner: string;
  branche: string;
  status: string;
  letzter_kontakt: string | null | undefined;
  notiz?: string | null;
}

export interface NaechsteAktion {
  badge: "dringend" | "normal" | "warten";
  aktion: string;
  begruendung: string;
}

function kuerzeNotiz(notiz: string): string {
  if (notiz.length <= 300) return notiz;
  const gekuerzt = notiz.slice(0, 300);
  const letzterLeerzeichen = gekuerzt.lastIndexOf(" ");
  return letzterLeerzeichen > 0 ? gekuerzt.slice(0, letzterLeerzeichen) : gekuerzt;
}

export async function generateNaechsteAktion(params: AktionParams): Promise<NaechsteAktion> {
  const { firma, ansprechpartner, branche, status, letzter_kontakt, notiz } = params;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Aktion konnte nicht generiert werden (kein API-Key).");
  }

  const kontaktAnzeige = letzter_kontakt?.trim() || "unbekannt";
  const notizAnzeige = notiz ? kuerzeNotiz(notiz) : "keine";

  const statusLabels: Record<string, string> = {
    aktiv: "Aktiv",
    in_wartung: "In Wartung",
    beschwerde: "Beschwerde",
  };

  const prompt = `Du bist ein erfahrener Vertriebsassistent bei Solarwerk Süd, einem Solaranlagen-Unternehmen.

Analysiere folgende Kundendaten und bestimme die nächste beste Vertriebsaktion:

Firma: ${firma}
Ansprechpartner: ${ansprechpartner}
Branche: ${branche}
Status: ${statusLabels[status] ?? status}
Letzter Kontakt: ${kontaktAnzeige}
Notiz: ${notizAnzeige}

Antworte ausschließlich mit einem JSON-Objekt (kein Markdown, keine Erklärungen) mit genau diesen drei Feldern:
- "badge": eine der drei Optionen "dringend", "normal" oder "warten"
- "aktion": ein konkreter Satz, der die nächste Aktion beschreibt und den Firmennamen "${firma}" oder ein spezifisches Datum enthält
- "begruendung": ein Satz, der die Empfehlung mit einem Fakt aus den Kundendaten belegt

Regeln für badge:
- "dringend": Status ist "Beschwerde", oder letzter Kontakt liegt mehr als 60 Tage zurück
- "warten": Projekt läuft gut, kein Handlungsbedarf in nächsten 2 Wochen
- "normal": alle anderen Fälle`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "anthropic/claude-haiku-4-5",
          messages: [{ role: "user", content: prompt }],
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error("OpenRouter Fehler:", response.status, errBody);
      throw new Error(`API-Fehler ${response.status}: Aktion konnte nicht generiert werden.`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("Aktion konnte nicht generiert werden (leere Antwort).");
    }

    let parsed: NaechsteAktion;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Aktion konnte nicht generiert werden (kein JSON).");
      parsed = JSON.parse(match[0]);
    }

    const erlaubteBadges = ["dringend", "normal", "warten"] as const;
    if (!erlaubteBadges.includes(parsed.badge as "dringend" | "normal" | "warten")) {
      parsed.badge = "normal";
    }

    return parsed;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Server antwortet nicht (Timeout).");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
