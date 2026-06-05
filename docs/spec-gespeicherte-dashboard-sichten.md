# Spec: Gespeicherte Dashboard-Sichten: Filterkriterien speichern & als CSV exportieren

## Aufgabe
Gespeicherte Dashboard-Sichten: Filterkriterien speichern & als CSV exportieren

## Zweck
Nutzer können benannte Dashboard-Sichten anlegen, die ihre aktiven Filterkriterien speichern.
Beim Aktivieren einer Sicht werden die Filter neu ausgewertet — die Ansicht bleibt immer aktuell.
Die gespeicherten Sichten sind nutzer-spezifisch und persistieren über den Login hinaus.
Zusätzlich kann jede Sicht als CSV exportiert werden.

## Inputs
- **Sicht-Name:** Text, Pflichtfeld (Nutzer-Eingabe)
- **Filter-Zustand:** Branche, Status, Berater, Suchbegriff (aktiver Zustand des Dashboards)
- **Datenquelle Sichten:** Supabase-Tabelle `dashboard_views` (user_id, name, filter_json)
- **Datenquelle Export:** Gefilterte Kundenliste aus `data/solarwerk_kunden.csv`

## Verhalten
1. Nutzer setzt Filter im Dashboard (Branche, Status, Berater, Suche).
2. Nutzer klickt „Sicht speichern".
3. Nutzer gibt einen Namen ein (Modal oder Inline-Feld).
4. Sicht wird in Supabase gespeichert: `{ user_id, name, filter_json }`.
5. Gespeicherte Sichten erscheinen als klickbare Chips/Buttons über der Tabelle.
6. Klick auf eine Sicht lädt deren Filter — Tabelle aktualisiert sich sofort.
7. „Exportieren"-Button lädt die aktuell gefilterten Kunden als CSV-Datei herunter.
8. Sichten können gelöscht werden; beim Löschen einer aktiven Sicht fällt das Dashboard auf ungefilterte Ansicht zurück.

## Architektur-Entscheidungen

| Entscheidung | Gewählt | Alternative | Begründung |
|---|---|---|---|
| Was wird gespeichert? | Filterkriterien als `filter_json` (z. B. `{branche: "Handwerk", status: "aktiv"}`) | Kunden-IDs als Schnappschuss | Sichten bleiben nach Datenänderungen korrekt — kein veralteter Stand |
| Nutzer-Isolation | Supabase RLS auf `dashboard_views` (user_id = auth.uid()) | App-Level-Prüfung | Sicherer, weniger Fehlerquellen |

## Edge Cases
- **Veralteter Filter:** Sicht filtert nach Branche "Handwerk", alle Handwerk-Kunden wurden gelöscht → leere Tabelle, kein Fehler.
- **Gleicher Sicht-Name, zwei Nutzer:** Nutzer A und B haben je eine Sicht namens "Meine Leads" → kein Konflikt, `user_id` trennt sauber.
- **Export bei leerem Ergebnis:** Filter trifft null Kunden → CSV enthält nur Header-Zeile, keinen Fehler.
- **Aktive Sicht löschen:** Nutzer löscht die gerade angezeigte Sicht → Dashboard fällt auf ungefilterte Gesamt-Ansicht zurück.

## Akzeptanzkriterien
- [ ] **Persistenz:** Nutzer speichert Sicht, meldet sich ab, meldet sich an — Sicht und Filter sind noch korrekt vorhanden.
- [ ] **Nutzer-Isolation:** Nutzer A sieht keine Sichten von Nutzer B und umgekehrt (RLS aktiv).
- [ ] **Keine Snapshots:** Sicht wird nach Datenänderung neu ausgewertet — keine veralteten Kunden-IDs.
- [ ] **CSV-Export:** Export liefert genau die gefilterten Kunden; bei 0 Treffern nur Header-Zeile, kein Fehler.
- [ ] **Rechte:** Nutzer kann nur eigene Sichten lesen, schreiben und löschen — kein Zugriff auf fremde Sichten.
- [ ] **Löschen aktiver Sicht:** Dashboard fällt auf ungefilterte Ansicht zurück.

## Muss-Fälle (aus Feature-Beschreibung)
- Zwei Nutzer: Verhalten passt zur Entscheidung (pro Nutzer: jeder nur seine eigenen Sichten)
- Sicht bleibt korrekt nachdem sich Daten geändert haben (Filterkriterium, nicht Resultat gespeichert)
- Nach erneutem Login noch da — wirklich persistiert
