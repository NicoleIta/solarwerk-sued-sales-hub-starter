# Spec: Wiedervorlage — Follow-up-Datum mit Status an Kunde und Pipeline-Eintrag

## Aufgaben-Titel
Wiedervorlage: Follow-up-Datum mit Status an Kunde und Pipeline-Eintrag

## Zweck
Nutzer können an Kunden und Pipeline-Einträgen ein Wiedervorlage-Datum mit Grund und Status hinterlegen. Das Dashboard hebt fällige Wiedervorlagen (heute und überfällig, Status offen) in einer eigenen Sektion hervor.

## Inputs

- `customer_id` — UUID, FK zu Kunden-Tabelle, optional
- `pipeline_entry_id` — UUID, FK zu Pipeline-Tabelle, optional
- `due_date` — DATE, Pflichtfeld
- `reason` — TEXT, optional (Freitext-Notiz, z. B. „Angebot nachfassen")
- `status` — ENUM: offen | erledigt, Default: offen
- `user_id` — UUID, FK zu auth.users, automatisch aus Session (kein Formularfeld)
- `created_at` — TIMESTAMP, automatisch von Supabase

**Constraint:** Mindestens einer der beiden FKs (`customer_id` oder `pipeline_entry_id`) muss gesetzt sein.

## Verhalten

1. Nutzer öffnet Kunden-Detail oder Pipeline-Eintrag.
2. Klickt „Wiedervorlage hinzufügen".
3. Formular erscheint: `due_date` (Pflicht) + `reason` (optional).
4. Speichern → Eintrag in DB mit `user_id` aus Session, `status = offen`, `created_at` automatisch.
5. Dashboard lädt beim Öffnen alle offenen Wiedervorlagen des eingeloggten Nutzers mit `due_date ≤ heute`.
6. Eigene Sektion „Wiedervorlagen" oben im Dashboard zeigt diese Einträge.
7. Nutzer klickt „Erledigt" → Status wird auf `erledigt` gesetzt → Eintrag verschwindet aus Dashboard-Sektion.
8. Erledigte Wiedervorlagen sind in einer Archiv-Ansicht weiterhin einsehbar (nicht hard-deleted).

## Architektur-Entscheidungen

### 1. Polymorphe Tabelle mit optionalen FKs

| | |
|---|---|
| **Gewählt** | Eine Tabelle `wiedervorlagen` mit optionalen `customer_id` und `pipeline_entry_id` |
| **Alternative** | Separate Tabellen pro Objekt-Typ (`kunden_wiedervorlagen`, `pipeline_wiedervorlagen`) |
| **Begründung** | Eine Tabelle reduziert Duplikation — ein einziger SELECT genügt für alle fälligen Einträge im Dashboard, unabhängig vom Objekt-Typ |

### 2. Row Level Security (RLS)

| | |
|---|---|
| **Gewählt** | RLS auf `wiedervorlagen`-Tabelle mit Policy `user_id = auth.uid()` |
| **Alternative** | App-seitiger WHERE-Filter ohne RLS |
| **Begründung** | Datentrennung greift auf DB-Ebene — ein vergessener App-Filter gibt keine fremden Daten preis |

### 3. Soft-Delete via Status-Feld

| | |
|---|---|
| **Gewählt** | `status = 'erledigt'` statt Löschen — Eintrag bleibt in DB, wandert ins Archiv |
| **Alternative** | Hard Delete |
| **Begründung** | Kein Datenverlust, Verlauf nachvollziehbar, Archiv-Ansicht möglich |

## Edge Cases

- **EC1:** Wiedervorlage ohne `customer_id` UND ohne `pipeline_entry_id` — CHECK-Constraint verhindert das; mindestens ein FK muss gesetzt sein.
- **EC2:** Nutzer wird gelöscht — `ON DELETE CASCADE` auf `user_id`; Wiedervorlagen werden mitgelöscht.
- **EC3:** `due_date` liegt beim Anlegen in der Vergangenheit — kein Fehler; Eintrag gilt sofort als überfällig und erscheint im Dashboard.
- **EC4:** Kunde oder Pipeline-Eintrag wird gelöscht — `ON DELETE SET NULL` auf `customer_id` / `pipeline_entry_id`; Wiedervorlage bleibt im Archiv, Objekt-Link wird geleert.
- **EC5:** Löschen eines Kunden mit offener Wiedervorlage — der bestehende Lösch-Dialog (implementiert in Tag 10) wird erweitert: Wiedervorlagen werden als Kontext-Info angezeigt, Nutzer muss explizit bestätigen.

## Akzeptanzkriterien

- [ ] AK1: Wiedervorlage kann auf Kunden-Detail-Seite und Pipeline-Eintrag angelegt werden; FK wird korrekt gesetzt.
- [ ] AK2: Dashboard-Sektion zeigt ausschließlich Einträge mit `due_date ≤ heute` UND `status = offen`.
- [ ] AK3: Nutzer A sieht keine Wiedervorlagen von Nutzer B — RLS greift, auch ohne App-seitigen Filter.
- [ ] AK4: „Erledigt"-Markierung setzt Status auf `erledigt`; Eintrag verschwindet sofort aus Dashboard-Sektion (kein Reload nötig).
- [ ] AK5: Erledigte Wiedervorlagen sind in einer Archiv-Ansicht weiterhin einsehbar.
- [ ] AK6: Löschen eines Kunden mit offener Wiedervorlage zeigt Bestätigungs-Dialog mit Wiedervorlage als Kontext-Information.
- [ ] AK7: Wiedervorlage ohne Objekt-Referenz (weder Kunde noch Pipeline) kann nicht gespeichert werden.
