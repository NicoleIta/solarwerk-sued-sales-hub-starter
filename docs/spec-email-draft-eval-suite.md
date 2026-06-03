# Spec: E-Mail-Draft Eval-Suite

## Zweck
Die Eval-Suite prüft generierte E-Mail-Entwürfe auf harte Kriterien (Kundename, Deutsch, keine Platzhalter, Länge) und bewertet mit einem LLM-Richter, ob Ton und Inhalt zur Pipeline-Stufe passen und keine Fakten erfunden wurden. Damit wird die Qualität des E-Mail-Draft-Features aus Tag 10 systematisch und wiederholbar messbar.

---

## Inputs

### Prompt-Datei
- `prompts/email-draft.md` — enthält den Prompt-Text mit Variablen-Platzhaltern (z.B. `{{firma}}`, `{{pipeline_stufe}}`)

### 5 Testfälle als YAML-Vars in `promptfooconfig.yaml` (Quelle: `data/solarwerk_kunden_2.csv`)

| # | Situation | Firma | Ansprechpartner | Pipeline-Stufe | Besonderheit |
|---|-----------|-------|-----------------|----------------|--------------|
| 1 | Früher Lead | Eichinger Metallbau OHG | Stefan Eichinger | Lead | Erste Wartung Q3 fällig, normale Datenlage |
| 2 | Heißer Lead | Kfz-Werkstatt Sedlmeier | Markus Sedlmeier | Verhandlung | "Unterschrift für KW 21 zugesagt" |
| 3 | Eingeschlafener Kunde | Pension Alpenblick | Herbert Waldner | Lead | Letzter Kontakt: 2026-01-10 (5 Monate) |
| 4 | Minimale Daten | Sägewerk Brandl | Anton Brandl | Lead | Keine Notiz, kein Datum, kein Telefon |
| 5 | Abgeschlossen-Verloren | Kunststofftechnik Vogl GmbH | Dieter Vogl | Verloren | "Kein weiterer Bedarf signalisiert" |

### API
- `OPENROUTER_API_KEY` (Umgebungsvariable, lokal in `.env.local`, in CI als GitHub Secret)

---

## Verhalten

1. `promptfoo eval` wird gestartet (lokal oder via GitHub Actions)
2. Für jeden der 5 Testfälle: YAML-Vars befüllen das Prompt-Template → Anfrage an LLM (OpenRouter)
3. **Deterministische Checks** laufen sofort, ohne LLM-Aufruf:
   - Ansprechpartner-Name ist im Output enthalten
   - Kein nicht-ersetzter Platzhalter (`{...}` oder `[GROSSBUCHSTABEN]`) vorhanden
   - Ausgabe unter 300 Wörtern
   - Kein englischer Text (Check auf "Dear", "Best regards", "Sincerely", "Hello")
4. **LLM-as-Judge** bewertet danach mit eigenem LLM-Aufruf:
   - Keine erfundenen Fakten (nur Details aus Eingabe-Daten)
   - Ton passt zur Pipeline-Stufe (Lead = einladend, Verhandlung = konkret/verbindlich)
   - Sauberer Umgang mit fehlenden Daten (kein Erfinden, wenn Felder leer)
   - Verloren-Testfall: explizite Entscheidung sichtbar (Rückgewinnungs-Hinweis oder begründete Ablehnung)
5. Ergebnis: Pass/Fail pro Testfall, pro Check — in der Promptfoo-UI sichtbar

---

## Architektur-Entscheidungen

### Entscheidung 1: Testdaten als YAML-Vars in promptfooconfig.yaml
- Gewählt: Jeder Testfall als `vars`-Block direkt in der Config
- Alternative wäre: CSV-Provider (Promptfoo liest solarwerk_kunden_2.csv direkt) oder JSON-Dateien pro Fall
- Warum diese: Gezielte Auswahl der 5 relevanten Situationen statt Bulk-Import aller 27 Kunden. Alles an einem Ort — übersichtlich und einfach wartbar.

### Entscheidung 2: OpenRouter-Modell auch für LLM-as-Judge
- Gewählt: OpenRouter mit günstigem Modell (z.B. `anthropic/claude-haiku-4-5`) als Richter
- Alternative wäre: Separater OpenAI-Provider nur für den Judge
- Warum diese: Kein zweiter API-Key nötig. OpenRouter erlaubt Modellwechsel für Judge und Provider unabhängig voneinander ohne Code-Änderung.

---

## Edge Cases

1. Was passiert bei: LLM erfindet Details bei Sägewerk Brandl (keine Notiz vorhanden)
   Erwartetes Verhalten: LLM-as-Judge schlägt an und bewertet als FAIL. Der Judge prüft explizit: "Steht jedes genannte Detail in den Eingabe-Daten?"

2. Was passiert bei: Verloren-Kunde (Kunststofftechnik Vogl) — Mail wird ohne Hinweis generiert
   Erwartetes Verhalten: LLM-as-Judge bewertet als FAIL wenn weder ein Rückgewinnungs-Hinweis noch eine Begründung im Output erscheint. Die Entscheidung "Mail ja/nein" muss explizit sein.

3. Was passiert bei: Platzhalter bleibt im Output stehen (z.B. `{ansprechpartner}`)
   Erwartetes Verhalten: Deterministischer Regex-Check `\{[^}]+\}` schlägt an → Testfall FAIL ohne LLM-Aufruf.

4. Was passiert bei: LLM generiert Ausgabe auf Englisch
   Erwartetes Verhalten: Deterministischer Check auf "Dear", "Best regards", "Sincerely", "Hello" schlägt an → Testfall FAIL.

---

## Akzeptanzkriterien
- [ ] Alle 5 Testfälle laufen in `promptfoo eval` durch (kein Crash, kein Abbruch)
- [ ] Deterministischer Platzhalter-Check schlägt bei künstlich präpariertem Output mit `{firma}` an
- [ ] Deterministischer Längen-Check schlägt bei Output über 300 Wörtern an
- [ ] LLM-as-Judge bewertet Früher-Lead-Ton und Verhandlungs-Ton unterschiedlich (nicht identisches Score)
- [ ] LLM-as-Judge erkennt erfundene Details beim Sägewerk-Brandl-Testfall
- [ ] Verloren-Testfall produziert ein nachvollziehbares Ergebnis mit explizitem Hinweis oder Ablehnung
- [ ] Ergebnisse sind in der Promptfoo-UI (`promptfoo view`) als Pass/Fail pro Check sichtbar
- [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
