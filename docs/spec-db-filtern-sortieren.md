# Spec: DB-seitiges Filtern und Sortieren

## Zweck
Sowohl die Pipeline-Liste als auch die Kundenliste werden vollständig auf DB-seitiges Filtern und Sortieren umgestellt. Filter- und Sortierlogik liegt in der Supabase-Query, nicht mehr im Client.

## Inputs
- Tabelle `pipeline` aus Supabase (id, kunde_id, status, datum, wert)
- Tabelle `kunden` aus Supabase (id, name, firma, branche, etc.)
- Status-Filter: Button-Gruppe (Alle / Angebot / Gewonnen / Verloren) — Nutzer-Eingabe
- Suchbegriff: Freitexteingabe über Kundenname/Firma — Nutzer-Eingabe

## Verhalten
1. Pipeline-Liste lädt beim ersten Render sortiert nach Datum absteigend aus Supabase
2. Nutzer klickt einen Status-Button — Filter-State ändert sich, useEffect feuert neue Query mit `.eq('status', gewählterStatus)`
3. Klick auf "Alle" entfernt den Status-Filter, Query lädt alle Einträge
4. Kundenliste lädt beim ersten Render alphabetisch nach Firma sortiert aus Supabase
5. Nutzer tippt in das Suchfeld — nach ~300ms Debounce feuert useEffect eine neue Query mit `.ilike('firma', '%suchbegriff%')`
6. Nutzer leert das Suchfeld — Query läuft ohne ilike-Filter, alle Kunden werden angezeigt
7. Bei Query-Fehler: Fehlermeldung sichtbar, Liste bleibt leer

## Architektur-Entscheidungen

### Entscheidung 1: Filter-State lokal im Client Component
- Gewählt: `useState` für Status-Filter und Suchbegriff direkt in `pipeline-client.tsx` bzw. `dashboard-client.tsx`
- Alternative wäre: Filter als URL-searchParams
- Warum diese: Filter betreffen nur die jeweilige Liste, kein globaler State nötig. URL-Params sind nur sinnvoll wenn Links geteilt werden sollen.

### Entscheidung 2: useEffect als Query-Trigger
- Gewählt: `useEffect([filter, suchbegriff])` ruft Supabase-Query bei jeder Änderung neu auf
- Alternative wäre: Server Action / Route Handler
- Warum diese: Einfachere Implementierung ohne API-Route, passt zum bestehenden Client-Component-Muster im Projekt.

## Edge Cases
1. Was passiert bei: Suche liefert 0 Treffer
   Erwartetes Verhalten: "Keine Ergebnisse gefunden" wird angezeigt, kein Absturz
2. Was passiert bei: Supabase-Query schlägt fehl (Netzwerkfehler)
   Erwartetes Verhalten: Fehlermeldung sichtbar, Liste bleibt leer
3. Was passiert bei: Nutzer leert das Suchfeld komplett
   Erwartetes Verhalten: Alle Einträge werden wieder angezeigt (kein Filter aktiv)

## Akzeptanzkriterien
- [ ] Pipeline-Liste ist nach Datum absteigend sortiert (neuester Eintrag oben)
- [ ] Status-Filter (Button-Gruppe) filtert sofort, nur passende Einträge sichtbar
- [ ] Kundensuche läuft DB-seitig via ilike-Query, kein clientseitiges Array-Filter
- [ ] Kundenliste ist alphabetisch nach Firma sortiert (aus der DB)
- [ ] Leerzustand zeigt "Keine Ergebnisse gefunden"
- [ ] Fehlermeldung bei Netzwerkfehler sichtbar
- [ ] Leeres Suchfeld zeigt alle Einträge
- [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
