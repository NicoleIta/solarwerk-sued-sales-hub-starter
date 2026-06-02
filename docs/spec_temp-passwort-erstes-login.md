#Spec: Temp-Passwort & Passwort-Änderung beim ersten Login

##Zweck
Der Admin legt beim Erstellen eines neuen Users ein temporäres Passwort fest,
das im Profil sichtbar bleibt. Beim ersten Login wird der User zur
Passwortänderung gezwungen und kann danach mit seinem eigenen Passwort arbeiten.

##Inputs
• Temp-Passwort (String) — Admin-Eingabe im "Neuer User"-Modal
• Neues Passwort (String) — User-Eingabe beim ersten Login
• Passwort-Bestätigung (String) — User-Eingabe zur Bestätigung
• profiles.muss_passwort_aendern (Boolean) — Supabase, wird beim Anlegen
  auf true gesetzt, nach Änderung auf false zurückgesetzt
• profiles.temp_password (String | null) — Supabase, Klartext-Speicher
  des Temp-Passworts, nach Änderung auf null gesetzt

##Verhalten
1. Admin legt neuen User an und gibt Temp-Passwort ein → wird in
   profiles.temp_password gespeichert, muss_passwort_aendern = true
2. Admin kann Temp-Passwort jederzeit in der User-Übersicht sehen
   und neu setzen
3. User loggt sich mit Temp-Passwort ein
4. Next.js Middleware erkennt muss_passwort_aendern = true →
   Redirect auf /passwort-aendern
5. User gibt neues Passwort + Bestätigung ein
6. Validierung: Felder nicht leer, beide identisch, mind. 8 Zeichen
7. Neues Passwort wird in Supabase Auth gespeichert, temp_password = null,
   muss_passwort_aendern = false
8. Redirect zum Dashboard

##Architektur-Entscheidungen

###Entscheidung 1: Temp-Passwort als Klartext in profiles.temp_password
• Gewählt: Klartext-Speicherung in der profiles-Tabelle
• Alternative wäre: Verschlüsselt oder als Supabase-Secret
• Warum diese: Einfach lesbar für den Admin ohne Zusatz-Aufwand. Das
  Temp-Passwort wird nach dem ersten Login gelöscht, daher ist das
  Sicherheitsrisiko im Lehr-Kontext vertretbar.

###Entscheidung 2: Redirect-Logik über Next.js Middleware
• Gewählt: Middleware prüft profiles.muss_passwort_aendern nach jedem Login
• Alternative wäre: Client-seitige Prüfung im Dashboard
• Warum diese: Der User kommt nicht an der Änderungs-Seite vorbei —
  Middleware-Schutz ist serverseitig und lässt sich nicht umgehen.

##Edge Cases
1. Was passiert bei: Passwort-Bestätigung stimmt nicht überein
   Erwartetes Verhalten: Inline-Fehler "Passwörter stimmen nicht überein",
   kein Speichern

2. Was passiert bei: Neues Passwort kürzer als 8 Zeichen (z.B. "abc")
   Erwartetes Verhalten: Inline-Fehler "Mindestens 8 Zeichen erforderlich"

3. Was passiert bei: Admin speichert neuen User ohne Temp-Passwort-Eingabe
   Erwartetes Verhalten: Validierungsfehler im Modal "Temp-Passwort ist
   erforderlich", User wird nicht angelegt

##Akzeptanzkriterien
• [ ] Admin-Formular ("Neuer User"-Modal) enthält Temp-Passwort-Feld
      als Pflichtfeld
• [ ] Admin sieht Temp-Passwort in der User-Übersicht und kann es neu setzen
• [ ] Erster Login → automatischer Redirect auf /passwort-aendern,
      kein Zugriff aufs Dashboard
• [ ] Passwort-Änderung speichert neues Passwort in Supabase Auth,
      setzt temp_password = null und muss_passwort_aendern = false
• [ ] Nach erfolgreicher Änderung: Redirect zum Dashboard
• [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
