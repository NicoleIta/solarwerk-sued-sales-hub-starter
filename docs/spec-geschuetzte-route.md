# Spec: Geschützte Route

Diese Vorlage füllt Ihr aus, BEVOR Ihr Claude Code zum Bauen prompted.
Wer ohne Spec prompted, baut blind. Wer mit Spec prompted, baut gezielt.

---

## Zweck

Die bestehende `middleware.ts` prüft aktuell einen einfachen Cookie `session=1`. Sie wird so umgestellt, dass sie die echte Supabase-Session prüft — nicht eingeloggte Nutzer werden zu `/login` weitergeleitet.

---

## Inputs

- Supabase-Session-Cookie (vom Browser automatisch mitgeschickt nach erfolgreichem Login)
- Angeforderter Pfad (`pathname`) — z.B. `/`, `/pipeline`, `/kunden`
- Liste der geschützten Routen: alle Routen außer `/login`
- Liste der öffentlichen Routen: nur `/login`
- Session-Dauer — konfiguriert im Supabase Dashboard (Authentication > Settings); Standard: Access-Token 1 Stunde, Refresh-Token langlebig; kein Code-Eingriff nötig

---

## Verhalten

1. Nutzer ruft eine Route auf
2. Middleware liest die Supabase-Session via `@supabase/ssr`
3. Kein gültiger Session-Cookie vorhanden → Redirect zu `/login`
4. Session vorhanden, angefragte Route ist `/login` → Redirect zu `/`
5. Session vorhanden, angefragte Route ist geschützt → Zugang gewährt, Seite wird geladen

---

## Architektur-Entscheidungen

### Entscheidung 1: Session-Prüfung via @supabase/ssr

- **Gewählt:** `@supabase/ssr` Paket für Middleware-kompatible Session-Prüfung
- **Alternative wäre:** Cookie-Namen manuell prüfen (`request.cookies.get('sb-...')`)
- **Warum diese:** Das offizielle SSR-Paket ist zukunftssicher und korrekt — manuelle Cookie-Prüfung bricht bei Supabase-Updates ohne Warnung.

### Entscheidung 2: Alter Cookie-Check komplett ersetzen

- **Gewählt:** `session=1` Cookie-Check wird entfernt, nur noch Supabase-Session wird geprüft
- **Alternative wäre:** Beide Checks parallel laufen lassen als Übergangs-Fallback
- **Warum diese:** Zwei Auth-Systeme gleichzeitig sind fehleranfällig und schwer testbar — ein klarer Schnitt ist wartbarer.

---

## Edge Cases

1. **Was passiert bei:** Direktaufruf von `/` ohne eingeloggt zu sein
   **Erwartetes Verhalten:** Middleware leitet sofort zu `/login` um, Dashboard wird nicht angezeigt

2. **Was passiert bei:** Session-Cookie abgelaufen (Supabase Token expired)
   **Erwartetes Verhalten:** Nutzer gilt als nicht eingeloggt, Redirect zu `/login`

3. **Was passiert bei:** Eingeloggter Nutzer ruft `/login` direkt auf
   **Erwartetes Verhalten:** Redirect zu `/`, Login-Seite wird nicht angezeigt

4. **Was passiert bei:** Nicht existierende Route ohne Session (`/xyz`)
   **Erwartetes Verhalten:** Zuerst Redirect zu `/login`, nach Login erscheint die 404-Seite

---

## Akzeptanzkriterien

- [ ] Nicht eingeloggter Nutzer wird bei `/` und `/pipeline` zu `/login` umgeleitet
- [ ] Eingeloggter Nutzer sieht das Dashboard ohne Redirect
- [ ] Eingeloggter Nutzer wird von `/login` zu `/` weitergeleitet
- [ ] Nach Browser-Reload bleibt Nutzer eingeloggt (Supabase-Session persistiert)
- [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
