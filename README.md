# Sales-Hub Starter

Vertriebs-Dashboard fuer die Solarwerk Sued GmbH. Starter-Repo fuer den KI-Kurs (Modul Vibe Coding, Tag 42) — Kursteilnehmer clonen dieses Repo und bauen darauf weiter.

## Setup

```bash
npm install
npm run dev
```

Oeffne [http://localhost:3000](http://localhost:3000) im Browser.

## Dateistruktur

```
sales-hub-starter/
├── app/
│   ├── layout.tsx              # Globales Layout (Server Component)
│   ├── nav.tsx                 # Navigation (Client Component)
│   ├── page.tsx                # Dashboard Entry (Server Component)
│   ├── dashboard-client.tsx    # Dashboard Interaktion (Client Component)
│   ├── kunden/
│   │   ├── [id]/
│   │   │   ├── page.tsx                # Kundendetail (Server Component)
│   │   │   └── kunde-detail-client.tsx # Kundendetail Interaktion (Client)
│   │   └── neu/
│   │       └── page.tsx        # Neuer Kunde Formular (Client Component)
│   └── login/
│       └── page.tsx            # Login Mockup (Client Component)
├── data/
│   ├── solarwerk_kunden.csv    # 25 Kundendaten
│   └── solarwerk_pipeline.csv  # 12 Pipeline-Eintraege (ungenutzt)
├── lib/
│   └── data.ts                 # CSV-Lese-Helper
└── types/
    └── index.ts                # TypeScript-Typen
```

## Kurs-Kontext

Dieses Repo ist der Pflichtstand nach Tag 41. Ab Tag 42 bauen die Teilnehmer mit KI-Unterstuetzung neue Features:
- Pipeline-Page und Detail-Pages
- Berichte-Page mit Statistiken
- Component-Extraktion (z.B. StatusBadge)
- Erweiterte Fehlerbehandlung
