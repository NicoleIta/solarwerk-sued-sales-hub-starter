# Spec: Promptfoo Einrichtung & Eval-Infrastruktur

## Zweck
Promptfoo wird als Eval-Werkzeug im Repo eingerichtet, sodass Prompts lokal testbar sind. Ein GitHub-Actions-Workflow führt die Evals automatisch bei jedem Pull Request aus.

---

## Inputs
- `OPENROUTER_API_KEY` (string, bereits in `.env.local` vorhanden — wird zusätzlich als GitHub Repository Secret hinterlegt)
- Bestehende E-Mail-Draft Server Action (`app/actions/generate-email.ts`) als Vorlage für den Prompt-Text
- Neue Dateien: `promptfooconfig.yaml`, `prompts/email-draft.md`, `.github/workflows/eval.yml`

---

## Verhalten
1. Node.js-Version prüfen: `node --version` muss `^20.20.0` oder `>=22.22.0` sein
2. Promptfoo global installieren: `npm install -g promptfoo`
3. Im Repo-Wurzelverzeichnis initialisieren: `promptfoo init` — erstellt Grundgerüst für `promptfooconfig.yaml`
4. `prompts/`-Ordner anlegen, erste Prompt-Datei `email-draft.md` erstellen
5. `promptfooconfig.yaml` konfigurieren: Provider auf OpenRouter, Prompt-Datei referenzieren
6. Lokal testen: `promptfoo eval` — muss ohne Fehler durchlaufen
7. `.github/workflows/eval.yml` anlegen mit `paths`-Trigger auf `prompts/**` und `promptfooconfig.yaml`
8. `OPENROUTER_API_KEY` als Repository Secret unter GitHub Settings → Secrets → Actions hinterlegen ("New repository secret")
9. Test-PR mit Änderung in `prompts/` erstellen — Workflow muss im Actions-Tab erscheinen und automatisch triggern

---

## Architektur-Entscheidungen

### Entscheidung 1: Globale Installation statt lokal oder npx
- Gewählt: `npm install -g promptfoo`
- Alternative wäre: `npm install promptfoo --save-dev` oder `npx promptfoo@latest`
- Warum diese: Globale Installation macht den `promptfoo`-Befehl direkt in der CLI verfügbar ohne Prefix. Einfacher für lokale Iteration während der Eval-Entwicklung.

### Entscheidung 2: GitHub Repository Secret für API-Key
- Gewählt: `OPENROUTER_API_KEY` als verschlüsseltes Repository Secret hinterlegen
- Alternative wäre: API-Key direkt im Workflow-File als Klartext-Variable
- Warum diese: Secrets sind verschlüsselt und nicht im Code sichtbar. Standard-Praxis für API-Keys in CI/CD — verhindert, dass der Key in der Git-History landet.

### Entscheidung 3: Prompts als .md-Dateien
- Gewählt: `prompts/email-draft.md`
- Alternative wäre: `prompts/email-draft.txt`
- Warum diese: Markdown-Dateien rendern in GitHub-PRs als formatierter Diff — Prompt-Änderungen sind sofort lesbar, ohne Raw-Text-Ansicht aufrufen zu müssen.

---

## Edge Cases

1. Was passiert bei: Node.js-Version älter als 20.20.0
   Erwartetes Verhalten: `npm install -g promptfoo` schlägt fehl mit Hinweis auf die Node-Version. Lösung: Node aktualisieren (nvm oder direkt von nodejs.org).

2. Was passiert bei: `OPENROUTER_API_KEY` fehlt als GitHub Secret
   Erwartetes Verhalten: GitHub-Actions-Workflow startet, aber LLM-Aufrufe schlagen mit 401 Unauthorized fehl. Deterministische Checks laufen durch, LLM-as-Judge-Checks nicht.

3. Was passiert bei: `eval.yml` liegt in falschem Verzeichnis (z.B. `.github/eval.yml` statt `.github/workflows/eval.yml`)
   Erwartetes Verhalten: GitHub erkennt den Workflow nicht — kein Eintrag im Actions-Tab, keine automatische Triggerung.

4. Was passiert bei: `promptfooconfig.yaml` enthält Syntaxfehler
   Erwartetes Verhalten: `promptfoo eval` bricht sofort mit YAML-Parse-Fehler ab und zeigt Zeile und Spalte des Fehlers an.

---

## Akzeptanzkriterien
- [ ] `node --version` gibt `^20.20.0` oder `>=22` aus
- [ ] `promptfoo --version` gibt eine Versionsnummer aus (Installation erfolgreich)
- [ ] `prompts/`-Ordner existiert mit mind. einer `.md`-Datei
- [ ] `promptfoo eval` läuft lokal ohne Fehler durch
- [ ] `.github/workflows/eval.yml` ist im Repo vorhanden und erscheint im GitHub Actions-Tab
- [ ] PR mit Änderung in `prompts/` triggert den Workflow automatisch
- [ ] `OPENROUTER_API_KEY` ist unter GitHub Settings → Secrets → Actions als Repository Secret sichtbar (Name sichtbar, Wert verschlüsselt)
- [ ] Alle Edge Cases aus dem Abschnitt oben sind getestet
