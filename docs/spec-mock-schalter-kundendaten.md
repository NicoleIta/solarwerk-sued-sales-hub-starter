# Spec: Mock-Schalter für Kundendaten

## Zweck
Der Mock-Schalter steuert, welchen Zustand die Kundenliste beim Laden simuliert,
damit alle UI-Zustände (Laden, Fehler, leer) ohne Änderung an echten Daten testbar
sind. Er ist ausschließlich für die Entwicklungsphase gedacht und soll in Production
nie aktiv sein.

---

## Inputs
- `NEXT_PUBLIC_MOCK_MODE` — Umgebungsvariable (string: `'normal'|'loading'|'error'|'empty'`), gesetzt in `.env.local`

---

## Verhalten
1. Entwickler setzt `NEXT_PUBLIC_MOCK_MODE` auf den gewünschten Wert in `.env.local`.
2. Dev-Server wird neu gestartet (Env-Variablen werden beim Start gelesen).
3. `getKunden()` wird vom Dashboard aufgerufen.
4. Bei `'loading'`: 1,5s Verzögerung, dann echte CSV-Daten zurück. Bei `'error'`: `throw new Error('Mock-Fehler')`. Bei `'empty'`: leeres Array `[]` zurück. Bei `'normal'` (oder fehlendem Wert): echte CSV-Daten via `ladeKundenAusCsv()`.
5. UI reagiert auf den jeweiligen Zustand (Spinner, Fehlermeldung, leere Liste oder Daten).

---

## Architektur-Entscheidungen

### Entscheidung 1: Mock-Steuerung über .env-Variable statt Code-Variable
- **Gewählt:** `NEXT_PUBLIC_MOCK_MODE` als Umgebungsvariable in `.env.local`
- **Alternative wäre:** `let mockMode` als module-level Variable direkt in `lib/data.ts`
- **Warum diese:** Kein Code-Change nötig für Moduswechsel — nur `.env.local` anpassen und Server neu starten. Die Variable ist klar als Konfiguration erkennbar, nicht als Code.

### Entscheidung 2: Mock nur in Development aktiv
- **Gewählt:** Mock-Logik greift nur wenn `NODE_ENV === 'development'`
- **Alternative wäre:** Mock immer aktiv, wenn Variable gesetzt (auch in Production)
- **Warum diese:** Verhindert, dass Mock-Daten aus Versehen in Production landen — auch wenn die Variable versehentlich im Deployment gesetzt wird.

---

## Edge Cases

1. **Was passiert bei:** `NEXT_PUBLIC_MOCK_MODE` auf ungültigen Wert gesetzt (z.B. `'kaputt'`)
   **Erwartetes Verhalten:** Funktion fällt auf `'normal'` zurück, echte CSV-Daten werden geladen, kein Crash.

2. **Was passiert bei:** `NEXT_PUBLIC_MOCK_MODE` in Production gesetzt (Entwicklerfehler)
   **Erwartetes Verhalten:** Mock wird ignoriert (`NODE_ENV !== 'development'`), echte Daten werden immer geladen.

3. **Was passiert bei:** Modus `'error'` aktiv, aber UI hat kein Error-Boundary
   **Erwartetes Verhalten:** Next.js zeigt seine Standard-Fehlerseite — kein stiller Absturz, kein leeres UI.

---

## Akzeptanzkriterien
- [ ] Modus `'loading'`: Dashboard zeigt Lade-Spinner für ~1,5s, dann Kundenliste
- [ ] Modus `'error'`: Dashboard zeigt Fehler-Zustand (kein Crash, kein leeres UI)
- [ ] Modus `'empty'`: Kundenliste ist leer (0 Kunden, kein Fehler)
- [ ] Modus `'normal'`: Echte CSV-Daten werden geladen (25 Kunden erscheinen)
- [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
