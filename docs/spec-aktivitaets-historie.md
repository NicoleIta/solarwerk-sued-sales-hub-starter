# Spec: Aktivitäts-Historie pro Kunde

## Zweck
Die Aktivitäts-Historie zeigt alle Interaktionen mit einem Kunden chronologisch auf der Kundendetailseite und am verknüpften Pipeline-Eintrag an. Jeder neue Kontakt — Anruf, E-Mail, Notiz, Besuch — wird als Eintrag erfasst, damit der Vertrieb jederzeit sieht, was zuletzt passiert ist.

## Inputs
- Aktivitäts-Typ: Anruf | E-Mail | Notiz | Besuch/Termin (Pflicht-Auswahl)
- Betreff: Text, Pflichtfeld
- Inhalt: Freitext, optional
- Kunden-ID: aus der aktuellen Kundendetailseite (automatisch)
- Erstellt-von: eingeloggter Nutzer (automatisch)
- Bestehende Datenquelle: Supabase-Tabelle `aktivitaeten`

## Verhalten
1. Nutzer öffnet Kundendetailseite — Liste aller Aktivitäten wird geladen (neueste zuerst)
2. Nutzer klickt "Aktivität anlegen" — Modal öffnet sich mit Formular
3. Nutzer wählt Typ, gibt Betreff ein, Inhalt optional
4. Bei Submit: Client-seitige Validierung — leerer Betreff zeigt Inline-Fehler, Modal bleibt offen
5. Bei gültigem Eintrag: Speicherung in Supabase, Modal schließt, Liste aktualisiert sich
6. Löschen-Button erscheint nur bei eigenen Einträgen (erstellt_von == eingeloggter Nutzer)
7. Aktivitäten sind auch vom verknüpften Pipeline-Eintrag aus referenzierbar/sichtbar

## Architektur-Entscheidungen

### Entscheidung 1: Supabase-Tabelle `aktivitaeten`
- Gewählt: Neue Tabelle mit Feldern id, kunde_id, typ, betreff, inhalt, erstellt_von, erstellt_am
- Alternative wäre: JSON-Array-Feld in der Kunden-Tabelle
- Warum diese: Separate Tabelle ist filterbar, joinbar und skalierbar. JSON-Feld wäre nicht separat abfragbar und erschwert spätere Filterung nach Typ oder Nutzer.

### Entscheidung 2: Modal für das Anlegen-Formular
- Gewählt: Button öffnet Modal/Dialog mit dem Formular
- Alternative wäre: Inline-Formular direkt auf der Seite
- Warum diese: Modal hält die Detailseite übersichtlich und trennt "Lesen" von "Schreiben" visuell klar — besonders bei langen Aktivitätslisten.

### Entscheidung 3: FK ohne Löschregel
- Gewählt: Foreign Key `kunde_id` ohne ON DELETE CASCADE
- Alternative wäre: CASCADE (Aktivitäten werden mitgelöscht)
- Warum diese: Verhindert unbeabsichtigten Datenverlust. Kunden mit Aktivitäten müssen erst bereinigt werden — das ist eine bewusste Schutzmaßnahme.

## Edge Cases

1. Was passiert bei: Kunde ohne Aktivitäten
   Erwartetes Verhalten: Text "Noch keine Aktivitäten erfasst." + Button "Erste Aktivität anlegen" — kein Absturz, kein blankes Nichts

2. Was passiert bei: Nutzer versucht Eintrag eines anderen Nutzers zu löschen
   Erwartetes Verhalten: Löschen-Button wird gar nicht angezeigt — nur bei eigenen Einträgen sichtbar

3. Was passiert bei: Submit mit leerem Betreff-Feld
   Erwartetes Verhalten: Inline-Fehlermeldung "Betreff ist erforderlich", Modal bleibt offen, kein Netzwerk-Request

4. Was passiert bei: Kunden-Löschen bei vorhandenen Aktivitäten
   Erwartetes Verhalten: Datenbank blockiert den Vorgang, Fehlermeldung erscheint in der UI

## Akzeptanzkriterien
- [ ] Aktivität anlegen: Modal öffnet sich, Eintrag wird gespeichert und erscheint sofort in der Liste (neueste zuerst)
- [ ] Leerzustand: Kunde ohne Aktivitäten zeigt Meldung + Button, kein Absturz
- [ ] Löschen nur durch Ersteller: Button nur bei eigenen Einträgen sichtbar
- [ ] FK blockiert Kunden-Löschen: Fehlermeldung erscheint, Kunden-Datensatz bleibt erhalten
- [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
