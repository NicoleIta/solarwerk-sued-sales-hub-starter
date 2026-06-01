# Spec: Kunden ändern und löschen

Diese Vorlage füllt Ihr aus, BEVOR Ihr Claude Code zum Bauen prompted.
Wer ohne Spec prompted, baut blind. Wer mit Spec prompted, baut gezielt.

---

## Zweck
Die Kundendetail-Page bekommt zwei neue Funktionen: einen Edit-Modus zum Ändern aller
Kundenfelder und einen Löschen-Button mit Bestätigungsdialog. Beide Aktionen werden über
den Supabase-Client an die Datenbank weitergegeben und bleiben nach einem Reload sichtbar.

---

## Inputs
- Bestehende Kundendaten aus der Supabase-Tabelle `kunden`: id, firma, ansprechpartner,
  branche, anlagengroesse_kwp, status, letzter_kontakt, telefon, email, notiz
- Editierbare Felder: firma (string), ansprechpartner (string), telefon (string),
  email (string), branche (string), anlagengroesse_kwp (number),
  status (enum: aktiv | in_wartung | beschwerde), notiz (string)
- Kunden-ID aus dem URL-Parameter `/kunden/[id]` — wird für UPDATE und DELETE benötigt
- Explizite Nutzer-Bestätigung im Confirm-Dialog: "Wirklich löschen?" — boolean (ja/nein)

---

## Verhalten

### Bearbeiten
1. Nutzer öffnet Kundendetail-Page (`/kunden/[id]`)
2. Nutzer klickt "Bearbeiten" — alle Felder wechseln von Nur-Lese-Ansicht zu Inputs
3. Nutzer ändert ein oder mehrere Felder
4. Nutzer klickt "Speichern" — Loading-Spinner erscheint, Button wird deaktiviert
5. UPDATE wird via Supabase-Client an Tabelle `kunden` gesendet (WHERE id = ...)
6. Bei Erfolg: Edit-Modus schließt, Seite zeigt die aktualisierten Werte
7. Bei Fehler: Fehlermeldung erscheint, Edit-Modus bleibt offen, Daten nicht überschrieben
8. Klick auf "Abbrechen": Edit-Modus schließt ohne Speichern, Originalwerte wieder sichtbar

### Löschen
9. Nutzer klickt "Löschen"
10. Browser-Confirm-Dialog öffnet: "Wirklich löschen?"
11. Bei Abbruch: Dialog schließt, Seite bleibt unverändert
12. Bei Bestätigung: Loading-Spinner erscheint, Button wird deaktiviert
13. DELETE wird via Supabase-Client an Tabelle `kunden` gesendet (WHERE id = ...)
14. Bei Erfolg: Redirect zu `/dashboard`
15. Bei Fehler: Fehlermeldung erscheint auf der Seite

---

## Architektur-Entscheidungen

### Entscheidung 1: Supabase-Client direkt im Browser-Component
- Gewählt: Supabase-Client direkt in `kunde-detail-client.tsx` aufrufen
- Alternative wäre: Server-seitig via bestehende API-Route `/api/kunden/[id]`
- Warum diese: Kein unnötiger API-Route-Umweg, Supabase ist für direkten Browser-Zugriff
  ausgelegt. Passt zum bestehenden Client-Component-Muster des Repos.

### Entscheidung 2: Lokaler useState für Edit-State
- Gewählt: `useState<boolean>` für `isEditing` und `useState<Partial<Kunde>>` für
  `formData` direkt in `kunde-detail-client.tsx`
- Alternative wäre: Edit-Modus über URL-Parameter `?edit=true` steuern
- Warum diese: Der Edit-Modus überlebt den Page-Wechsel nicht und betrifft nur diese Seite.
  Lokaler State ist ausreichend und vermeidet unnötige URL-Komplexität.

---

## Edge Cases

1. Was passiert bei: Submit mit nur Leerzeichen im Firma-Feld
   Erwartetes Verhalten: Client-seitige Validierung zeigt Fehler, kein Supabase-Aufruf

2. Was passiert bei: Supabase-Fehler beim UPDATE (Netzwerk oder DB)
   Erwartetes Verhalten: Fehlermeldung erscheint auf der Seite, Edit-Modus bleibt offen,
   Originalwerte bleiben in Supabase unverändert

3. Was passiert bei: Nutzer bricht den Löschen-Dialog ab
   Erwartetes Verhalten: Dialog schließt, Seite bleibt unverändert, kein Supabase-Aufruf

4. Was passiert bei: URL mit nicht existierender Kunden-ID (z.B. /kunden/99999)
   Erwartetes Verhalten: 404-Seite oder Fehlermeldung, kein Crash

---

## Akzeptanzkriterien
- [ ]  Klick auf "Bearbeiten" macht alle Felder editierbar
- [ ]  Gespeicherte Änderungen sind nach Seiten-Reload noch sichtbar (Supabase-Persistenz)
- [ ]  Loading-Spinner ist während UPDATE und DELETE sichtbar, Buttons sind deaktiviert
- [ ]  Bei Supabase-Fehler erscheint eine Fehlermeldung auf der Seite
- [ ]  Nach erfolgreichem DELETE: Redirect zu /dashboard, Kunde nicht mehr in der Liste
- [ ]  "Abbrechen" schließt Edit-Modus ohne zu speichern, Originalwerte wieder sichtbar
- [ ]  Alle Edge Cases aus dem Abschnitt oben sind getestet
