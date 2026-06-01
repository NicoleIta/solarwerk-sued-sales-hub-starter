#Spec: RLS-Policy-Spec: Rollen & Sichtbarkeit

Diese Vorlage füllt Ihr aus, BEVOR Ihr Claude Code zum Bauen prompted.
Wer ohne Spec prompted, baut blind. Wer mit Spec prompted, baut gezielt.

---

##Zweck
RLS-Policies steuern auf Datenbankebene, welche Zeilen der kunden-Tabelle ein eingeloggter Nutzer lesen und ändern darf. Vertriebler sehen alle Kunden, dürfen aber nur ihre eigenen bearbeiten — Leitung hat vollen Lese- und Schreibzugriff auf alle.

---

##Inputs
- auth.uid() — UUID des eingeloggten Nutzers (Basis jeder Policy-Prüfung)
- profiles.role — Rolle des Nutzers ('vertriebler' | 'leitung'), gelesen via Subquery zur Laufzeit
- kunden_owner — Eigentums-Zuordnung, EXISTS-Prüfung ob auth.uid() für diesen Kunden eingetragen ist
- kunden-Tabelle — die geschützte Ressource, deren Zeilen gefiltert werden

---

##Verhalten
1. RLS auf kunden-Tabelle aktivieren: ALTER TABLE kunden ENABLE ROW LEVEL SECURITY
2. SELECT-Policy: Vertriebler und Leitung sehen alle Kunden (asymmetrisch — Einschränkung erst beim Schreiben)
3. INSERT/UPDATE/DELETE-Policy für Vertriebler: nur erlaubt wenn EXISTS in kunden_owner mit auth.uid()
4. Leitung: INSERT/UPDATE/DELETE ohne Einschränkung
5. UPDATE-Policy auf profiles: Rollenänderung nur erlaubt wenn eigene Rolle = 'leitung' oder 'admin' UND Ziel-User != auth.uid()

---

##Architektur-Entscheidungen (Sektion 4 — Schwerpunkt)

###Entscheidung 1: Asymmetrisches Rechtemodell (Lesen ≠ Schreiben)
- Gewählt: Vertriebler sieht alle Kunden (SELECT ohne Filter), darf aber nur eigene bearbeiten (Schreiben via EXISTS auf kunden_owner)
- Alternative wäre: Vertriebler sieht nur eigene Kunden (SELECT ebenfalls gefiltert)
- Warum diese: Für den Vertriebsalltag ist Gesamtüberblick sinnvoll — ein Vertriebler soll wissen, welche Kunden es gibt, auch wenn er nicht der Owner ist.

###Entscheidung 2: EXISTS-Subquery auf kunden_owner für Eigentumsprüfung
- Gewählt: EXISTS (SELECT 1 FROM kunden_owner WHERE kunden_id = kunden.id AND user_id = auth.uid())
- Alternative wäre: Direkte owner_id-Spalte in kunden vergleichen
- Warum diese: kunden_owner ist eine n:m-Tabelle (ein Kunde kann mehrere Owner haben) — ein direkter Spaltenvergleich würde nur einen Owner abbilden.

###Entscheidung 3: Rollenänderung schützt gegen Selbst-Eskalation
- Gewählt: UPDATE auf profiles nur erlaubt wenn user_id != auth.uid() — niemand darf die eigene Rolle ändern
- Alternative wäre: Leitung darf auch die eigene Rolle ändern
- Warum diese: Selbst-Eskalation ist ein klassisches Sicherheitsproblem — wer sich selbst zur Leitung machen kann, kann jede Kontrolle umgehen.

###Entscheidung 4: Rollen in profiles statt in auth.users metadata
- Gewählt: Rolle als Spalte in der profiles-Tabelle speichern
- Alternative wäre: Rolle in auth.users user_metadata oder app_metadata schreiben
- Warum diese: profiles ist eine normale Tabelle mit RLS-Schutz — user_metadata ist nur über Service-Role änderbar und für App-seitige Logik schwerer zu lesen.

---

##Edge Cases

1. Was passiert bei: Vertriebler versucht Kunden zu löschen, der ihm nicht gehört
   Erwartetes Verhalten: DELETE gibt 0 rows affected zurück — RLS filtert die Zeile lautlos weg, kein Fehler

2. Was passiert bei: Nutzer ohne profiles-Eintrag liest kunden-Tabelle
   Erwartetes Verhalten: SELECT gibt leere Liste zurück — keine Rolle = keine Policy-Übereinstimmung

3. Was passiert bei: Leitung versucht eigene Rolle auf 'admin' zu setzen
   Erwartetes Verhalten: UPDATE wird durch Policy blockiert — Ziel-User = auth.uid() ist verboten

4. Was passiert bei: RLS ist aktiv, aber keine Policy definiert
   Erwartetes Verhalten: Alle Abfragen geben leere Ergebnisse — Supabase-Default: ohne Policy sieht niemand etwas

---

##Akzeptanzkriterien
- [ ] Vertriebler-Account sieht alle Kunden im Dashboard (SELECT ungefiltert)
- [ ] Vertriebler-UPDATE auf fremden Kunden: 0 rows affected, kein Fehler
- [ ] Leitung-Account sieht alle Kunden und kann beliebige bearbeiten
- [ ] UPDATE profiles SET role=... WHERE id = auth.uid() wird blockiert
- [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
