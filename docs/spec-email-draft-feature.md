# Spec: E-Mail-Draft-Feature per Gemini-API

## Zweck
Ein Klick auf der Kunden-Detailseite erzeugt über die OpenRouter-API einen personalisierten Follow-up-E-Mail-Entwurf, der Firma, Ansprechpartner, Branche, Ort, Pipeline-Status und letzte Notiz berücksichtigt. Die KI-Generierung läuft serverseitig als Next.js Server Action, sodass der API-Schlüssel nie im Browser erscheint.

## Inputs
• Firmenname (string, aus Kundendaten)
• Ansprechpartner (string, aus Kundendaten)
• Branche (string, aus Kundendaten)
• Ort (string, aus Kundendaten)
• Pipeline-Status (string, aus Kundendaten)
• Letzte Notiz / Beschwerde (string | null, aus Kundendaten — optional)

## Verhalten
1. Nutzer öffnet Kunden-Detailseite
2. Im Bereich "Aktionen" ist der Knopf "E-Mail generieren" sichtbar
3. Nutzer klickt auf Knopf — Spinner erscheint, Knopf wird deaktiviert
4. Server Action wird aufgerufen: Kundendaten → Prompt → OpenRouter API (google/gemini-flash-1.5) → Entwurf
5. Modal öffnet sich mit dem fertigen E-Mail-Entwurf
6. Nutzer klickt "Kopieren" — Entwurf landet in der Zwischenablage
7. Nutzer schließt Modal mit "Schließen"-Knopf

## Architektur-Entscheidungen

### Entscheidung 1: Server Action statt API Route
• Gewählt: Next.js Server Action für den OpenRouter-Aufruf
• Alternative wäre: Separater API Route-Handler (/api/generate-email)
• Warum diese: Der API-Schlüssel bleibt vollständig serverseitig, kein separater Route-File nötig, weniger Boilerplate.

### Entscheidung 2: OpenRouter statt direkter Gemini-API
• Gewählt: OpenRouter API mit Modell google/gemini-flash-1.5
• Alternative wäre: Direkte Google Gemini API
• Warum diese: OpenRouter ermöglicht einfachen Modellwechsel ohne Code-Änderung; ein Schlüssel für viele Modelle.

## Edge Cases
1. Was passiert bei: API-Fehler von OpenRouter
   Erwartetes Verhalten: Modal öffnet sich mit Fehlermeldung "E-Mail konnte nicht generiert werden. Bitte erneut versuchen."

2. Was passiert bei: Kunde hat keine Notiz / Beschwerde
   Erwartetes Verhalten: Prompt wird ohne Notiz-Abschnitt generiert, nur die vorhandenen Daten fließen ein

3. Was passiert bei: API antwortet nicht innerhalb von 15 Sekunden
   Erwartetes Verhalten: Timeout, Fehlermeldung "Server antwortet nicht", Knopf kehrt in Normalzustand zurück

## Akzeptanzkriterien
• [ ] "E-Mail generieren"-Knopf ist auf jeder Kunden-Detailseite sichtbar
• [ ] Knopf zeigt Spinner und ist während des API-Aufrufs deaktiviert
• [ ] Modal öffnet sich nach erfolgreichem Aufruf mit dem E-Mail-Entwurf
• [ ] Kopier-Button überträgt den Entwurf in die Zwischenablage
• [ ] Netzwerk-Tab zeigt keinen API-Key in Browser-Requests
• [ ] Bei API-Fehler erscheint Fehlermeldung im Modal
• [ ] Timeout nach 15 Sekunden mit Fehlermeldung
• [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
