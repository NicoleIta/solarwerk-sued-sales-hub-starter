# Spec: Login-Seite Solarwerk Süd

## Zweck

Mitarbeiterinnen und Mitarbeiter von Solarwerk Süd sollen sich mit ihrem Namen oder ihrer E-Mail-Adresse und einem persönlichen Passwort am Sales-Hub anmelden können. Die Login-Seite schützt den Zugang und zeigt nach erfolgreichem Login den Namen des Nutzers in der Navigation an.

---

## Inputs

| Feld | Typ | Pflicht | Hinweis |
|---|---|---|---|
| Benutzername oder E-Mail | `text` | Ja | Akzeptiert beides (z. B. "Nicole Ita" oder "nicole@solarwerk-sued.de") |
| Passwort | `password` / `text` | Ja | Toggle über Auge-Icon — macht die Eingabe lesbar |

---

## Verhalten

1. Der Nutzer öffnet `/login`.
2. Er gibt seinen Namen (z. B. `Nicole Ita`) oder seine E-Mail (z. B. `nicole@solarwerk-sued.de`) in das erste Feld ein.
3. Er gibt sein Passwort ein. Per Klick auf das Auge-Icon rechts im Passwortfeld kann er die Eingabe sichtbar machen.
4. Er klickt auf **Einloggen**.
5. Die App prüft die Eingabe gegen die Nutzerliste (`lib/users.ts`):
   - **Treffer:** Der User wird als JSON in `localStorage` gespeichert. Weiterleitung zu `/` (Dashboard).
   - **Kein Treffer:** Fehlermeldung `"Benutzername oder Passwort falsch."` erscheint unterhalb des Buttons. Kein Redirect.
6. In der Navigation erscheint nach dem Login: `Eingeloggt als [Name]` sowie ein **Abmelden**-Button.
7. Klick auf **Abmelden** → localStorage wird geleert, Weiterleitung zu `/login`.

---

## Architektur-Entscheidungen

### Entscheidung 1: Nutzerdaten in TypeScript-Datei

- **Gewählt:** *Nutzerliste als `NUTZER`-Array in `lib/users.ts` mit einer `verifyNutzer()`-Funktion*
- **Alternative wäre:** *Nutzerdaten in einer CSV-Datei speichern (analog zu Kunden/Pipeline)*
- **Warum diese:** *TypeScript-Datei ist direkt typsicher und braucht kein CSV-Parsing. Für ein Starter-Projekt ohne echte Datenbank ist das die sauberste und wartbarste Lösung.*

### Entscheidung 2: Session über localStorage

- **Gewählt:** *Eingeloggten User als JSON-String in `localStorage` unter dem Key `currentUser` speichern*
- **Alternative wäre:** *Cookies oder NextAuth.js mit Server-Sessions*
- **Warum diese:** *Das Projekt hat keine Server-Session-Infrastruktur. `localStorage` ist vollständig client-seitig, erfordert keine API-Route und passt zum Starter-Ansatz des Projekts.*

---

## Edge Cases

1. **Was passiert bei:** *Nutzer gibt nur E-Mail ohne Passwort ein und klickt Einloggen*
   **Erwartetes Verhalten:** *HTML-Validierung greift (`required`-Attribut), Formular wird nicht abgeschickt, Browser zeigt Hinweis "Bitte füllen Sie dieses Feld aus."*

2. **Was passiert bei:** *Nutzer gibt korrekte E-Mail, aber falsches Passwort ein*
   **Erwartetes Verhalten:** *Fehlermeldung "Benutzername oder Passwort falsch." erscheint unter dem Button. Kein Hinweis darauf, ob die E-Mail korrekt war (Security-Prinzip: keine detaillierten Hinweise).*

3. **Was passiert bei:** *Nutzer gibt seinen vollständigen Namen mit Leerzeichen ein (z. B. "Nicole Ita")*
   **Erwartetes Verhalten:** *Login funktioniert, da der Name exakt (nach `.trim()`) mit dem Eintrag in der Nutzerliste verglichen wird.*

---

## Akzeptanzkriterien

Wie weiß ich, dass das Feature funktioniert? Jeder Punkt muss live testbar sein.

- [ ] Login-Seite unter `/login` erreichbar und vollständig auf Deutsch
- [ ] Eingabefeld "Benutzername oder E-Mail" akzeptiert sowohl `Nicole Ita` als auch `nicole@solarwerk-sued.de`
- [ ] Auge-Icon neben dem Passwortfeld ist klickbar und macht die Eingabe lesbar (`type="text"` statt `type="password"`)
- [ ] Login mit korrekten Demo-Daten (z. B. `felix@solarwerk-sued.de` / `energie123`) → Weiterleitung zu `/`
- [ ] Navigation zeigt nach Login "Eingeloggt als Felix Berger" und einen Abmelden-Button
- [ ] Login mit falschem Passwort → Fehlermeldung sichtbar, kein Redirect
- [ ] Leere Felder beim Abschicken → Browser-Validierung verhindert Submit
- [ ] Abmelden-Button löscht Session und leitet zu `/login` zurück
- [ ] Dark Mode funktioniert auf der Login-Seite (dunkler Hintergrund, helle Texte, rotes Fehlerfeld im Dark-Mode-Stil)

---

## Demo-Zugangsdaten (zum Testen)

| Name | E-Mail | Passwort |
|---|---|---|
| Nicole Ita | nicole@solarwerk-sued.de | solar2024 |
| Felix Berger | felix@solarwerk-sued.de | energie123 |
| Markus Klein | markus@solarwerk-sued.de | sonne456 |
