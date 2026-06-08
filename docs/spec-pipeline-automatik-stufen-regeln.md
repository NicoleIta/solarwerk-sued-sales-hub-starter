# Spec: Pipeline-Automatik — Stufen-Regeln live berechnen

## Zweck

Das Feature berechnet bei jedem Seitenaufruf live, ob ein Kunde vernachlässigt,
in Verhandlung, gefährdet oder verloren ist — basierend auf Aktivitäten, Angeboten
und Beschwerden. Manuelle Stempel entfallen; der Zustand ergibt sich immer aus
den echten Daten.

## Inputs

- **Aktivitäten-Tabelle (Supabase):** `kunde_id`, `typ`, `datum`
- **Angebote-Tabelle (Supabase):** `kunde_id`, `status`, `erstellt_am`
- **Beschwerden-Feld am Kunden:** `beschwerde` (boolean oder Text)
- **Pipeline-Stufe am Kunden:** `pipeline_stufe` (um Abschluss-Kunden auszunehmen)
- **Kunden-Erstellungsdatum:** `erstellt_am` (für die Schonfrist)
- **Konfiguration:** `NEGLECTED_THRESHOLD_DAYS = 14` (in config-Datei, anpassbar)

## Verhalten

1. Seite lädt → `computeKundeStatus(kunde, aktivitaeten, angebote)` wird aufgerufen
2. Kunde in Abschluss-Stufe? → kein Auto-Status, Funktion gibt `null` zurück
3. Neuer Kunde (< 14 Tage alt, keine Aktivität)? → kein „vernachlässigt"
4. Letzte Aktivität > 14 Tage? → Status: **vernachlässigt**
5. Letzte Aktivität > 90 Tage? → Status: **verloren**
6. Offenes Angebot vorhanden? → Status: **in Verhandlung**
7. Beschwerde vorhanden? → Status: **Risiko**
8. Mehrere Regeln treffen zu → Priorität: Risiko > Verloren > Vernachlässigt > In Verhandlung
9. Status als Badge im Dashboard und in der Kunden-Detailansicht anzeigen

## Architektur-Entscheidungen

| | Entscheidung |
|---|---|
| **Gewählt** | `lib/pipeline-rules.ts` — reine Hilfsfunktion ohne Side-Effects |
| **Alternative** | Logik inline in der Page-Komponente |
| **Begründung** | Testbar, wiederverwendbar, passt zur bestehenden `lib/`-Konvention |

| | Entscheidung |
|---|---|
| **Gewählt** | Live berechnen bei jedem Request |
| **Alternative** | Status in DB stempeln |
| **Begründung** | Kein veralteter Zustand, neue Aktivitäten wirken sofort, kein Hintergrund-Job |

## Edge Cases

- **Grenzfall Schwellenwert:** Letzte Aktivität exakt am Tag 14 → noch kein Badge (Bedingung: `> 14`, nicht `>= 14`)
- **Mehrere Regeln gleichzeitig:** Prioritätsreihenfolge greift — nur der höchste Status wird angezeigt
- **Schonfrist-Grenze:** Neuer Kunde, der exakt am Tag 14 nach Anlage noch keine Aktivität hat → Schonfrist läuft ab, wird jetzt „vernachlässigt"
- **Abschluss-Stufe mit Beschwerde:** Nur die „keine Aktivität"-Regeln sind ausgenommen — „Risiko" greift trotzdem

## Akzeptanzkriterien

- [ ] Alle 5 Regeln greifen korrekt: vernachlässigt, verloren, in Verhandlung, Risiko, Schonfrist
- [ ] Grenzfall-Tests bestehen: Tag 13 → kein Badge, Tag 15 → Badge (bei Schwelle 14)
- [ ] Abschluss-Kunden erhalten kein „vernachlässigt"- oder „verloren"-Badge
- [ ] Badge erscheint im Dashboard (Tabellen-Spalte) und in der Kunden-Detailansicht
- [ ] `NEGLECTED_THRESHOLD_DAYS` in config ändern → alle abhängigen Regeln passen sich an
- [ ] Kein Status-Wert wird in die Datenbank geschrieben
