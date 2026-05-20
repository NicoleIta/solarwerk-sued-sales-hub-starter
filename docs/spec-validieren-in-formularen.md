# Spec: Validieren in Formularen

## Zweck
*[Projektspezifisch ausfüllen — beim jeweiligen Projekt gemeinsam festlegen.]*

---

## Inputs
- Textfelder (z.B. Name, Firma) — Typ: `string`, Pflichtfeld, Min/Max-Länge
- E-Mail-Felder — Typ: `string`, Format-Validierung (`@` + Domain), Pflichtfeld
- Passwort-Felder — Typ: `string`, Mindestlänge + Komplexitätsprüfung
- Zahlen / Datumsfelder — Typ: `number` / `Date`, Wertebereich, gültiges Format
- Validierungsregeln: *[Quelle projektspezifisch klären: Frontend hardcoded oder Backend-Antwort]*

---

## Verhalten
1. Nutzer füllt ein Feld aus und verlässt es (on-blur)
2. Das Feld wird sofort geprüft; bei Fehler erscheint ein Inline-Fehlertext direkt unter dem Feld
3. Nutzer korrigiert das Feld — Fehlertext verschwindet sobald der Wert gültig ist
4. Nutzer klickt Submit — alle Felder werden nochmals vollständig geprüft
5. Hat ein oder mehrere Felder Fehler: Submit-Aktion wird blockiert, alle Fehler inline sichtbar
6. Sind alle Felder gültig: Submit-Aktion wird ausgeführt

---

## Architektur-Entscheidungen

### Entscheidung 1: Eigene Validierungsfunktionen ohne externe Bibliothek
- **Gewählt:** Reine JS/TS-Funktionen für jede Validierungsregel (z.B. `isValidEmail()`, `isNotEmpty()`, `isStrongPassword()`)
- **Alternative wäre:** React Hook Form + Zod (externer Package-Overhead)
- **Warum diese:** Für dieses Projekt kein externes Package gewünscht — maximale Kontrolle, kein Versionierungsrisiko, volle Lesbarkeit ohne Framework-Kenntnisse.

---

## Edge Cases

1. **Was passiert bei:** Submit mit nur Leerzeichen im Pflichtfeld (z.B. Name = `"   "`)
   **Erwartetes Verhalten:** Feld gilt als leer, Inline-Fehler "Pflichtfeld darf nicht leer sein" erscheint

2. **Was passiert bei:** Nutzer korrigiert ein Feld und löscht den Inhalt danach wieder komplett
   **Erwartetes Verhalten:** Fehler bleibt sichtbar (einmal ausgelöst = bleibt aktiv bis valider Wert eingegeben wird)

3. **Was passiert bei:** Ungültiges E-Mail-Format (z.B. `test@` ohne Domain)
   **Erwartetes Verhalten:** On-blur erscheint Inline-Fehler "Ungültige E-Mail-Adresse"

4. **Was passiert bei:** Passwort nicht komplex genug (z.B. `12345`)
   **Erwartetes Verhalten:** Inline-Fehler listet konkret was fehlt (z.B. "Mindestens 8 Zeichen, 1 Großbuchstabe erforderlich")

---

## Akzeptanzkriterien
- [ ] Fehler erscheinen direkt nach Verlassen (on-blur) eines ungültigen Feldes
- [ ] Submit-Button löst keine Aktion aus, solange Fehler vorhanden sind
- [ ] Fehlertext verschwindet automatisch, sobald der Nutzer einen gültigen Wert eingibt
- [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
