# Spec: FilterBar — Kombinierbare, kaskadierende Filter

## Zweck

Die `FilterBar`-Komponente rendert mehrere Filter-Eingaben (Dropdowns und Textfeld) nebeneinander in einer horizontalen Leiste und gibt Änderungen per Callback nach oben weiter. Jedes Dropdown zeigt nur die Optionen, die im durch alle anderen aktiven Filter gefilterten Datensatz noch vorhanden sind — sogenannte **kaskadierende Filter**.

---

## Inputs

- `filters: FilterDefinition[]` — Array von Filter-Definitionen; jede enthält: `key` (eindeutiger Name), `label` (Platzhalter-Text), `type` (`"select"` oder `"text"`), `options` (bei select: Array von `{ value, label }`), optional `className` für Breite
- `values: FilterValues` — Aktueller Filterzustand als `Record<string, string>`; leerer String bedeutet "kein Filter aktiv"
- `onChange: (values: FilterValues) => void` — Callback, der bei jeder Änderung das vollständige, aktualisierte `values`-Objekt liefert

---

## Verhalten

1. FilterBar rendert die Filter in der Reihenfolge des `filters`-Arrays
2. Für `type: "select"`: ein `<select>` mit einer Reset-Option (leerer Wert = "Alle …") und den übergebenen `options`
3. Für `type: "text"`: ein `<input type="text">` mit dem `label` als Platzhalter
4. Nutzer ändert einen Filter → der neue Wert wird in das bestehende `values`-Objekt gemergt → `onChange` wird mit dem vollständigen neuen Objekt aufgerufen
5. Der Consumer (z.B. `dashboard-client.tsx`) empfängt das neue `values`-Objekt, berechnet daraus die gefilterte Liste **und** die neuen Options-Arrays für alle anderen Selects
6. React re-rendert die FilterBar mit den aktualisierten `options` → Dropdown zeigt nur noch passende Werte

---

## Architektur-Entscheidungen

### Entscheidung 1: Kaskadier-Logik im Consumer, nicht in FilterBar

- **Gewählt:** Die FilterBar ist data-agnostisch — sie berechnet keine Options-Arrays. Der Consumer übergibt fertig berechnete `options` per Props.
- **Alternative wäre:** FilterBar erhält den Rohdatensatz und berechnet selbst, welche Optionen sichtbar sind.
- **Warum diese:** Eine Komponente mit eingebetteter Business-Logik ist schwer wiederverwendbar. Durch die Trennung kann dieselbe FilterBar in Kunden-, Pipeline- und anderen Listen genutzt werden, ohne den Datensatz-Typ zu kennen.

### Entscheidung 2: Leerer String als "kein Filter"-Sentinel

- **Gewählt:** `""` (leerer String) signalisiert "kein Filter aktiv"; die Reset-Option im Select hat `value=""`.
- **Alternative wäre:** `undefined` oder ein spezieller Wert wie `"alle"`.
- **Warum diese:** HTML-Inputs und Selects geben immer Strings zurück; `undefined` würde React zwischen controlled/uncontrolled wechseln lassen. Leerer String vermeidet dieses Problem ohne Type-Casts.

### Entscheidung 3: Typen im selben File wie die Komponente

- **Gewählt:** `FilterValues`, `FilterDefinition`, `FilterOption`, `FilterBarProps` sind alle in `components/filter-bar.tsx` exportiert.
- **Alternative wäre:** Typen in `types/index.ts` auslagern.
- **Warum diese:** Diese Typen beschreiben ausschließlich die API der FilterBar-Komponente; sie gehören eng zu ihr. Wer die Komponente importiert, kann alle nötigen Typen aus derselben Datei holen.

---

## Edge Cases

1. **Was passiert bei:** einem Dropdown, dessen alle Optionen durch andere aktive Filter weggefiltert wurden (z.B. Branche "Solar" existiert nicht für Status "Beschwerde")
   **Erwartetes Verhalten:** Das Dropdown zeigt nur die Reset-Option ("Alle Branchen"), kein Absturz; der Consumer liefert ein leeres `options`-Array

2. **Was passiert bei:** einem aktiven Filterwert (z.B. Status "Beschwerde"), der nach Setzen eines anderen Filters (Branche "Industrie") nicht mehr in den Optionen erscheint — aber noch in `filterValues` steht
   **Erwartetes Verhalten:** Die Tabelle zeigt 0 Ergebnisse, weil beide Filter aktiv sind und sich gegenseitig ausschließen; der Nutzer muss einen der Filter manuell zurücksetzen (kein automatisches Zurücksetzen)

3. **Was passiert bei:** Suchbegriff mit Sonderzeichen wie `&`, `.`, `(`, `)` (z.B. "GmbH & Co.")
   **Erwartetes Verhalten:** `toLowerCase().includes()` behandelt diese als Literale — keine Regex-Fehler, Suche funktioniert korrekt

4. **Was passiert bei:** der FilterBar auf einem Mobilgerät (schmaler Viewport)
   **Erwartetes Verhalten:** Filter stacken vertikal durch `flex-col` auf kleinen Screens, wechseln zu `flex-row` ab `sm`-Breakpoint

---

## Akzeptanzkriterien

- [ ] Drei Filter werden nebeneinander angezeigt: Status-Dropdown, Branche-Dropdown, Suchfeld
- [ ] Status = "In Wartung" setzen → Branche-Dropdown zeigt ausschließlich Branchen von Kunden in Wartung
- [ ] Branche setzen (ohne Status) → Status-Dropdown zeigt ausschließlich Status-Werte der gewählten Branche
- [ ] Alle drei Filter gleichzeitig aktiv → Tabelle zeigt nur Kunden, die alle drei Kriterien erfüllen (AND-Logik)
- [ ] Filter auf leer zurücksetzen → alle Optionen des anderen Dropdowns erscheinen wieder vollständig
- [ ] Suchbegriff eingeben → beide Dropdowns passen ihre Optionen in Echtzeit an
- [ ] Dark Mode: alle Filter-Elemente sind korrekt gestylt (`dark:bg-gray-800` etc.)
- [ ] Kein Dropdown zeigt Optionen, die zu 0 Treffern führen würden
- [ ] **Alle Edge Cases aus dem Abschnitt oben sind getestet**
