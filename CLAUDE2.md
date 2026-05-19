# Sales-Hub Starter — CLAUDE2.md
## Session-Zusammenfassung: 19. Mai 2026

---

## Was heute erledigt wurde

### 1. /pipeline Seite
- Neue Seite unter `app/pipeline/page.tsx` mit Tabelle aller Pipeline-Einträge
- Zeigt: Firma, Ansprechpartner, Phase, Volumen (€), Angebotsdatum, Status
- Inline-Statusänderung direkt in der Tabelle via Dropdown — kein Seitenaufruf nötig
- Klickbare Zeilen führen zur Pipeline-Detail-Seite (`/pipeline/[id]`)
- `export const dynamic = "force-dynamic"` damit CSV-Daten immer frisch geladen werden
- Gesamtvolumen aller Einträge wird als Summe am Ende der Tabelle angezeigt

### 2. /berichte Seite
- Neue Seite unter `app/berichte/page.tsx` + `berichte-client.tsx`
- Zwei Auswertungen: **Volumen pro Branche** und **Pipeline-Status Übersicht**
- Daten werden aus `data/solarwerk_pipeline.csv` aggregiert
- Null-Safety: `(volumen_eur ?? 0)` verhindert Fehler bei leeren Einträgen
- `export const dynamic = "force-dynamic"` damit Änderungen sofort sichtbar sind

### 3. Neuer-Kunde-Formular speichert in CSV
- Vorher: Formular hatte keine echte Speicherung
- Jetzt: API-Route `POST /api/kunden` schreibt neuen Eintrag in `data/solarwerk_kunden.csv`
- Papaparse liest die bestehende CSV, hängt den neuen Eintrag an, schreibt zurück
- Formular unter `app/kunden/neu/page.tsx` sendet JSON an die API, leitet danach zum Dashboard weiter

### 4. StatusBadge-Component
- `app/status-badge.tsx` als wiederverwendbare Client-Komponente extrahiert
- Nimmt `status: string` als Prop entgegen
- Farbcodierung: `aktiv` = grün, `in_wartung` = gelb, `beschwerde` = rot
- Wird verwendet in: Dashboard, Pipeline-Tabelle, Kunden-Detail

### 5. Inline-Status-Editing (Dashboard + Pipeline)
- Status-Dropdown direkt in der Tabellen-Zeile — kein separates Formular
- `PATCH /api/kunden/[id]` aktualisiert beliebige Felder in der Kunden-CSV
- `PATCH /api/pipeline/[id]` aktualisiert beliebige Felder in der Pipeline-CSV
- Nach dem Speichern: `router.refresh()` lädt die Server-Daten neu ohne Seitenreload

### 6. Pipeline-Detail-Seite
- `app/pipeline/[id]/page.tsx` (Server Component) lädt den Eintrag via `getPipelineEintrag(id)`
- `pipeline-detail-client.tsx` zeigt ein Edit-Formular für alle Felder
- **Volumen (€)** und **Angebotsdatum** sind hier einpflegbar
- **Auto-Berechnung:** Volumen wird automatisch berechnet sobald Anlagengröße (kWp) eingegeben wird: `kWp × 900 €`
- Technisch gelöst mit functional `setFormData((prev) => {...})` um zuverlässige State-Updates zu garantieren

### 7. Kunden-Pipeline-Verknüpfung
- Kunden-Detail-Seite (`/kunden/[id]`) zeigt alle Pipeline-Einträge dieser Firma
- Filterung: `getPipeline().filter(e => e.firma === kunde.firma)`
- "+ Neuer Pipeline-Eintrag"-Button öffnet `/pipeline/neu?firma=...&ansprechpartner=...`
- Das neue Pipeline-Formular liest die URL-Parameter via `useSearchParams()` und füllt Firma + Ansprechpartner vor
- `useSearchParams()` benötigt einen `<Suspense>`-Wrapper in Next.js App Router

### 8. Dark/Light Mode
- `app/theme-toggle.tsx` — Toggle-Button mit Sonne/Mond-Icon (lucide-react) in der Navigation
- Persistenz via `localStorage` (Key: `"theme"`, Wert: `"dark"` oder `"light"`)
- Inline-Script in `app/layout.tsx` liest `localStorage` vor dem ersten Render — verhindert hellen Aufblitz beim Laden
- Klassen-basiertes Dark Mode: `.dark`-Klasse wird auf `<html>` gesetzt
- Tailwind CSS v4 erfordert exakte Syntax in `globals.css`: `@custom-variant dark (&:where(.dark, .dark *))`
- Alle Seiten und Komponenten haben `dark:`-Klassen für Hintergrund, Text, Rahmen

### 9. 404-Seite
- `app/not-found.tsx` — wird von Next.js automatisch angezeigt wenn `notFound()` gerufen wird
- Zeigt: rote große "404"-Zahl, Titel "Seite nicht gefunden", erklärenden Text, "Zurück zum Dashboard"-Button
- `app/kunden/[id]/page.tsx` ruft `notFound()` wenn die ID nicht in der CSV existiert
- Testbar unter jeder ungültigen URL, z.B. `/kunden/9999`

---

## Gelöste Bugs

| Problem | Ursache | Lösung |
|---|---|---|
| Dark Mode ließ sich nicht zurückschalten | `classList.toggle("dark", false)` ist in manchen Browsern unzuverlässig | Explizit `classList.add("dark")` bzw. `classList.remove("dark")` |
| Dark Mode CSS wirkte gar nicht | Falsche Tailwind v4 Syntax (`@variant dark`) | `@custom-variant dark (&:where(.dark, .dark *))` |
| Hydration-Fehler beim Laden | Inline-Script setzt `dark`-Klasse vor React-Hydration → Mismatch | `suppressHydrationWarning` auf `<html>` in `layout.tsx` |
| Volumen-Berechnung funktionierte nicht | `setFormData({...formData, ...})` nutzte veralteten State | Functional update: `setFormData((prev) => {...prev, volumen_eur: ...})` |
| `null`-Fehler in Berichte/Pipeline | Ein Eintrag (Kreativpoint) hatte kein Volumen gespeichert | `(eintrag.volumen_eur ?? 0)` in allen betroffenen Dateien |
| Doppelter `Link`-Import | Beim Hinzufügen des Pipeline-Abschnitts wurde Link zweimal importiert | Doppelten Import entfernt |

---

## Neue & geänderte Dateien

### Neu erstellt
```
app/pipeline/page.tsx                         — Pipeline-Übersichtsseite
app/pipeline/pipeline-client.tsx              — Tabelle mit Inline-Status-Editing
app/pipeline/[id]/page.tsx                    — Pipeline-Detail (Server Component)
app/pipeline/[id]/pipeline-detail-client.tsx  — Edit-Formular für Pipeline-Eintrag
app/pipeline/neu/page.tsx                     — Neuer Pipeline-Eintrag (mit URL-Params)
app/berichte/page.tsx                         — Berichte-Seite
app/berichte/berichte-client.tsx              — Auswertungs-Charts/Tabellen
app/status-badge.tsx                          — Wiederverwendbarer Status-Badge
app/theme-toggle.tsx                          — Dark/Light Mode Toggle
app/not-found.tsx                             — 404-Seite
app/api/kunden/route.ts                       — POST: neuen Kunden anlegen
app/api/kunden/[id]/route.ts                  — PATCH: Kunden-Felder aktualisieren
app/api/pipeline/route.ts                     — POST: neuen Pipeline-Eintrag anlegen
app/api/pipeline/[id]/route.ts                — PATCH: Pipeline-Felder aktualisieren
```

### Geändert
```
app/layout.tsx                           — Inline-Script für Theme, suppressHydrationWarning
app/globals.css                          — Dark-Mode-Variante für Tailwind v4
app/nav.tsx                              — ThemeToggle eingefügt, dark:-Klassen, neue Links
app/kunden/[id]/page.tsx                 — notFound() bei ungültiger ID, Pipeline-Einträge laden
app/kunden/[id]/kunde-detail-client.tsx  — Pipeline-Abschnitt, "+ Neuer Eintrag"-Button
lib/data.ts                              — getPipelineEintrag(id) hinzugefügt
```
