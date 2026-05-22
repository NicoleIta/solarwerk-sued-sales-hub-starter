# Spec: components/ — Ordner für wiederverwendbare UI-Komponenten

## Zweck

Der Ordner `components/` auf Root-Ebene (neben `app/`, `lib/`, `types/`) ist der einzige Ablageort für UI-Komponenten, die in mehr als einer Seite oder einem Feature des Projekts verwendet werden. Er trennt projektweite Bausteine von seitenspezifischer Logik und sorgt dafür, dass Imports projektübergreifend einheitlich über `@/components/[name]` funktionieren.

---

## Inputs

- Anforderung für eine neue React-Komponente, die in **mehr als einem** `app/`-Unterverzeichnis genutzt wird oder genutzt werden soll
- Dateiname in `kebab-case` (z.B. `filter-bar.tsx`, `status-badge.tsx`)
- Komponente exportiert: einen **Default-Export** für die Komponente selbst, **Named Exports** für zugehörige TypeScript-Typen und Interfaces

---

## Verhalten

1. Entwickler erkennt, dass eine UI-Komponente auf mehreren Seiten benötigt wird
2. Neue Datei wird als `components/[name].tsx` angelegt
3. Komponente wird als Client-Komponente markiert (`"use client"`), sofern sie interaktive Browser-APIs oder State benötigt
4. Zugehörige TypeScript-Typen werden in derselben Datei definiert und exportiert
5. Consumer-Dateien importieren über den TypeScript-Alias: `import Komponente from "@/components/[name]"`
6. Seitenspezifische Logik (z.B. `dashboard-client.tsx`) verbleibt im jeweiligen `app/`-Unterverzeichnis und wird nicht nach `components/` verschoben

---

## Architektur-Entscheidungen

### Entscheidung 1: Root-Ebene statt `app/components/`

- **Gewählt:** `components/` liegt auf derselben Ebene wie `app/`, `lib/`, `types/`
- **Alternative wäre:** `app/components/` innerhalb des Next.js App-Routers
- **Warum diese:** Komponenten in `app/components/` könnten versehentlich als Route interpretiert werden oder im Routing-Kontext stehen. Die Root-Ebene ist der etablierte Next.js-Standard für projektweite Shared Components und macht den Unterschied zwischen "Seite" und "Baustein" im Dateisystem sichtbar.

### Entscheidung 2: Typen im selben File wie die Komponente

- **Gewählt:** Props-Interfaces und zugehörige Typen werden direkt in `components/[name].tsx` exportiert
- **Alternative wäre:** Alle Komponenten-Typen zentral in `types/index.ts`
- **Warum diese:** Typen, die ausschließlich die API einer Komponente beschreiben, gehören zu dieser Komponente. Wer die Komponente importiert, findet alle nötigen Typen an derselben Stelle. `types/index.ts` bleibt für domänenweite Datenmodelle (z.B. `Kunde`, `PipelineEintrag`).

---

## Edge Cases

1. **Was passiert bei:** einer Komponente, die aktuell nur auf einer Seite verwendet wird, aber generisch gebaut ist
   **Erwartetes Verhalten:** Sie darf trotzdem in `components/` abgelegt werden, wenn absehbar ist, dass sie wiederverwendet wird — Entscheidung liegt beim Entwickler

2. **Was passiert bei:** einer Komponente, die direkte Datenbankzugriffe oder `async`-Server-Logik benötigt (Server Component)
   **Erwartetes Verhalten:** Diese Komponente gehört **nicht** in `components/` (dort liegen Client Components), sondern in das zugehörige `app/`-Unterverzeichnis als eigene Datei

3. **Was passiert bei:** zwei Komponenten in `components/`, die denselben Typ teilen
   **Erwartetes Verhalten:** Der gemeinsame Typ wird in `types/index.ts` definiert und von beiden Komponenten importiert — kein Typ wird aus einer Komponenten-Datei in eine andere importiert

---

## Akzeptanzkriterien

- [ ] Ordner `components/` existiert auf Root-Ebene (neben `app/`, `lib/`, `types/`)
- [ ] Alle wiederverwendbaren UI-Komponenten liegen ausschließlich in `components/`
- [ ] Import über `@/components/[name]` funktioniert in allen Consumer-Dateien ohne zusätzliche Pfad-Konfiguration
- [ ] Keine Komponente in `components/` enthält seitenspezifische Logik (keine direkten API-Calls, kein `useRouter` für seitenspezifisches Routing)
- [ ] Seitenspezifische Komponenten (`dashboard-client.tsx`, `pipeline-client.tsx` etc.) verbleiben in ihren `app/`-Unterverzeichnissen
- [ ] Jede Datei in `components/` exportiert ihre Typen direkt (kein Import aus externen Typ-Dateien für reine Komponenten-Typen)
- [ ] **Alle Edge Cases aus dem Abschnitt oben sind getestet**
