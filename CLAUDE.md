# Sales-Hub Starter — CLAUDE.md

## Workflow

- **Wie arbeiten wir zusammen:** Erst Spec schreiben, dann Claude Code mit dem Spec prompten. Keine Implementierung ohne vorherige Spezifikation.
- **Rückfragen:** Alle Rückfragen mit dem AskUserQuestion-Tool als klickbare Optionen stellen. Nie als Fließtext.

## Tech-Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS v4
- **Icons:** lucide-react
- **CSV-Parsing:** papaparse (serverseitig)

## Datenquellen

- `data/solarwerk_kunden.csv` — 25 Kundendatensaetze, gelesen via `lib/data.ts`
- `data/solarwerk_pipeline.csv` — 12 Pipeline-Eintraege, Helper existiert aber wird nirgends genutzt

## Konventionen

- **Server Components sind der Default.** Nur `"use client"` wenn noetig (Interaktion, Hooks).
- **Deutsche Domaenen-Begriffe** in Code und UI: `Kunde`, `firma`, `ansprechpartner`, `branche`, `beschwerde`, etc.
- **Status-Badge ist bewusst inline dupliziert** in `dashboard-client.tsx` und `kunde-detail-client.tsx`. Keine gemeinsame Component extrahiert — das ist paedagogisch gewollt.
- **Kein `components/`-Ordner.** Client Components liegen direkt bei ihren Pages.
- **Navigation** liegt in `app/nav.tsx`, nicht in einem separaten Ordner.

## Befehle

```bash
npm install    # Dependencies installieren
npm run dev    # Dev-Server starten (Turbopack)
npm run build  # Production-Build
npm run lint   # ESLint
```

## Lehr-Repo Hinweis

Dies ist ein Starter-Repo fuer einen KI-Kurs (Tag 42, Modul Vibe Coding). Bewusst unfertige Stellen sind paedagogisch gewollt:
- Keine Pipeline-Page (Helper existiert, Page fehlt)
- Keine Berichte-Page
- Keine StatusBadge-Component (inline dupliziert)
- Kein `components/`-Ordner
- Keine 404-Behandlung
- Neuer-Kunde-Formular persistiert nicht
- Login ist funktionsfähig mit Nutzer-Authentifizierung (lib/users.ts)
