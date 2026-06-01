# Spec: Supabase Auth: E-Mail + Passwort

Diese Vorlage füllt Ihr aus, BEVOR Ihr Claude Code zum Bauen prompted.
Wer ohne Spec prompted, baut blind. Wer mit Spec prompted, baut gezielt.

---

## Zweck

Das Projekt wird mit Supabase verbunden und E-Mail/Passwort als Login-Methode aktiviert, damit echte Authentifizierung statt Dummy-Login genutzt wird.

---

## Inputs

- `NEXT_PUBLIC_SUPABASE_URL` — Projekt-URL, aus Supabase Dashboard kopiert (String)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — öffentlicher API-Schlüssel, aus Dashboard kopiert (String)
- `.env.local` — Datei im Projekt-Root mit beiden Werten
- `lib/supabase.ts` — neues Modul mit `createClient`
- Testnutzer (E-Mail + Passwort) — manuell im Supabase Dashboard angelegt

---

## Verhalten

1. In Supabase Dashboard unter Authentication > Providers E-Mail/Passwort aktivieren
2. `.env.local` im Projekt-Root anlegen mit URL und Key
3. `lib/supabase.ts` erstellen: `createClient` mit Env-Variablen exportieren
4. Testnutzer manuell im Dashboard anlegen (E-Mail + Passwort, Status "Confirmed")
5. Verbindung prüfen: `signInWithPassword` einmalig testen

---

## Architektur-Entscheidungen

### Entscheidung 1: Supabase Client als Singleton in lib/supabase.ts

- **Gewählt:** `lib/supabase.ts` mit einmaligem `createClient`, nur Browser-Client (anon key)
- **Alternative wäre:** Client direkt in der Login-Komponente erstellen
- **Warum diese:** Passt zur bestehenden `lib/`-Konvention (`data.ts`, `users.ts`) und verhindert mehrfache Client-Instanzen bei jedem Render.

---

## Edge Cases

1. **Was passiert bei:** `.env.local` fehlt oder Werte sind leer
   **Erwartetes Verhalten:** App startet, Supabase-Verbindung schlägt lautlos fehl — im Terminal oder Console sichtbar

2. **Was passiert bei:** Falscher Anon Key eingetragen
   **Erwartetes Verhalten:** `createClient` erstellt den Client, aber alle Auth-Aufrufe geben 401 zurück

3. **Was passiert bei:** E-Mail/Passwort-Provider in Supabase nicht aktiviert
   **Erwartetes Verhalten:** `signInWithPassword` gibt Fehler zurück, obwohl Client korrekt konfiguriert ist

4. **Was passiert bei:** Testnutzer wurde nicht angelegt
   **Erwartetes Verhalten:** Login schlägt mit "Invalid credentials" fehl

---

## Akzeptanzkriterien

- [ ] `lib/supabase.ts` existiert und exportiert den Supabase Client
- [ ] `.env.local` ist angelegt, App startet ohne Fehler
- [ ] Testnutzer in Supabase Dashboard vorhanden (Status "Confirmed")
- [ ] `signInWithPassword` gibt kein Error-Objekt zurück (manueller Test)
- [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
