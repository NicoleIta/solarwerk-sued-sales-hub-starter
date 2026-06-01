# Spec: Admin-User-Verwaltung

Diese Vorlage füllt Ihr aus, BEVOR Ihr Claude Code zum Bauen prompted.
Wer ohne Spec prompted, baut blind. Wer mit Spec prompted, baut gezielt.

---

## Zweck

Die Admin-User-Verwaltung ermöglicht es dem Admin, alle Benutzer des Systems
an einem zentralen Ort anzulegen, zu bearbeiten, zu deaktivieren und mit
Rollen sowie feingranularen Berechtigungen auszustatten. Die Seite ist
ausschließlich für die Rolle „admin" zugänglich und weder über die Navigation
noch über eine direkte URL für andere Rollen erreichbar.

---

## Inputs

### Pflichtfelder (beim Anlegen eines neuen Users)
- Vorname (String)
- Nachname (String)
- E-Mail-Adresse (String, valides E-Mail-Format)
- Rolle (Enum: admin | manager | sales | viewer)
- Abteilung (String, z.B. Vertrieb, Innendienst, Technik)
- Eintrittsdatum (Date, Format TT.MM.JJJJ)

### Optionale Felder
- Adresse (Straße, PLZ, Ort — drei separate Felder)
- Geburtstag (Date, Format TT.MM.JJJJ)
- Telefonnummer (String)
- Profilbild / Avatar (Bild-Upload)
- Austrittsdatum (Date, Format TT.MM.JJJJ)

### Bestehende Datenquellen
- Supabase `auth.users` — UUID, E-Mail, Auth-Status
- Neue Supabase-Tabelle `profiles` — alle Profildaten,
  verknüpft via Foreign Key auf `auth.users.id`

---

## Verhalten

1. Admin öffnet die Seite „Benutzerverwaltung" über den Nav-Reiter
   (nur für Rolle „admin" sichtbar).
2. Die Seite zeigt eine sortierbare Tabelle aller vorhandenen User mit den
   Spalten: ID, Vorname, Nachname, E-Mail, Rolle, Abteilung, Status
   (Aktiv/Inaktiv), Eintrittsdatum.
3. Admin klickt „Neuer User" → ein Formular-Modal öffnet sich auf derselben
   Seite (kein Seitenwechsel).
4. Admin füllt Pflichtfelder aus, optional auch weitere Felder, und klickt
   „Speichern".
5. Bei Validierungsfehler (leere Pflichtfelder, ungültige E-Mail, bereits
   vorhandene E-Mail): Inline-Fehlermeldung, Formular bleibt offen.
6. Bei Erfolg: Formular schließt sich, Erfolgs-Meldung erscheint kurz,
   neuer User taucht sofort in der Tabelle auf.
7. Admin kann den Status (Aktiv/Inaktiv) eines Users direkt über ein Dropdown
   in der Tabellenzeile ändern — Änderung wird sofort in Supabase gespeichert,
   kein separater Speichern-Button nötig.
8. Admin kann einen bestehenden User öffnen und alle Felder bearbeiten,
   inkl. Rolle, Abteilung und Berechtigungen pro Bereich.
9. Berechtigungen werden pro Bereich (Kunden, Pipeline, Berichte,
   Benutzerverwaltung) einzeln als lesen / bearbeiten / löschen vergeben.
10. Admin kann über einen separaten Button „Neuen Admin ernennen" einen
    anderen User zur Rolle „admin" hochstufen. Dieser Vorgang erfordert eine
    Genehmigung der Geschäftsleitung (Approval-Workflow, z.B. per
    Bestätigungs-E-Mail oder manuellem Freigabe-Flag in Supabase).

---

## Architektur-Entscheidungen

### Entscheidung 1: Neue Supabase-Tabelle `profiles`
- Gewählt: Eigene Tabelle `profiles` mit Foreign Key auf `auth.users.id`
- Alternative wäre: Speicherung in `user_metadata` von `auth.users`
- Warum diese: `user_metadata` ist ein unstrukturiertes JSON-Blob und
  schwer abfragbar. Eine eigene Tabelle erlaubt typsichere Spalten,
  Supabase RLS-Regeln pro Feld und saubere SQL-Abfragen.

### Entscheidung 2: Berechtigungen als JSONB-Spalte in `profiles`
- Gewählt: Spalte `permissions` als JSONB,
  z.B. `{ kunden: { read: true, edit: true, delete: false }, ... }`
- Alternative wäre: Eigene Normalisierungstabelle `user_permissions`
- Warum diese: Für vier Bereiche ist eine eigene Tabelle Overhead ohne
  Mehrwert. JSONB ist flexibel, direkt in einer Zeile lesbar und einfach
  im Admin-Formular darstellbar.

### Entscheidung 3: Selbst-Deaktivierung gesperrt, Admin-Ernennung mit Approval
- Gewählt: Admin kann sich selbst nicht deaktivieren (UI-Block +
  serverseitige Prüfung). Neue Admin-Ernennung über separaten
  Genehmigungsprozess.
- Alternative wäre: Keine Einschränkung
- Warum diese: Verhindert, dass sich der einzige Admin aus dem System
  aussperrt. Der Approval-Workflow stellt sicher, dass Admin-Rechte
  nur mit Wissen der Geschäftsleitung vergeben werden.

### Entscheidung 4: Zugriffssperre doppelt abgesichert
- Gewählt: Serverseitige Rollenprüfung in der Route (Redirect bei
  nicht-Admin) UND Nav-Reiter nur für `role === 'admin'` gerendert.
  Nicht eingeloggte User → Login-Seite. Eingeloggte Nicht-Admins →
  Dashboard mit Meldung „Kein Zugriff".
- Alternative wäre: Nur Client-seitiger Schutz via Nav-Ausblendung
- Warum diese: Client-seitiger Schutz allein reicht nicht — jeder könnte
  die URL direkt aufrufen. Die serverseitige Prüfung ist die eigentliche
  Sicherheitsschicht.

---

## Edge Cases

1. Was passiert bei: Admin versucht, sich selbst zu deaktivieren
   Erwartetes Verhalten: Dropdown für den eigenen Eintrag ist gesperrt,
   Fehlermeldung „Du kannst dein eigenes Konto nicht deaktivieren".
   Separater Button „Neuen Admin ernennen" ist sichtbar.

2. Was passiert bei: Neuer User wird mit bereits vorhandener E-Mail angelegt
   Erwartetes Verhalten: Inline-Fehlermeldung „Diese E-Mail ist bereits
   vergeben", Formular bleibt offen, kein Eintrag wird erstellt.

3. Was passiert bei: Nicht-Admin ruft /admin/users direkt über die URL auf
   Erwartetes Verhalten: Nicht eingeloggt → Weiterleitung zur Login-Seite.
   Eingeloggt aber kein Admin → Weiterleitung zum Dashboard mit der
   Meldung „Kein Zugriff".

4. Was passiert bei: Pflichtfeld „Eintrittsdatum" wird leer gelassen
   Erwartetes Verhalten: Inline-Fehler „Eintrittsdatum ist erforderlich",
   Formular wird nicht gespeichert.

5. Was passiert bei: Austrittsdatum liegt vor dem Eintrittsdatum
   Erwartetes Verhalten: Inline-Fehler „Austrittsdatum muss nach dem
   Eintrittsdatum liegen".

---

## Akzeptanzkriterien

- [ ] Nav-Reiter „Benutzerverwaltung" ist nur sichtbar wenn `role === 'admin'`
- [ ] Die Route /admin/users ist nicht über die URL erreichbar für
      Nicht-Admins (serverseitige Prüfung)
- [ ] Nicht eingeloggte User werden zur Login-Seite weitergeleitet
- [ ] Eingeloggte Nicht-Admins werden zum Dashboard weitergeleitet
      mit Meldung „Kein Zugriff"
- [ ] Tabelle zeigt alle User mit Spalten: ID, Vor-/Nachname, E-Mail,
      Rolle, Abteilung, Status, Eintrittsdatum
- [ ] Tabelle ist sortierbar nach Name, Rolle und Status
- [ ] „Neuer User"-Button öffnet Formular-Modal auf derselben Seite
- [ ] Alle Pflichtfelder werden vor dem Speichern validiert (Inline-Fehler)
- [ ] Doppelte E-Mail zeigt Fehlermeldung, Formular bleibt offen
- [ ] Nach erfolgreichem Anlegen: Modal schließt sich, Erfolgs-Meldung
      erscheint, User taucht sofort in der Tabelle auf
- [ ] Status-Dropdown in der Tabellenzeile speichert sofort in Supabase
- [ ] Admin kann sich selbst nicht deaktivieren (gesperrt + Fehlermeldung)
- [ ] Button „Neuen Admin ernennen" ist vorhanden und löst
      Approval-Workflow aus
- [ ] Berechtigungen pro Bereich (lesen/bearbeiten/löschen) sind im
      Bearbeitungs-Formular einzeln setzbar und werden in JSONB gespeichert
- [ ] Austrittsdatum vor Eintrittsdatum zeigt Validierungsfehler
- [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
