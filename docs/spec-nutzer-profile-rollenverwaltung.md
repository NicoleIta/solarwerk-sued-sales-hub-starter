#Spec: Nutzer-Profile & Rollenverwaltung

Diese Vorlage füllt Ihr aus, BEVOR Ihr Claude Code zum Bauen prompted.
Wer ohne Spec prompted, baut blind. Wer mit Spec prompted, baut gezielt.

---

##Zweck
Die profiles-Tabelle speichert zu jedem Auth-Nutzer eine Rolle ('vertriebler', 'leitung', 'marketing', 'verkauf', 'admin', 'geschaeftsleitung') sowie Name und E-Mail als Profil-Datensatz. Sie ist die Grundlage für spätere RLS-Policies, die steuern, welche Kunden ein Nutzer sehen darf.

---

##Inputs
- auth.users (Supabase Auth) — UUID und E-Mail, profiles.id referenziert auth.users(id)
- Rolle (manuell per SQL) — text: 'vertriebler' | 'leitung' | 'marketing' | 'verkauf' | 'admin' | 'geschaeftsleitung'
- Name des Nutzers (manuell) — Klarname als text
- E-Mail (aus auth.users gespiegelt) — redundant in profiles.email für einfachere Abfragen

Geplante Erweiterung (noch nicht implementiert):
- Admin-Eingabemaske zur Rollenvergabe über die UI
- Neuer-Kunde-Formular: Owner-Feld mit Auto-Fill via auth.uid()

---

##Verhalten
1. CREATE TABLE profiles mit id (FK → auth.users), role (text + CHECK), name (text), email (text) im Supabase SQL-Editor anlegen
2. Mind. 1 Vertriebler-Account per INSERT eintragen (role = 'vertriebler')
3. Mind. 1 Leitungs-Account per INSERT eintragen (role = 'leitung')
4. Verifikation: SELECT * FROM profiles zeigt alle Nutzer mit Rollen korrekt

---

##Architektur-Entscheidungen

###Entscheidung 1: role als TEXT mit CHECK-Constraint
- Gewählt: role text CHECK (role IN ('vertriebler','leitung','marketing','verkauf','admin','geschaeftsleitung'))
- Alternative wäre: PostgreSQL ENUM-Typ
- Warum diese: TEXT + CHECK ist einfacher anzupassen — neue Rollen erfordern nur eine CHECK-Erweiterung, kein ALTER TYPE mit Downtime.

###Entscheidung 2: Rollen manuell per SQL, kein Trigger
- Gewählt: INSERT direkt im Supabase SQL-Editor
- Alternative wäre: Trigger bei auth.users-Anlage (legt profiles-Eintrag automatisch an)
- Warum diese: Manuell ist verständlicher für ein Lehr-Repo — kein versteckter DB-Trigger, der Lernende verwirrt.

---

##Edge Cases

1. Was passiert bei: Nutzer in auth.users, aber kein profiles-Eintrag
   Erwartetes Verhalten: Eingeloggter Nutzer hat keine Rolle — RLS-Policy kann ihn nicht zuordnen, er sieht gar nichts

2. Was passiert bei: Ungültige Rolle eingetragen (z.B. 'superuser')
   Erwartetes Verhalten: CHECK-Constraint verhindert den INSERT — SQL-Fehler im Editor

3. Was passiert bei: INSERT in profiles mit unbekannter UUID
   Erwartetes Verhalten: FK-Constraint auf auth.users schlägt an — INSERT wird abgelehnt

4. Was passiert bei: Zweiter profiles-Eintrag für dieselbe UUID
   Erwartetes Verhalten: PRIMARY KEY auf id verhindert den Duplikat-INSERT

---

##Akzeptanzkriterien
- [ ] Tabelle profiles mit id, role, name, email im Table Editor sichtbar
- [ ] Mind. 1 Vertriebler + 1 Leitungs-Account in profiles eingetragen
- [ ] SELECT * FROM profiles zeigt beide Rollen korrekt
- [ ] INSERT mit role = 'superuser' schlägt mit CHECK-Fehler fehl
- [ ] INSERT mit unbekannter UUID schlägt mit FK-Fehler fehl
- [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
