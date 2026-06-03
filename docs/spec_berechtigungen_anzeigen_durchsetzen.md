# Spec: Berechtigungen anzeigen und durchsetzen

Diese Spec wurde vor der Implementierung erstellt.
Merksatz: Wer ohne Spec prompted, baut blind. Wer mit Spec prompted, baut gezielt.

---

## Zweck
Die im Admin-Bereich pro User gespeicherten Berechtigungen sollen erstens sichtbar in der Benutzerverwaltungsliste erscheinen und zweitens beim Einloggen aktiv durchgesetzt werden — durch Ausblenden von Nav-Reitern ohne Lesezugriff und Verstecken des Löschen-Buttons ohne Lösch-Berechtigung.

---

## Inputs
- `permissions`-JSON aus der `profiles`-Tabelle in Supabase (Format: `{ kunden: { read, edit, delete }, pipeline: { read, edit, delete }, berichte: { read, edit, delete }, benutzerverwaltung: { read, edit, delete } }`)
- Eingeloggter User inkl. Rolle (aus Supabase Auth + profiles)
- Bestehende `DEFAULT_PERMISSIONS` als Fallback (nur Lesen aktiv, kein Bearbeiten/Löschen)
- Klick-Events auf Löschen-Buttons (Kunden-Detailseite, Pipeline-Detailseite, Benutzerverwaltung)

---

## Verhalten
1. `app/layout.tsx` lädt beim Rendern die `permissions` des eingeloggten Users serverseitig aus Supabase und übergibt sie als prop an `nav.tsx`
2. `nav.tsx` blendet jeden Reiter aus, für den `permissions[bereich].read === false` gilt — Admin (Rolle `admin`) sieht immer alle Reiter
3. In der Benutzerverwaltungsliste erscheinen unter jedem Namen kleine Chips/Badges, die aktive Berechtigungen kompakt anzeigen (z. B. „Kunden: L B", „Pipeline: L")
4. Auf der Kunden-Detailseite, Pipeline-Detailseite und in der Benutzerverwaltung wird der Löschen-Button nur gerendert, wenn `permissions[bereich].delete === true` (Admin ausgenommen)
5. Ruft ein User direkt eine gesperrte URL auf (z. B. `/pipeline` ohne read-Recht), wird er auf `/` weitergeleitet und ein Fehler-Banner „Kein Zugriff auf diesen Bereich" erscheint

---

## Architektur-Entscheidungen

### Entscheidung 1: Berechtigungsprüfung zentral in `app/layout.tsx`
- **Gewählt:** `layout.tsx` liest permissions einmalig serverseitig und gibt sie als prop weiter
- **Alternative wäre:** Jede Page prüft selbst, oder Middleware.ts am Edge
- **Warum diese:** Einmaliger Datenbankaufruf pro Request, kein duplizierter Prüf-Code, kein Client-State nötig

### Entscheidung 2: Admin-Rolle überspringt alle Checks
- **Gewählt:** Wenn `role === "admin"`, werden sämtliche Berechtigungsprüfungen übersprungen
- **Alternative wäre:** Admin benötigt ebenfalls explizite Permissions
- **Warum diese:** Admin kann sich sonst versehentlich aussperren; die Rolle ist bereits durch die bestehende Admin-Seite geschützt

---

## Edge Cases

1. **Was passiert bei:** Direktaufruf von `/pipeline` ohne read-Berechtigung
   **Erwartetes Verhalten:** Redirect auf `/`, Banner „Kein Zugriff auf diesen Bereich" erscheint oben

2. **Was passiert bei:** User-Profil hat kein `permissions`-Feld (z. B. alter Datensatz)
   **Erwartetes Verhalten:** Fallback auf `DEFAULT_PERMISSIONS` — nur Lesen aktiv, kein Bearbeiten/Löschen

3. **Was passiert bei:** Admin entzieht einem User während aktiver Session die Pipeline-Berechtigung
   **Erwartetes Verhalten:** Beim nächsten Seitenaufruf greift die neue Regel — Reiter und Buttons verschwinden ohne erneuten Login

---

## Akzeptanzkriterien
- [ ] Berechtigungs-Chips sind in der Benutzerverwaltung unter jedem Namen mit Vor-/Nachname sichtbar
- [ ] User ohne `read`-Recht auf „Pipeline" sieht den Pipeline-Reiter nicht in der Navigation
- [ ] User ohne `delete`-Recht sieht den Löschen-Button auf Kunden- und Pipeline-Detailseite nicht
- [ ] Direktaufruf einer gesperrten URL leitet auf Dashboard mit Fehler-Banner um
- [ ] Admin (Rolle `admin`) sieht immer alle Reiter und alle Buttons, unabhängig von permissions
- [ ] Profil ohne permissions-Feld fällt korrekt auf DEFAULT_PERMISSIONS zurück
- [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
