# Spec: Dashboard-KPIs aus DB-Aggregation

## Zweck
Die KPI-Karten berechnen ihre Zahlen aktuell aus dem gefilterten Browser-Array —
dadurch spiegeln sie nicht den echten DB-Stand wider, sondern nur den gerade
sichtbaren Ausschnitt. Die drei Stat-Karten werden auf echte DB-Queries
umgestellt: count() läuft direkt in Supabase, unabhängig vom aktiven Filter.

## Inputs
- Supabase-Tabelle „kunden" — count()-Queries für Gesamt, Aktiv, Beschwerden
- Aktive Filter (Status, Branche, Suche) — werden an alle 3 Queries übergeben

## Verhalten
1. Dashboard lädt → 3 KPI-Queries starten parallel, Karten zeigen Skeleton
2. Queries fertig → Skeleton verschwindet, echte Zahlen erscheinen
3. Nutzer ändert Filter (Status, Branche oder Suche) → alle 3 Queries laufen neu
4. Karten aktualisieren sich mit den gefilterten DB-Zahlen
5. Kein Filter aktiv → Karten zeigen echten DB-Gesamtstand

## Architektur-Entscheidungen

### Entscheidung 1: KPI-Queries direkt im DashboardClient
- Gewählt: 3 separate useEffect-Queries in dashboard-client.tsx
- Alternative wäre: Eigener API-Route /api/kpis oder Hook useKpis()
- Warum diese: Kein neuer File nötig, Queries reagieren direkt auf filterValues-State.

### Entscheidung 2: 3 separate Queries statt einer
- Gewählt: Eine Query pro Karte (count gesamt, count aktiv, count beschwerden)
- Alternative wäre: Alle Kunden laden und im Frontend zählen
- Warum diese: Das wäre genau das alte Verhalten — DB soll zählen, nicht der Browser.

## Edge Cases

1. Was passiert bei: DB-Query schlägt fehl
   Erwartetes Verhalten: Karte zeigt — und wird dezent ausgegraut, Seite bleibt bedienbar

2. Was passiert bei: Kein Kunde erfüllt den aktiven Filter
   Erwartetes Verhalten: Karte zeigt 0 mit grauem Hinweistext „Keine Treffer"

3. Was passiert bei: Supabase-Verbindung fehlt beim Laden komplett
   Erwartetes Verhalten: Alle Karten zeigen —, bestehender Fehler-Banner bleibt erhalten

## Akzeptanzkriterien
- [ ] Karten zeigen echte DB-Zahlen beim Laden (nicht aus Frontend-Array)
- [ ] Karten reagieren auf Filter-Änderungen (Status, Branche, Suche)
- [ ] Skeleton-Block sichtbar während DB-Query läuft
- [ ] Fehlerfall: Karte zeigt — + dezent ausgegraut, Seite bleibt bedienbar
- [ ] 0 + grauer Hinweistext „Keine Treffer" wenn Filter kein Ergebnis liefert
- [ ] Alte kunden.filter(...).length Berechnungen sind aus dem Code entfernt
- [ ] Kein zusätzlicher API-Route wurde erstellt
- [ ] Alle Edge Cases live getestet
