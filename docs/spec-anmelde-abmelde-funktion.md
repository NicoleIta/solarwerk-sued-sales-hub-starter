# Spec: Anmelde- und Abmelde-Funktion

Diese Vorlage füllt Ihr aus, BEVOR Ihr Claude Code zum Bauen prompted.
Wer ohne Spec prompted, baut blind. Wer mit Spec prompted, baut gezielt.

---

## Zweck

Das bestehende Login-Formular und die Navigation werden auf Supabase umgestellt: `signInWithPassword` ersetzt `verifyNutzer`, `signOut` ersetzt den localStorage-Logout.

---

## Inputs

- E-Mail (String) — Nutzer-Eingabe im Login-Formular
- Passwort (String) — Nutzer-Eingabe im Login-Formular
- Supabase Client aus `lib/supabase.ts` — wird importiert (aus Spec 01)
- Klick auf Abmelden-Button in `components/Navigation.tsx`

---

## Verhalten

1. Nutzer gibt E-Mail + Passwort ein und klickt Einloggen
2. `signInWithPassword` wird aufgerufen
3. Bei Erfolg: Redirect zu `/`
4. Bei Fehler: Fehlermeldung im Formular anzeigen, kein Redirect
5. Nutzer klickt Abmelden in der Navigation
6. `supabase.auth.signOut()` wird aufgerufen
7. Redirect zu `/login`, Navigation zeigt Anmelden-Link

---

## Architektur-Entscheidungen

### Entscheidung 1: Session über supabase.auth.getSession()

- **Gewählt:** `getSession()` im `useEffect` der Navigation — ersetzt den bisherigen `localStorage`-Ansatz
- **Alternative wäre:** `localStorage` weiterhin als Session-Quelle nutzen
- **Warum diese:** Eine einzige Quelle für Session-State vermeidet Inkonsistenz zwischen Supabase und lokalem Storage.

### Entscheidung 2: lib/users.ts behalten, aber nicht mehr nutzen

- **Gewählt:** `lib/users.ts` bleibt im Repo, wird aber aus `app/login/page.tsx` entfernt
- **Alternative wäre:** Komplettes Löschen von `lib/users.ts`
- **Warum diese:** Das Repo ist ein Lehr-Repo, das Artefakt zeigt den Vorher-Zustand — kein Breaking Change.

---

## Edge Cases

1. **Was passiert bei:** Login mit falschem Passwort
   **Erwartetes Verhalten:** Fehlermeldung im Formular sichtbar, kein Redirect

2. **Was passiert bei:** Login mit leerem E-Mail-Feld
   **Erwartetes Verhalten:** Formular-Validierung greift, Supabase wird nicht aufgerufen

3. **Was passiert bei:** Abmelden während Netzwerk-Ausfall
   **Erwartetes Verhalten:** signOut-Fehler wird ignoriert, Nutzer wird trotzdem zu /login weitergeleitet

4. **Was passiert bei:** Doppelter Klick auf Einloggen (Mehrfach-Submit)
   **Erwartetes Verhalten:** Button ist während Loading `disabled`, zweiter Klick hat keinen Effekt

---

## Akzeptanzkriterien

- [ ] Login mit gültigen Daten → Redirect zu `/`
- [ ] Login mit falschen Daten → Fehlermeldung sichtbar, kein Redirect
- [ ] Navigation zeigt "Eingeloggt als [Name]" nach Login
- [ ] Abmelden → Redirect zu `/login`, Navigation zeigt Anmelden-Link
- [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
