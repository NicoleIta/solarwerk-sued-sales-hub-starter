#Spec: Cascade-Test im Supabase Dashboard

##Zweck
Wir testen live im Supabase Dashboard, was bei einem DELETE auf einen Kunden mit
Pipeline-Einträgen passiert — je nach gewähltem Cascade-Verhalten (RESTRICT, CASCADE,
SET NULL). Das Experiment macht den Unterschied zwischen den drei FK-Optionen direkt
sichtbar und erfahrbar.

##Inputs
• Supabase SQL Editor (Tool-Zugang im Supabase Dashboard)
• UUID eines Kunden, der mindestens einen pipeline-Eintrag besitzt
• DELETE-Statement: DELETE FROM kunden WHERE id = '<diese-id>'
• FK-Constraint-Einstellung: gewählte Cascade-Option (RESTRICT, CASCADE oder SET NULL)

##Verhalten
1. FK-Constraint prüfen/anpassen — im Supabase Dashboard die gewünschte Option
   (RESTRICT / CASCADE / SET NULL) am Foreign Key setzen.
2. SQL Editor öffnen im Supabase Dashboard.
3. Einen Kunden mit Pipeline-Einträgen identifizieren (Table Editor oder SELECT-Abfrage).
4. DELETE-Statement ausführen.
5. Ergebnis dokumentieren (Screenshot, Fehlermeldung oder Tabelleninhalt prüfen) —
   für jede Cascade-Option wiederholen.

##Architektur-Entscheidungen

###Entscheidung 1: Cascade-Wahl SET NULL als gewählte Option
• Gewählt: SET NULL als FK-Constraint zwischen kunden und pipeline
• Alternative wäre: CASCADE
• Warum diese: Pipeline-Einträge bleiben erhalten und können später einem neuen Kunden
  zugeordnet werden. Erfordert aber Handling von NULL-Werten im Code, wenn die App
  Pipeline-Einträge ohne Kunden anzeigt.

##Edge Cases
1. Was passiert bei: DELETE eines Kunden ohne Pipeline-Einträge
   Erwartetes Verhalten: Löschen klappt bei allen drei Cascade-Optionen problemlos.

2. Was passiert bei: DELETE mit RESTRICT auf einen Kunden mit Einträgen
   Erwartetes Verhalten: DB-Fehler "violates foreign key constraint", Kunde bleibt
   in der Tabelle.

3. Was passiert bei: Pipeline-Einträgen mit kunde_id = NULL nach SET NULL (App-Ansicht)
   Erwartetes Verhalten: App muss NULL-Fall behandeln, sonst Crash beim Rendern.

4. Was passiert bei: allen drei Optionen nacheinander ohne Daten-Reset
   Erwartetes Verhalten: Nach CASCADE sind die Daten weg — kein zweiter Test möglich
   ohne vorherigen Daten-Reset.

##Akzeptanzkriterien
• [ ] DELETE mit RESTRICT ausgeführt, Fehlermeldung "violates foreign key constraint"
      als Screenshot festgehalten
• [ ] DELETE mit CASCADE: Kunde + zugehörige Pipeline-Einträge danach nicht mehr in der DB
• [ ] DELETE mit SET NULL: Kunde gelöscht, Pipeline-Einträge mit kunde_id = NULL vorhanden
• [ ] Vergleichstabelle (Cascade-Wahl / Was passiert) mit allen 3 Optionen ausgefüllt
• [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
