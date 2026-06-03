"use server";

interface EmailParams {
  firma: string;
  ansprechpartner: string;
  branche: string;
  notiz?: string;
}

export async function generateEmail(params: EmailParams): Promise<string> {
  const { firma, ansprechpartner, branche, notiz } = params;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("E-Mail konnte nicht generiert werden.");
  }

  const notizAbschnitt = notiz
    ? `\nBesondere Hinweise zum Kunden: ${notiz}`
    : "";

  const prompt = `Du bist ein freundlicher Vertriebsmitarbeiter bei Solarwerk Süd, einem Solaranlagen-Unternehmen.
Schreibe eine kurze, professionelle Follow-up-E-Mail auf Deutsch an folgenden Kunden:

Firma: ${firma}
Ansprechpartner: ${ansprechpartner}
Branche: ${branche}${notizAbschnitt}

Wichtige Regeln:
- Leite die korrekte Anrede (Herr/Frau) aus dem Vornamen des Ansprechpartners ab.
- Wenn das Geschlecht unklar ist, verwende die neutrale Form "Guten Tag, ${ansprechpartner}".
- Die E-Mail soll freundlich, persönlich und auf die Branche zugeschnitten sein.
- Erwähne konkret den Nutzen von Solarenergie für die Branche des Kunden.
- Länge: 3–4 kurze Absätze.
- Nur den E-Mail-Text ausgeben, keine Erklärungen darum herum.`;

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
      throw new Error(`API-Fehler ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      console.error("Unerwartete API-Antwort:", JSON.stringify(data));
      throw new Error("E-Mail konnte nicht generiert werden.");
    }

    return text;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Server antwortet nicht");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
