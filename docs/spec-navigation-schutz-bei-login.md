# Spec: Navigation-Schutz bei Login

---

## Zweck
Die Navigations-Reiter (Dashboard, Pipeline, Berichte, Neuer Kunde) sollen für nicht eingeloggte Nutzer vollständig ausgeblendet und gesperrt sein, damit kein unautorisierter Zugriff auf geschützte Bereiche möglich ist. Erst nach erfolgreichem Login werden die Reiter sichtbar und die Bereiche zugänglich — direkter URL-Aufruf ohne Login leitet auf die Login-Seite um.

---

## Inputs
- **Login-Status** (boolean): Gibt an ob Nutzer eingeloggt ist — Speicherort & Methode wird im Projekt entschieden
- **Nutzer-Eingabe**: E-Mail + Passwort (ein einziger Login, keine Rollen)
- **Geschützte Routen**: Dashboard, Pipeline, Berichte, Neuer Kunde

---

## Verhalten
1. Nutzer öffnet die App → Navigation zeigt nur die Login-Seite (keine Reiter sichtbar)
2. Nutzer versucht eine geschützte URL direkt aufzurufen (z.B. `/dashboard`) → Redirect zur Login-Seite
3. Nutzer gibt E-Mail + Passwort ein und klickt "Anmelden"
4. Login erfolgreich → Reiter (Dashboard, Pipeline, Berichte, Neuer Kunde) erscheinen in der Navigation
5. App leitet automatisch zum Dashboard weiter (immer, unabhängig von ursprünglich aufgerufener URL)
6. Nutzer klickt "Abmelden" (Button oben rechts in der Navigation) → Reiter verschwinden sofort, Redirect zur Login-Seite

---

## Architektur-Entscheidungen

### Entscheidung 1: Reiter ausblenden via Conditional Rendering
- **Gewählt:** Reiter werden nur gerendert wenn `isAuthenticated === true` — sie existieren gar nicht im DOM
- **Alternative wäre:** CSS `display: none` auf immer vorhandene Elemente
- **Warum diese:** Sicherer, da die Reiter nicht im HTML-Quellcode auftauchen und nicht per Browser-Konsole sichtbar gemacht werden können.

### Entscheidung 2: URL-Schutz via Protected Route (Frontend-Guard)
- **Gewählt:** Jede geschützte Seite prüft beim Laden den Login-Status und leitet bei fehlendem Login zur Login-Seite um
- **Alternative wäre:** Server-seitige Middleware prüft Session vor jeder Antwort
- **Warum diese:** Für den Anfang reicht Frontend-Schutz; Server-Middleware ist ein späteres Upgrade wenn höhere Sicherheitsanforderungen entstehen.

---

## Edge Cases

1. **Was passiert bei:** Falsche E-Mail oder falsches Passwort beim Login
   **Erwartetes Verhalten:** Fehlermeldung erscheint ("E-Mail oder Passwort falsch"), Reiter bleiben unsichtbar, Formular bleibt offen

2. **Was passiert bei:** Session läuft ab während Nutzer eingeloggt ist und er klickt auf einen Reiter
   **Erwartetes Verhalten:** Redirect zur Login-Seite, Reiter verschwinden, Meldung "Sitzung abgelaufen, bitte erneut anmelden"

3. **Was passiert bei:** Nicht eingeloggter Nutzer ruft geschützte URL direkt auf (`/dashboard`, `/pipeline`, `/berichte`, `/neuer-kunde`)
   **Erwartetes Verhalten:** Redirect zur Login-Seite, kein Inhalt der geschützten Seite wird angezeigt

4. **Was passiert bei:** Klick auf "Anmelden" mit leerem E-Mail- oder Passwort-Feld
   **Erwartetes Verhalten:** Inline-Validierungsfehler erscheint direkt am leeren Feld ("Pflichtfeld"), kein Login-Request wird gesendet, Reiter bleiben unsichtbar

---

## Akzeptanzkriterien
- [ ] Beim Öffnen der App ohne Login sind die Reiter Dashboard, Pipeline, Berichte, Neuer Kunde nicht sichtbar
- [ ] Die Reiter sind auch nicht im HTML-Quellcode zu finden (DevTools → Elements)
- [ ] Direkter Aufruf von `/dashboard` ohne Login → Redirect zur Login-Seite
- [ ] Direkter Aufruf von `/pipeline`, `/berichte`, `/neuer-kunde` ohne Login → Redirect zur Login-Seite
- [ ] Nach erfolgreichem Login erscheinen alle vier Reiter in der Navigation
- [ ] Nach dem Login landet der Nutzer immer auf dem Dashboard
- [ ] Der "Abmelden"-Button ist oben rechts in der Navigation sichtbar (nur wenn eingeloggt)
- [ ] Klick auf "Abmelden" → Reiter verschwinden sofort, Redirect zur Login-Seite
- [ ] Alle 4 Edge Cases aus dem Abschnitt oben sind getestet
