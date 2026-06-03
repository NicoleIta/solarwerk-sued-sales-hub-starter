# Testdaten einpflegen

Ihr bekommt zwei Dateien als gemeinsame Testdaten-Grundlage:

- `solarwerk_kunden.csv` — Kunden
- `solarwerk_aktivitaeten.csv` — Aktivitäten (Anrufe, Mails, Termine)

Das ist eine **Vorlage**, kein fertiger Import. Ihr habt Euer eigenes Datenbank-Schema gebaut — andere Spaltennamen, eigene Struktur. Eure Aufgabe ist, die Daten in Eure bestehende Struktur einzupflegen: vorhandene Spalten zuordnen, fehlende ergänzen.

**Lasst Claude die eigentliche Arbeit machen** — gebt ihm die CSV und Euer Schema und lasst es die Daten passend einspielen. Prüft danach in Eurer App, dass die Daten richtig angekommen sind.

---

## Reihenfolge

1. **Kunden zuerst.** Die Kunden-Tabelle habt Ihr schon — die Kunden könnt Ihr gleich einpflegen.
2. **Aktivitäten danach.** Die gehören in die Aktivitäts-Tabelle, die wir gemeinsam bauen. Die Aktivitäten pflegt Ihr also erst ein, **nachdem** diese Tabelle steht.

---

## Worauf Ihr beim Einpflegen achtet

**Neue Spalten bei den Kunden.** Die Kunden-CSV hat drei Spalten, die Eure Tabelle wahrscheinlich noch nicht hat. Die ergänzt Ihr:
- `pipeline_stufe` — die Vertriebs-Stufe (Lead, Qualifiziert, Angebot, Verhandlung, Gewonnen, Verloren)
- `vertriebler` — wem der Kunde gehört
- `produkt_interesse` — das Paket, um das es gerade geht

**Verknüpfung der Aktivitäten.** In der Aktivitäten-CSV verweist die Spalte `kunde_id` auf die `id` eines Kunden. Achtet beim Einpflegen darauf, dass jede Aktivität am richtigen Kunden landet — wenn Eure eigenen Kunden-IDs anders vergeben sind, muss die Zuordnung trotzdem stimmen. Auch hier hilft Claude.

**Besitzer (`vertriebler`).** Falls Eure Kunden-Tabelle einen Besitzer führt: Verbindet die zwei Vertriebler-Namen mit Euren Nutzer-Logins, damit die Kunden auf die richtigen Besitzer verteilt sind. Claude hilft Euch dabei, wenn ein Feature das braucht.

---

## Kurz

CSV nehmen → Claude geben mit Eurem Schema → einspielen lassen → in der App prüfen. Kunden jetzt, Aktivitäten nach dem gemeinsamen Feature.
