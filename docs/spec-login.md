# Spec: [Aufgaben-Titel]

> Diese Vorlage füllt Ihr aus, BEVOR Ihr Claude Code zum Bauen prompted.
> Wer ohne Spec prompted, baut blind. Wer mit Spec prompted, baut gezielt.

---

## Zweck

Was soll dieses Feature tun? In zwei Sätzen — keine Bullets, kein Code.

*[Hier Deine zwei Sätze]*

---

## Inputs

Welche Daten kommen ins Feature rein? Welche Eingaben macht der Nutzer? Welche bestehenden Daten werden gelesen?

- *[Eingabe 1 mit Typ/Format]*
- *[Eingabe 2 mit Typ/Format]*
- *[Bestehende Datenquelle, falls relevant]*

---

## Verhalten

Was passiert mit den Inputs, Schritt für Schritt? Wann passiert was?

1. *[Schritt 1]*
2. *[Schritt 2]*
3. *[Schritt 3]*
4. *[...]*

---

## Architektur-Entscheidungen

Mindestens eine bewusste Entscheidung, mit Begründung in zwei Sätzen.

### Entscheidung 1: [Titel der Entscheidung]
- **Gewählt:** *[Was Du machst]*
- **Alternative wäre:** *[Was Du nicht machst]*
- **Warum diese:** *[Zwei Sätze Begründung]*

### Entscheidung 2: [Optional, falls zweite Entscheidung relevant]
- **Gewählt:** *[...]*
- **Alternative wäre:** *[...]*
- **Warum diese:** *[...]*

---

## Edge Cases

Mindestens **drei** konkrete Edge Cases. **Konkret heißt:** nicht "ungültige Eingabe", sondern z.B. "Submit mit nur Leerzeichen im Firmenfeld".

1. **Was passiert bei:** *[konkreter Edge Case]*
   **Erwartetes Verhalten:** *[was die App tun soll]*
2. **Was passiert bei:** *[konkreter Edge Case]*
   **Erwartetes Verhalten:** *[was die App tun soll]*
3. **Was passiert bei:** *[konkreter Edge Case]*
   **Erwartetes Verhalten:** *[was die App tun soll]*

---

## Akzeptanzkriterien

Wie weiß ich, dass das Feature funktioniert? Jeder Punkt muss live testbar sein.

- [ ] *[Testbares Kriterium 1]*
- [ ] *[Testbares Kriterium 2]*
- [ ] *[Testbares Kriterium 3]*
- [ ] *[...]*
- [ ] **Alle Edge Cases aus dem Abschnitt oben sind getestet**

---

## Beispiel: So sieht eine ausgefüllte Spec aus

Damit Ihr eine Vorstellung habt, wie das aussehen soll — hier eine vollständige Spec für ein Mini-Feature, das *nicht* zu Euren heutigen Aufgaben gehört.

---

# Spec: Login-Button mit Loading-State

## Zweck

Der Login-Button soll während der Anmelde-Prüfung sichtbar machen, dass etwas passiert, damit der Nutzer nicht mehrfach klickt. Aktuell sieht der Button beim Klicken gleich aus wie vorher, was zu doppelten Submits führt.

## Inputs

- Aktueller Zustand des Login-Formulars (E-Mail und Passwort eingegeben)
- Klick-Event auf den Login-Button
- Antwort vom Auth-Service (Erfolg oder Fehler, asynchron)

## Verhalten

1. Nutzer klickt auf Login-Button
2. Button wechselt sofort in den Loading-Zustand: Text "Anmelden..." statt "Anmelden", Button deaktiviert, kleiner Spinner links neben dem Text
3. Auth-Anfrage wird ausgelöst
4. Bei Erfolg: Redirect zum Dashboard (Button-State wird nicht zurückgesetzt, weil Page wechselt)
5. Bei Fehler: Button geht in Normalzustand zurück, Fehler-Meldung erscheint über dem Formular

## Architektur-Entscheidungen

### Entscheidung 1: Loading-State als lokaler useState im LoginForm

- **Gewählt:** `useState<boolean>` für `isLoading` direkt in der LoginForm-Komponente
- **Alternative wäre:** Globaler Loading-State in einem Auth-Context
- **Warum diese:** Der Loading-Zustand betrifft nur das Login-Formular und überlebt den Page-Wechsel nicht. Lokaler State ist hier ausreichend und einfacher.

### Entscheidung 2: Button-Deaktivierung über `disabled`-Attribut, nicht über Pointer-Events

- **Gewählt:** `<button disabled={isLoading}>` im JSX
- **Alternative wäre:** CSS `pointer-events: none` oder Klick-Handler-Guard
- **Warum diese:** Das HTML-Attribut sorgt für korrekte Accessibility-Semantik — Screen Reader sagen "deaktiviert", was bei reiner CSS-Lösung fehlt.

## Edge Cases

1. **Was passiert bei:** doppeltem schnellem Klick auf Login (Mehrfach-Submit)
   **Erwartetes Verhalten:** Nur die erste Anfrage wird gesendet, zweiter Klick ist durch `disabled` blockiert
2. **Was passiert bei:** Klick auf Login mit leerem E-Mail-Feld
   **Erwartetes Verhalten:** Loading-State wird nicht aktiviert, sondern Inline-Fehler "E-Mail erforderlich" erscheint
3. **Was passiert bei:** Auth-Anfrage hängt über 10 Sekunden (Netzwerk-Problem)
   **Erwartetes Verhalten:** Nach 10 Sekunden Timeout, Loading-State zurück, Fehler "Server nicht erreichbar"

## Akzeptanzkriterien

- [ ] Button zeigt Spinner und Text "Anmelden..." während Loading
- [ ] Button ist während Loading deaktiviert (Klick hat keinen Effekt)
- [ ] Bei Erfolg: Redirect zum Dashboard
- [ ] Bei Fehler: Button zurück in Normalzustand, Fehler-Banner sichtbar
- [ ] Doppelter Klick führt nicht zu doppeltem Submit
- [ ] Timeout nach 10 Sekunden funktioniert
- [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
