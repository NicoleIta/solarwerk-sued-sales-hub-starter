#Spec: Kunden-Ownership via Supabase Auth

Diese Vorlage füllt Ihr aus, BEVOR Ihr Claude Code zum Bauen prompted.
Wer ohne Spec prompted, baut blind. Wer mit Spec prompted, baut gezielt.

---

##Zweck
Die kunden-Tabelle erhält eine Ownership-Struktur über eine neue Zwischentabelle kunden_owner, die jeden Kunden einem oder mehreren Supabase-Auth-Nutzern zuordnet und die Datenbasis für rollenbasierte Zugriffskontrolle (RLS) schafft. Bestandskunden werden per Seed-SQL in kunden_owner eingetragen, damit Vertriebler später nur ihre eigenen Kunden sehen können.

---

##Inputs
- Bestehende kunden-Tabelle (Supabase) — 25 Bestandskunden ohne Owner-Zuweisung
- Supabase Auth-Nutzer (auth.users) — UUIDs der eingeloggten Nutzer
- Seed-SQL (manuell im SQL-Editor ausgeführt) — befüllt kunden_owner für Bestandskunden
- Neu angelegte Kunden (INSERT) — Ersteller wird automatisch als erster Owner eingetragen

---

##Verhalten
1. CREATE TABLE kunden_owner(kunden_id, user_id) mit FK auf kunden und auth.users
2. Seed-SQL: INSERT in kunden_owner — alle 25 Bestandskunden erhalten mind. 1 Owner
3. Bei neuem Kunden-INSERT: zusätzlicher INSERT in kunden_owner mit auth.uid()
4. Verifikation: SELECT zeigt, dass kein Kunde ohne Eintrag in kunden_owner ist

---

##Architektur-Entscheidungen

###Entscheidung 1: Zwischentabelle statt owner_id-Spalte
- Gewählt: Zwischentabelle kunden_owner(kunden_id, user_id) für n:m-Beziehung
- Alternative wäre: Einzelne owner_id-Spalte in kunden mit DEFAULT auth.uid()
- Warum diese: Zwischentabelle erlaubt mehrere Owner pro Kunde — ein DEFAULT-Wert in einer einzelnen Spalte kann das nicht abbilden. Sauber und erweiterbar für spätere RLS-Policies.

###Entscheidung 2: Owner-Eintrag per App-Code statt DB-Default
- Gewählt: Nach INSERT in kunden folgt ein zweiter INSERT in kunden_owner mit auth.uid()
- Alternative wäre: Trigger auf der kunden-Tabelle, der automatisch kunden_owner befüllt
- Warum diese: Für ein Lehr-Repo ist expliziter App-Code verständlicher als ein versteckter DB-Trigger.

###Entscheidung 3: Seed-SQL manuell im SQL-Editor
- Gewählt: INSERT-Statement direkt im Supabase SQL-Editor ausführen
- Alternative wäre: Migration-File in /supabase/migrations
- Warum diese: Einmalige Aktion, kein Deployment-Zyklus nötig — einfacher für ein Lehr-Repo.

---

##Edge Cases

1. Was passiert bei: Bestandskunde ohne Eintrag in kunden_owner nach Seed
   Erwartetes Verhalten: Vertriebler sieht diesen Kunden nie — RLS-Policy findet keinen passenden Owner-Eintrag

2. Was passiert bei: Owner-Nutzer wird aus auth.users gelöscht
   Erwartetes Verhalten: FK-Constraint greift — Löschen wird blockiert oder user_id in kunden_owner wird NULL (je nach ON DELETE-Setting)

3. Was passiert bei: Neuem Kunden-INSERT ohne aktive Session
   Erwartetes Verhalten: auth.uid() gibt NULL zurück — kein Eintrag in kunden_owner, Kunde ist für niemanden sichtbar

4. Was passiert bei: Seed-SQL wird zweimal ausgeführt
   Erwartetes Verhalten: WHERE NOT EXISTS im Seed-SQL verhindert Duplikate (idempotent)

5. Was passiert bei: Versuch, denselben Owner zweimal für einen Kunden einzutragen
   Erwartetes Verhalten: PRIMARY KEY / UNIQUE auf (kunden_id, user_id) blockiert den Duplikat-INSERT mit Constraint-Fehler

---

##Akzeptanzkriterien
- [ ] Tabelle kunden_owner mit kunden_id + user_id im Supabase Table Editor sichtbar
- [ ] Alle 25 Bestandskunden haben mind. 1 Eintrag in kunden_owner nach Seed-SQL
- [ ] Neuer Kunde bekommt Ersteller automatisch als Owner-Eintrag in kunden_owner
- [ ] Ein Kunde kann mehrere Owner haben (zwei Zeilen mit gleicher kunden_id möglich)
- [ ] Duplikat-INSERT (gleicher Owner + Kunde) schlägt mit Constraint-Fehler fehl
- [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
