# docs/

In diesem Ordner liegen Spezifikationen (Specs) für Features, die im Sales-Hub gebaut werden.

## Warum Specs?

Beim Vibe Coding ist die Versuchung groß, sofort Claude Code zu prompten und zu schauen, was rauskommt. Das funktioniert für triviale Aufgaben — bei substanziellen Features führt es zu Code, der zwar funktioniert, aber wichtige Edge Cases übersieht oder Architektur-Entscheidungen still trifft, die später teuer werden.

Eine Spec zwingt Dich, vor dem Prompten durchzudenken:
- Was genau soll passieren?
- Welche Eingaben gibt es?
- Welche Architektur-Entscheidung treffe ich, und warum?
- Welche Edge Cases muss ich abdecken?

Mit einer guten Spec wird der Prompt an Claude Code präzise. Ohne Spec ist der Prompt ein Wunsch — und Claude füllt die Lücken, oft anders, als Du es wolltest.

## Workflow

Für jede substanzielle Aufgabe:

1. **`docs/spec-template.md` als Vorlage nehmen** und als `docs/spec-aufgabe-X.md` kopieren (X = sprechender Name, z.B. `spec-validation-kunde.md`)
2. **Vorlage ausfüllen** — alle sechs Sektionen
3. **Spec von Claude reviewen lassen:** `"Lies meine Spec @docs/spec-aufgabe-X.md. Was fehlt, was ist unklar, was würdest du anders machen?"`
4. **Spec ggf. überarbeiten** basierend auf dem Review
5. **Erst dann implementieren:** `"Implementiere die Spec aus @docs/spec-aufgabe-X.md. Nutze Plan Mode."`
6. **Edge Cases testen** — alle Akzeptanzkriterien live durchklicken
7. **Code-Review** — die zentrale Datei in Cursor öffnen und durchlesen
8. **Commit + Push**

## Spec-Dateien committen?

Ja. Die Specs sind Teil der Doku des Projekts und gehören ins Repo. Wer später Code anschauen will, sieht in der Spec, warum welche Entscheidung getroffen wurde — das ist wertvoller als jeder Code-Kommentar.
