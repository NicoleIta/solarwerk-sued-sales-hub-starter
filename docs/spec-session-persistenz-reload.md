# Spec: Session-Persistenz nach Reload

Diese Vorlage füllt Ihr aus, BEVOR Ihr Claude Code zum Bauen prompted.
Wer ohne Spec prompted, baut blind. Wer mit Spec prompted, baut gezielt.

---

## Zweck

Wenn die Supabase-Session abläuft, wird der Nutzer automatisch ausgeloggt und zu `/login` weitergeleitet. Ein aktiver Nutzer bleibt während der Session-Dauer eingeloggt — nach Ablauf muss er sich neu anmelden.

---

## Inputs

- Supabase-Session-Cookie mit Ablaufzeit (pro Nutzer, vom Browser gespeichert)
- Session-Dauer-Konfiguration im Supabase Dashboard (JWT Expiry, Standard 1 Stunde)
- Middleware aus Spec 03 — prüft bei jedem Seitenaufruf die Session
- Browser-Reload-Event — triggert die Middleware erneut
- Mehrere gleichzeitige Nutzer — jede Session ist nutzerspezifisch, Supabase trennt automatisch

---

## Verhalten

1. Nutzer lädt die Seite neu (Reload)
2. Middleware prüft den Supabase-Session-Cookie
3. Session gültig → Seite wird normal geladen, Nutzer bleibt eingeloggt
4. Session abgelaufen → Middleware erkennt ungültigen Token, Redirect zu `/login`
5. Nutzer muss sich erneut einloggen

---

## Architektur-Entscheidungen

### Entscheidung 1: Kein Silent Refresh

- **Gewählt:** Nach Ablauf des Access-Tokens muss sich der Nutzer neu einloggen — kein automatischer Token-Refresh
- **Alternative wäre:** `onAuthStateChange` + automatische Token-Erneuerung via Refresh-Token
- **Warum diese:** Einfacher, sicherer, kein zusätzlicher Code — bewusste Entscheidung für expliziten Logout statt dauerhafter Session.

### Entscheidung 2: Session-Dauer nur im Supabase Dashboard konfiguriert

- **Gewählt:** JWT Expiry unter Authentication > Settings im Supabase Dashboard — kein Code-Eingriff nötig
- **Alternative wäre:** Custom-Optionen im `createClient`-Aufruf im Code
- **Warum diese:** Konfiguration gehört ins Dashboard, nicht in den Code — einfacher änderbar ohne neues Deployment.

---

## Edge Cases

1. **Was passiert bei:** Reload direkt nach Login
   **Erwartetes Verhalten:** Session ist frisch und gültig, Nutzer bleibt eingeloggt, kein Redirect

2. **Was passiert bei:** Reload nach Session-Ablauf
   **Erwartetes Verhalten:** Abgelaufener Token wird erkannt, Redirect zu `/login`, Nutzer muss sich neu einloggen

3. **Was passiert bei:** Zwei verschiedene Nutzer in separaten Browser-Tabs
   **Erwartetes Verhalten:** Sessions überschneiden sich nicht, jeder Nutzer sieht nur seine eigene Session

4. **Was passiert bei:** Nutzer löscht manuell den Cookie im Browser
   **Erwartetes Verhalten:** Nächster Seitenaufruf leitet zu `/login` weiter, kein Zugang ohne Cookie

---

## Akzeptanzkriterien

- [ ] Nach Login + Reload: Nutzer ist weiterhin eingeloggt
- [ ] Nach Session-Ablauf + Reload: Redirect zu `/login`
- [ ] Zwei Nutzer in separaten Tabs: keine Session-Überschneidung
- [ ] Manuell gelöschter Cookie: Redirect zu `/login` beim nächsten Aufruf
- [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
