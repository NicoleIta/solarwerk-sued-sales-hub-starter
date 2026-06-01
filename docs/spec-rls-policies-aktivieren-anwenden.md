#Spec: RLS-Policies aktivieren & anwenden

Diese Vorlage füllt Ihr aus, BEVOR Ihr Claude Code zum Bauen prompted.
Wer ohne Spec prompted, baut blind. Wer mit Spec prompted, baut gezielt.

---

##Zweck
Claude generiert aus der RLS-Policy-Spec das konkrete SQL, das im Supabase SQL-Editor ausgeführt wird — Policy und RLS-Aktivierung werden zusammen eingespielt, damit die Tabelle nie im "deny all"-Zustand ist. Ab diesem Moment greift die Zugriffskontrolle für alle API-Anfragen.

---

##Inputs
- Spec 03 (RLS-Policy-Spec: Rollen & Sichtbarkeit) — Regelwerk, aus dem Claude das SQL generiert
- Supabase SQL-Editor — manueller Ausführungsort für das generierte SQL
- kunden-Tabelle + kunden_owner — Policy auf kunden greift über kunden_owner
- profiles-Tabelle — Policy auf profiles wird ebenfalls aktiviert

---

##Verhalten
1. Claude generiert SQL aus Spec 03: CREATE POLICY-Statements + ALTER TABLE ENABLE ROW LEVEL SECURITY für kunden und profiles
2. SQL wird vom Lernenden gelesen und als Regel verstanden ("Vertriebler darf schreiben wenn...") — kein blindes Einfügen
3. Policy auf kunden-Tabelle im SQL-Editor ausführen (SELECT-Policy + INSERT/UPDATE/DELETE-Policy)
4. Policy auf profiles-Tabelle im SQL-Editor ausführen (eigene Zeile lesen, Rollenänderung nur durch Leitung/Admin)

---

##Architektur-Entscheidungen

###Entscheidung 1: Policy und Aktivierung im selben SQL-Block
- Gewählt: CREATE POLICY + ALTER TABLE ENABLE ROW LEVEL SECURITY in einem einzigen SQL-Statement
- Alternative wäre: Erst aktivieren, dann Policy in zweitem Schritt
- Warum diese: Erst aktivieren ohne Policy = "deny all" — Tabelle wirkt leer für alle Nutzer, was für Lernende verwirrend ist und wie ein Fehler aussieht.

###Entscheidung 2: SQL von Claude generieren, aber aktiv lesen
- Gewählt: Claude generiert SQL aus Spec 03, Lernender liest und versteht jede Zeile bevor er sie ausführt
- Alternative wäre: SQL rein manuell schreiben oder blind einfügen
- Warum diese: Der Lerneffekt liegt im Verstehen der Regel, nicht im Tippen von SQL — aber wer blind einfügt, lernt nichts über den Mechanismus.

---

##Edge Cases

1. Was passiert bei: RLS aktiviert, aber keine Policy definiert
   Erwartetes Verhalten: Tabelle wirkt für alle Nutzer leer ("deny all") — kein Fehler, aber verwirrend. Lösung: Policy sofort miteinrichten.

2. Was passiert bei: CREATE POLICY zweimal ausgeführt (Duplikat)
   Erwartetes Verhalten: PostgreSQL-Fehler "policy already exists" — erst DROP POLICY, dann neu anlegen

3. Was passiert bei: SQL-Fehler bricht nur das aktuelle Statement ab
   Erwartetes Verhalten: Andere Policies können trotzdem aktiv sein — Verifikation im Dashboard nötig, welche Policies tatsächlich gesetzt sind

4. Was passiert bei: profiles-Policy fehlt, kunden-Policy ist aktiv
   Erwartetes Verhalten: Nutzer kann Kunden sehen, aber eigene Rolle nicht lesen — unvollständiger Zustand, der zu unerwartetem Verhalten in der App führt

---

##Akzeptanzkriterien
- [ ] Policies im Supabase Dashboard unter Authentication > Policies sichtbar
- [ ] Vertriebler-Account sieht alle Kunden, UPDATE auf fremden Kunden = 0 rows
- [ ] Leitungs-Account sieht alle Kunden und kann beliebige bearbeiten
- [ ] Kein "deny all"-Zustand während der Aktivierung aufgetreten
- [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
