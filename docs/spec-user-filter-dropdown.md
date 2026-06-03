# Spec: User-Filter-Dropdown in Dashboard und Pipeline

Diese Spec wurde vor der Implementierung erstellt.
Merksatz: Wer ohne Spec prompted, baut blind. Wer mit Spec prompted, baut gezielt.

---

## Zweck
Dashboard und Pipeline sollen per Dropdown nach einem bestimmten User filterbar sein — Admins sehen alle User zur Auswahl, normale User sehen nur sich selbst und können damit ihre eigenen Einträge gezielt herausfiltern.

---

## Inputs
- Liste aller aktiven User aus der `profiles`-Tabelle (Vorname, Nachname, id)
- Eingeloggter User inkl. Rolle (`admin`, `manager`, `teamleiter`, `sales`, `viewer`)
- Neues DB-Feld `zustaendig_id` (UUID, Foreign Key auf `profiles.id`, nullable) in den Tabellen `kunden` und `pipeline`
- Bestehende Filter in Dashboard (Branchen, Status, Suche) und Pipeline (Status-Chips, Suche)

---

## Verhalten
1. Neues Feld `zustaendig_id` wird per Supabase-Migration zu den Tabellen `kunden` und `pipeline` hinzugefügt (nullable, SET NULL bei User-Löschung)
2. Neue Rolle `teamleiter` wird in `lib/users.ts` / `types.ts` ergänzt
3. Im Formular „Neuer Kunde" und „Neuer Pipeline-Eintrag" erscheint ein Dropdown „Zuständiger Mitarbeiter" — vorausgefüllt mit dem eingeloggten User, Admin und Teamleiter können jeden aktiven User wählen
4. Im Dashboard erscheint neben „Alle Branchen" ein User-Dropdown: Admin und Teamleiter starten mit „Alle Mitarbeiter", normale User sehen alle Namen aber nur der eigene ist wählbar (andere ausgegraut)
5. In der Pipeline erscheint dasselbe Dropdown neben dem Suchfeld
6. Auswahl eines Users filtert die angezeigte Liste clientseitig — Filter wird bei jedem Seitenaufruf zurückgesetzt
7. Einträge ohne `zustaendig_id` (Altdaten) erscheinen nur bei „Alle Mitarbeiter" — Admin und Teamleiter können diese Einträge einem User zuweisen (direkt in der Liste oder im Bearbeiten-Dialog)
8. Ist nach dem Filtern die Liste leer, erscheint der Hinweistext „Keine Einträge für diesen Mitarbeiter"

---

## Architektur-Entscheidungen

### Entscheidung 1: Neues Feld `zustaendig_id` statt bestehendem Feld
- **Gewählt:** Nullable UUID-Feld `zustaendig_id` mit Foreign Key auf `profiles.id`, ON DELETE SET NULL
- **Alternative wäre:** Textspeicherung des Namens oder eine separate Zuweisungs-Tabelle
- **Warum diese:** Referenzielle Integrität via FK, bei User-Löschung kein Datenverlust durch SET NULL, konsistent mit Supabase-Konventionen

### Entscheidung 2: Clientseitiger Filter, kein URL-Parameter
- **Gewählt:** Filter-State lokal in der Client-Komponente, Reset bei Seitenaufruf
- **Alternative wäre:** URL-Parameter `?user=id` oder localStorage
- **Warum diese:** Einfachste Lösung, kein serverseitiger Overhead, keine URL-Manipulation nötig

### Entscheidung 3: Neue Rolle `teamleiter`
- **Gewählt:** Eigene Rolle `teamleiter` mit Zuweisung-Recht für nicht zugewiesene Einträge
- **Alternative wäre:** Nur Admin darf zuweisen
- **Warum diese:** Entspricht der realen Organisationsstruktur, ohne die bestehende `manager`-Rolle zu überladen

---

## Edge Cases

1. **Was passiert bei:** Normaler User öffnet das User-Dropdown und sieht andere Namen
   **Erwartetes Verhalten:** Alle aktiven User sind sichtbar, aber nur der eigene Name ist klickbar — andere sind ausgegraut und nicht wählbar

2. **Was passiert bei:** Ein User wird gelöscht, dem noch Kunden/Pipeline-Einträge zugewiesen sind
   **Erwartetes Verhalten:** `zustaendig_id` wird auf `null` gesetzt (SET NULL), Einträge bleiben erhalten und erscheinen als „nicht zugewiesen"

3. **Was passiert bei:** User-Filter ist aktiv, aber dieser User hat keine Einträge
   **Erwartetes Verhalten:** Liste ist leer, Hinweistext „Keine Einträge für diesen Mitarbeiter" erscheint

---

## Akzeptanzkriterien
- [ ] User-Dropdown ist im Dashboard neben „Alle Branchen" sichtbar und funktionsfähig
- [ ] User-Dropdown ist in der Pipeline neben dem Suchfeld sichtbar und funktionsfähig
- [ ] Admin und Teamleiter sehen alle aktiven User im Dropdown, starten mit „Alle Mitarbeiter"
- [ ] Normaler User sieht alle Namen, aber nur der eigene ist wählbar — andere ausgegraut
- [ ] Formular „Neuer Kunde" und „Neuer Pipeline-Eintrag" haben Dropdown „Zuständiger Mitarbeiter"
- [ ] Admin und Teamleiter können nicht zugewiesene Einträge einem User zuweisen
- [ ] Gelöschter User → `zustaendig_id` wird null, kein Datenverlust
- [ ] Leere Filterergebnisse zeigen Hinweistext statt leerer Tabelle
- [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
