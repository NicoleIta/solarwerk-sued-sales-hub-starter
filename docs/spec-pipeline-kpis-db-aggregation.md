# Spec: Pipeline-KPIs aus DB-Aggregation

## Zweck
Die KPI-Karten auf der Pipeline-Seite berechnen ihre Zahlen aktuell aus dem
gefilterten Browser-Array — dadurch spiegeln sie nicht den echten DB-Stand wider.
Die vier Stat-Karten werden auf echte DB-Queries umgestellt: count() und sum()
laufen direkt in Supabase, unabhängig vom aktiven Filter.

## Inputs
- Supabase-Tabelle „pipeline" — count() und sum(betrag)-Queries für alle 4 Karten
- Aktiver Status-Filter und Suche — werden an alle 4 Queries übergeben

## Verhalten
1. Pipeline lädt → 4 KPI-Queries starten parallel, Karten zeigen Skeleton
2. Queries fertig → Skeleton verschwindet, echte Zahlen erscheinen
3. Nutzer ändert Filter (Status oder Suche) → alle 4 Queries laufen neu
4. Karten aktualisieren sich mit den gefilterten DB-Werten
5. Kein Filter aktiv → Karten zeigen echten DB-Gesamtstand

## Karten im Detail
- Aktives Volumen €: sum(betrag) aller Einträge mit status ≠ verloren
- Offene Angebote: count() mit status = angebot_raus
- Gewonnen €: sum(betrag) mit status = gewonnen
- Verloren: count() mit status = verloren

## Architektur-Entscheidungen

### Entscheidung 1: KPI-Queries direkt im PipelineClient
- Gewählt: 4 separate Supabase-Queries in pipeline-client.tsx
- Alternative wäre: Eigener API-Route /api/pipeline-kpis
- Warum diese: Kein neuer File nötig, Queries reagieren direkt auf statusFilter-State.

### Entscheidung 2: 4 separate Queries statt Frontend-Berechnung
- Gewählt: count() und sum() laufen in Supabase
- Alternative wäre: eintraege.filter(...).reduce(...) im Browser
- Warum diese: Das ist genau das alte Verhalten — DB soll rechnen, nicht der Browser.

## Edge Cases

1. Was passiert bei: DB-Query schlägt fehl
   Erwartetes Verhalten: Karte zeigt — und wird dezent ausgegraut, Seite bleibt bedienbar

2. Was passiert bei: Kein Eintrag erfüllt den aktiven Filter
   Erwartetes Verhalten: Karte zeigt 0 mit grauem Hinweistext „Keine Treffer"

3. Was passiert bei: Supabase-Verbindung fehlt beim Laden komplett
   Erwartetes Verhalten: Alle Karten zeigen —, bestehender Fehler-Banner bleibt erhalten

## Akzeptanzkriterien
- [ ] Karten zeigen echte DB-Werte beim Laden (nicht aus Frontend-Array)
- [ ] Karten reagieren auf Filter-Änderungen (Status, Suche)
- [ ] Skeleton-Block sichtbar während DB-Query läuft
- [ ] Fehlerfall: Karte zeigt — + dezent ausgegraut, Seite bleibt bedienbar
- [ ] 0 + grauer Hinweistext „Keine Treffer" wenn Filter kein Ergebnis liefert
- [ ] Alte .filter(...).reduce(...) und .length Berechnungen sind entfernt
- [ ] Kein zusätzlicher API-Route wurde erstellt
- [ ] Alle Edge Cases live getestet
