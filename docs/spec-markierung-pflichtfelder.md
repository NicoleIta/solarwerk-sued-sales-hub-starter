# Spec: Markierung von Pflichtfeldern
Diese Vorlage füllt Ihr aus, BEVOR Ihr Claude Code zum Bauen prompted.
Wer ohne Spec prompted, baut blind. Wer mit Spec prompted, baut gezielt.

---

## Zweck
Pflichtfelder in Formularen werden visuell hervorgehoben (z.B. mit einem roten Sternchen), damit der Nutzer auf einen Blick erkennt, welche Felder ausgefüllt werden müssen. Beim Absenden ohne ausgefüllte Pflichtfelder werden diese rot markiert, so dass der Nutzer sofort sieht, welche Angaben noch fehlen.

---

## Inputs
Welche Daten kommen ins Feature rein? Welche Eingaben macht der Nutzer? Welche bestehenden Daten werden gelesen?

• Formularfelder (Text, E-Mail, Tel.) mit HTML required-Attribut — betrifft folgende Formulare:
  - Neuer Kunde: Name, E-Mail, Telefon, Firma
  - Anmeldung: E-Mail, Passwort, Name
  - Pipeline neu: Pipeline-Name, Verantwortlicher, Kunde, Status
• Formular-Submit-Event (Klick auf Absenden-Button)
• Nutzer-Interaktion: Blur-Event beim Verlassen eines Feldes

---

## Verhalten
Was passiert mit den Inputs, Schritt für Schritt? Wann passiert was?

1. Formular wird geladen: Alle Pflichtfelder zeigen sofort ein Sternchen (*) hinter dem Label
2. Nutzer füllt das Formular aus
3. Nutzer verlässt ein Pflichtfeld (Blur): Falls das Feld leer ist (oder nur Leerzeichen enthält), erscheinen roter Rand + roter Fehlertext unter dem Feld
4. Sobald der Nutzer einen gültigen Wert eingibt und das Feld verlässt, verschwinden roter Rand und Fehlertext
5. Nutzer klickt auf Absenden: Alle noch leeren Pflichtfelder werden mit rotem Rand und Fehlertext markiert
6. Sind alle Pflichtfelder korrekt ausgefüllt, wird das Formular abgesendet

---

## Architektur-Entscheidungen
Mindestens eine bewusste Entscheidung, mit Begründung in zwei Sätzen.

### Entscheidung 1: Pflichtfelder über HTML required-Attribut definieren
• Gewählt: required=true direkt im HTML/JSX auf dem Input-Element
• Alternative wäre: Zentrale Konfig-Datei oder Validierungsschema (Zod/Yup)
• Warum diese: Das HTML-Attribut ist semantisch korrekt, wird von Browsern und Screen Readern nativ verstanden, und erfordert keine zusätzliche Konfiguration für einfache Pflichtfeld-Logik.

### Entscheidung 2: Validierungs-State im globalen Store
• Gewählt: Validierungs-State wird im globalen Store (z.B. Zustand/Redux) verwaltet
• Alternative wäre: Lokaler useState pro Formular-Komponente
• Warum diese: Da drei verschiedene Formulare dasselbe Verhalten zeigen sollen, ermöglicht ein globaler Store konsistente Logik und vermeidet Code-Duplikation über Formular-Grenzen hinweg.

---

## Edge Cases
Mindestens drei konkrete Edge Cases.

1. Was passiert bei: Submit mit nur Leerzeichen im Pflichtfeld
   Erwartetes Verhalten: Das Feld gilt als leer — trim() erkennt Leerzeichen als fehlend, roter Rand und Fehlertext erscheinen

2. Was passiert bei: Eingefügter Text wird danach wieder gelöscht
   Erwartetes Verhalten: Sobald das Feld verlassen wird (Blur) und leer ist, erscheint sofort die rote Fehler-Markierung

3. Was passiert bei: Browser füllt Felder per Autofill aus
   Erwartetes Verhalten: Nach dem Autofill wird geprüft ob ein gültiger Wert vorhanden ist — bei Erfolg keine Fehlermarkierung, bei leerem Autofill-Feld bleibt die Markierung

---

## Akzeptanzkriterien
Wie weiß ich, dass das Feature funktioniert? Jeder Punkt muss live testbar sein.

• [ ] Alle Pflichtfelder zeigen beim Laden des Formulars ein Sternchen (*)
• [ ] Leere Pflichtfelder beim Absenden: roter Rand + roter Fehlertext erscheinen
• [ ] Nach gültiger Eingabe und Blur verschwinden roter Rand und Fehlertext
• [ ] Felder mit nur Leerzeichen gelten als leer und werden als Fehler markiert
• [ ] Alle 3 Formulare funktionieren korrekt: Neuer Kunde, Anmeldung, Pipeline neu
• [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
