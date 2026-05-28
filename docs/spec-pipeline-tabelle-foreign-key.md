# Spec: Pipeline-Tabelle mit Foreign Key

Diese Vorlage füllt Ihr aus, BEVOR Ihr Claude Code zum Bauen prompted.
Wer ohne Spec prompted, baut blind. Wer mit Spec prompted, baut gezielt.

---

## Zweck

Die pipeline-Tabelle wird in Supabase mit Foreign Key zu kunden angelegt und löst
die bisherige CSV-Datenquelle ab. Pipeline-Einträge werden persistent gespeichert,
können gelesen werden und sind immer einem konkreten Kunden zugeordnet — die
Datenbank garantiert diese Integrität automatisch.

---

## Inputs

- `titel` (text) — Bezeichnung des Pipeline-Eintrags, z.B. "Erstanfrage"
- `status` (text, CHECK-Constraint) — einer von: erstkontakt · angebot_raus ·
  verhandlung · vor_ort_termin · gewonnen · verloren
- `betrag` (numeric) — Angebotssumme in EUR, kann NULL sein (noch kein Angebot)
- `datum` (timestamptz) — Datum des Eintrags oder Angebotsdatums
- `notizen` (text) — Freitext, optional
- `kunde_id` (uuid, FK NOT NULL) — Verweis auf kunden.id, Pflichtfeld
- `id, created_at, updated_at` — Supabase-Standard, automatisch befüllt
- Bestehende Datenquelle: `data/solarwerk_pipeline.csv` — 20 Einträge als Mock-Daten

---

## Verhalten

1. CREATE TABLE pipeline mit allen Spalten wird als SQL formuliert
2. FK-Constraint wird gesetzt: `kunde_id uuid NOT NULL REFERENCES kunden(id) ON DELETE RESTRICT`
3. CHECK-Constraint für status wird gesetzt: nur die 6 definierten Werte erlaubt
4. SQL wird im Supabase SQL Editor ausgeführt
5. Mock-Daten aus `data/solarwerk_pipeline.csv` werden als INSERTs formuliert und ausgeführt
   — `kunde_id`-Werte müssen auf existierende UUIDs aus der kunden-Tabelle zeigen
6. Im Table Editor wird geprüft: Tabelle sichtbar, FK-Spalte erkennbar,
   Einträge einem Kunden zuordenbar

---

## Architektur-Entscheidungen

### Entscheidung 1: ON DELETE RESTRICT für den Foreign Key

- Gewählt: `ON DELETE RESTRICT` — DB blockiert das Löschen eines Kunden,
  solange Pipeline-Einträge existieren
- Alternative wäre: CASCADE (löscht Einträge mit) oder SET NULL (Einträge bleiben
  ohne Kundenbezug)
- Warum diese: Pipeline-Einträge sind Vertriebshistorie. Stiller Datenverlust durch
  CASCADE wäre im B2B-Kontext fahrlässig. RESTRICT zwingt zur bewussten Entscheidung
  beim Löschen — erst Einträge entfernen, dann Kunde.

### Entscheidung 2: CHECK-Constraint für den status-Wert

- Gewählt: CHECK-Constraint mit 6 erlaubten Status-Werten direkt in der Tabellendefinition
- Alternative wäre: Freies Textfeld ohne Constraint, Validierung nur im Frontend
- Warum diese: Die Datenbank garantiert Datenqualität unabhängig vom Einfügeweg.
  Tippfehler und ungültige Werte werden schon beim INSERT abgelehnt,
  nicht erst wenn sie im Frontend auftauchen.

---

## Edge Cases

1. Was passiert bei: INSERT mit einer `kunde_id`, die keinem Kunden in der kunden-Tabelle gehört
   Erwartetes Verhalten: DB lehnt den INSERT ab (Foreign Key Violation), kein Eintrag entsteht

2. Was passiert bei: DELETE eines Kunden, der noch Pipeline-Einträge hat
   Erwartetes Verhalten: RESTRICT greift — DB blockiert das Löschen, Fehlermeldung zurück

3. Was passiert bei: INSERT mit einem Status-Wert der nicht in der Liste steht (z.B. `offen`)
   Erwartetes Verhalten: CHECK-Constraint lehnt den INSERT ab, kein Eintrag entsteht

4. Was passiert bei: INSERT mit `betrag = NULL` oder negativem Wert
   Erwartetes Verhalten: NULL ist erlaubt (noch kein Angebot vorhanden);
   negativer Wert wird akzeptiert (kein CHECK dafür definiert — bewusste Vereinfachung)

---

## Akzeptanzkriterien

- [ ] Tabelle `pipeline` ist im Supabase Table Editor sichtbar mit allen Spalten
- [ ] `kunde_id` ist als Foreign Key auf `kunden(id)` markiert erkennbar
- [ ] Jeder Mock-Eintrag hat eine gültige `kunde_id` — kein Eintrag ohne Kundenbezug
- [ ] INSERT mit ungültigem Status-Wert wird von der DB abgelehnt (CHECK-Constraint aktiv)
- [ ] DELETE eines Kunden mit Pipeline-Einträgen wird von der DB blockiert (RESTRICT aktiv)
- [ ] Mindestens 12 Mock-Einträge aus `solarwerk_pipeline.csv` sind in Supabase eingefügt
- [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
