#Spec: RLS-Verifikation: Sehen & Ändern testen

Diese Vorlage füllt Ihr aus, BEVOR Ihr Claude Code zum Bauen prompted.
Wer ohne Spec prompted, baut blind. Wer mit Spec prompted, baut gezielt.

---

##Zweck
Vier konkrete Tests mit zwei echten Accounts beweisen, dass die RLS-Policies wie entworfen funktionieren und decken Datenschutzlücken auf, bevor sie produktiv gehen. Erst wenn alle vier Tests bestanden sind, gilt das Feature als fertig — wer Test 3 oder 4 nicht zeigen kann, hat die Policy noch nicht fertig.

---

##Inputs
- Vertriebler-Account — Auth-Nutzer mit role = 'vertriebler' und mind. einem Kunden in kunden_owner
- Leitungs-Account — Auth-Nutzer mit role = 'leitung'
- Mindestens ein "fremder" Kunde — Kunde ohne kunden_owner-Eintrag für den Vertriebler-Account
- Aktive RLS-Policies auf kunden + profiles — Voraussetzung: Spec 04 abgeschlossen

---

##Verhalten (die vier Tests)
1. Test 1 — Vertriebler → sieht alle Kunden:
   Als Vertriebler in der App einloggen, Dashboard öffnen — alle Kunden sind sichtbar (SELECT ungefiltert)

2. Test 2 — Leitung → sieht alle Kunden:
   Als Leitung in Inkognito-Fenster einloggen — alle Kunden sichtbar, voller Zugriff bestätigt

3. Test 3 — Vertriebler → fremden Kunden ändern schlägt fehl:
   Im Supabase SQL-Editor UPDATE auf Kunden ohne kunden_owner-Eintrag — Datenbank gibt 0 rows affected zurück (lautlose Verweigerung)

4. Test 4 — Vertriebler → eigene Rolle ändern schlägt fehl:
   Im SQL-Editor UPDATE profiles SET role='leitung' WHERE id = auth.uid() — Policy blockiert den Zugriff

---

##Architektur-Entscheidungen

###Entscheidung 1: App + SQL-Editor kombiniert
- Gewählt: Sicht-Tests (1+2) in der laufenden App, Schreib-Tests (3+4) im Supabase SQL-Editor
- Alternative wäre: Alle vier Tests nur über die App-UI
- Warum diese: App zeigt die echte Nutzererfahrung für Sicht-Tests, SQL-Editor macht Schreib-Tests präziser und reproduzierbarer (0 rows affected ist klar messbar).

###Entscheidung 2: Normales Fenster + Inkognito für zwei Accounts
- Gewählt: Normales Browser-Fenster = Vertriebler-Session, Inkognito-Fenster = Leitungs-Session
- Alternative wäre: Sequenziell — ausloggen und einloggen
- Warum diese: Zwei Fenster gleichzeitig zeigen den Unterschied live — überzeugender als sequenzielles Testen ohne direkten Vergleich.

---

##Edge Cases

1. Was passiert bei: Test 3 gibt keinen Fehler, aber 0 rows affected
   Erwartetes Verhalten: Das ist korrekt — RLS verweigert lautlos. Muss aktiv geprüft werden (nicht als Erfolg missverstehen)

2. Was passiert bei: Vertriebler hat keinen Kunden in kunden_owner
   Erwartetes Verhalten: Test 1 funktioniert (alle sichtbar), aber Test 3 ist nicht aussagekräftig testbar — mind. ein eigener Kunde muss vorhanden sein

3. Was passiert bei: Leitungs-Account fehlt in profiles
   Erwartetes Verhalten: Test 2 schlägt fehl — keine Rolle = keine Policy-Übereinstimmung = leere Liste. Lösung: Leitungs-Account in profiles eintragen (Spec 02)

4. Was passiert bei: Test 4 wirft Fehler statt lautloser Verweigerung
   Erwartetes Verhalten: Beide Varianten (Fehler oder 0 rows) sind korrekt — Policy kann beides tun. Wichtig: das Ergebnis dokumentieren, damit klar ist was erwartet wird.

---

##Akzeptanzkriterien
- [ ] Test 1: Vertriebler sieht alle Kunden im Dashboard (live in der App)
- [ ] Test 2: Leitung sieht alle Kunden im Dashboard (live in der App)
- [ ] Test 3: UPDATE auf fremden Kunden = 0 rows affected (im SQL-Editor)
- [ ] Test 4: UPDATE profiles SET role='leitung' WHERE id = auth.uid() wird blockiert (im SQL-Editor)
- [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
