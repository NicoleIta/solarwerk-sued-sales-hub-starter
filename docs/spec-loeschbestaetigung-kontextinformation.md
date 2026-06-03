# Spec: Lösch-Bestätigung mit Kontextinformation

Diese Spec wurde vor der Implementierung erstellt.
Merksatz: Wer ohne Spec prompted, baut blind. Wer mit Spec prompted, baut gezielt.

---

## Zweck
Vor dem endgültigen Löschen eines Datensatzes (Kunde, Pipeline-Eintrag, Aktivität, User) erscheint ein Modal, das verknüpfte Daten auflistet und bei vorhandenen Abhängigkeiten eine Passwort-Bestätigung verlangt. So werden versehentliche Datenverluste verhindert und der Benutzer erhält vor der Aktion volle Transparenz über die Konsequenzen.

---

## Inputs
- Datensatzname + Typ (z. B. Firmenname, Vor-/Nachname des Users)
- Anzahl verknüpfter Aktivitäten (COUNT aus Supabase: aktivitaeten WHERE kunde_id = ...)
- Anzahl verknüpfter Pipeline-Einträge (COUNT aus Supabase: pipeline WHERE firma = ...)
- Passwort-Eingabe des eingeloggten Users (nur wenn Abhängigkeiten > 0)
- Klick auf Löschen-Button als Auslöser (öffnet Modal — noch keine Aktion)

---

## Verhalten
1. User klickt auf Löschen-Button
2. Client lädt Abhängigkeiten (Aktivitäten-Count, Pipeline-Count) aus Supabase — Ladeindikator im Modal-Header
3. Modal öffnet sich mit:
   - Titel: „[Name] löschen?"
   - Info-Zeile: „X Aktivitäten · Y Pipeline-Einträge"
   - Roter Warntext (nur wenn Abhängigkeiten > 0): „Diese verknüpften Daten werden ebenfalls gelöscht und können nicht wiederhergestellt werden."
   - Passwort-Feld (nur wenn Abhängigkeiten > 0): „Passwort eingeben um zu bestätigen"
4. User klickt „Abbrechen" → Modal schließt, keine Aktion
5. User klickt „Endgültig löschen":
   a. Ohne Abhängigkeiten: Löschen wird sofort ausgeführt
   b. Mit Abhängigkeiten: Passwort wird via supabase.auth.signInWithPassword() geprüft
      - Bei falschem Passwort: Fehlermeldung im Modal, kein Löschen
      - Bei richtigem Passwort: Löschen wird ausgeführt
6. Nach erfolgreichem Löschen: Modal schließt, Redirect (Kunden → Dashboard, Pipeline → /pipeline, Aktivität → bleibt auf Seite, User → bleibt in Benutzerverwaltung)

---

## Architektur-Entscheidungen

### Entscheidung 1: Shared Modal-Komponente in app/loeschdialog.tsx
- Gewählt: Eine wiederverwendbare Komponente app/loeschdialog.tsx, die an allen 4 Stellen eingebunden wird
- Alternative wäre: Inline-Modals in jeder einzelnen Client-Komponente (mehr Duplikation)
- Warum diese: Die Logik (Abhängigkeiten laden, Passwort prüfen) ist identisch an allen Stellen. Einmaliger Code verhindert Inkonsistenzen. Der app/-Ordner entspricht der CLAUDE.md-Konvention (kein components/).

### Entscheidung 2: Passwort-Check via supabase.auth.signInWithPassword()
- Gewählt: Client-seitige Verifikation mit der aktuellen User-E-Mail + eingegebenem Passwort via Supabase Auth
- Alternative wäre: Eigener API-Endpunkt /api/verify-password
- Warum diese: Kein neuer Endpunkt nötig, Supabase Auth übernimmt die sichere Prüfung. Rate-Limiting und Sicherheit sind durch Supabase bereits gewährleistet.

---

## Edge Cases

1. Was passiert bei: Falschem Passwort im Modal
   Erwartetes Verhalten: Rote Fehlermeldung „Falsches Passwort" erscheint unter dem Passwort-Feld, Löschen-Button bleibt blockiert, Modal bleibt offen

2. Was passiert bei: Datensatz ohne Abhängigkeiten (0 Aktivitäten, 0 Pipeline-Einträge)
   Erwartetes Verhalten: Modal öffnet ohne Warntext und ohne Passwort-Feld — nur „[Name] löschen?" + Buttons

3. Was passiert bei: Netzwerkfehler beim Laden der Abhängigkeiten
   Erwartetes Verhalten: Modal öffnet trotzdem, zeigt statt Zahlen „Abhängigkeiten konnten nicht geladen werden" als gelbe Warnung — Löschen ist trotzdem möglich (ohne Passwort-Check)

4. Was passiert bei: Admin versucht sein eigenes User-Konto zu löschen
   Erwartetes Verhalten: Modal zeigt zusätzlichen Hinweis „Du kannst dein eigenes Konto nicht löschen" — Löschen-Button ist deaktiviert

---

## Akzeptanzkriterien
- [ ] Modal erscheint an allen 4 Lösch-Stellen (Kunden, Pipeline-Eintrag, Aktivität, User in Benutzerverwaltung)
- [ ] Abhängigkeiten-Zahlen stimmen mit dem tatsächlichen DB-Inhalt überein
- [ ] Passwort-Feld erscheint nur wenn Abhängigkeiten > 0
- [ ] Falsches Passwort blockiert das Löschen mit einer Fehlermeldung im Modal
- [ ] Kein Passwort-Feld bei Datensätzen ohne Abhängigkeiten
- [ ] Eigenes User-Konto kann nicht gelöscht werden (Hinweis im Modal)
- [ ] Abbrechen schließt Modal ohne jede Datenbankoperation
- [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
