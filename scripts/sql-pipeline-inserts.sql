-- Pipeline Mock-Daten einfügen — alle 20 Einträge
-- Spec: spec-pipeline-tabelle-foreign-key.md
--
-- Reihenfolge:
--   1. scripts/sql-pipeline-create.sql   → Tabelle anlegen
--   2. scripts/sql-kunden-prospects.sql  → 12 Interessenten als Kunden anlegen
--   3. dieses Statement                  → alle 20 Pipeline-Einträge einfügen
--
-- kunde_id wird per SELECT-Subquery aufgelöst.
-- Schlägt ein Firmenname fehl → klare FK-Fehlermeldung, kein stiller Fehler.

INSERT INTO pipeline (titel, status, betrag, datum, notizen, kunde_id)
VALUES
  (
    'Druckhaus Lindauer',
    'erstkontakt',
    89000,
    '2026-04-20',
    'Anfrage ueber Website. Termin fuer Erstgespraech am 15.05.',
    (SELECT id FROM kunden WHERE firma = 'Druckhaus Lindauer')
  ),
  (
    'Obsthof Berger',
    'erstkontakt',
    124000,
    '2026-04-15',
    'Kuehlhalle fuer Obstlagerung. Hoher Sommerverbrauch.',
    (SELECT id FROM kunden WHERE firma = 'Obsthof Berger')
  ),
  (
    'Sporthotel Weitblick',
    'angebot_raus',
    168000,
    '2026-03-28',
    'Angebot versendet. Foerderberatung laeuft parallel.',
    (SELECT id FROM kunden WHERE firma = 'Sporthotel Weitblick')
  ),
  (
    'Baeckerei Kronenbrot',
    'angebot_raus',
    38500,
    '2026-04-02',
    'Angebot fuer Backstube und Laden. Dachstatik geprueft.',
    (SELECT id FROM kunden WHERE firma = 'Baeckerei Kronenbrot')
  ),
  (
    'Metallwerk Donau GmbH',
    'verhandlung',
    298000,
    '2026-03-10',
    'Verhandlung ueber Zahlungskonditionen. Foerderzusage erwartet.',
    (SELECT id FROM kunden WHERE firma = 'Metallwerk Donau GmbH')
  ),
  (
    'Weingut Am Sonnenberg',
    'erstkontakt',
    68000,
    '2026-04-08',
    'Interesse an Agri-PV. Erste Begehung geplant.',
    (SELECT id FROM kunden WHERE firma = 'Weingut Am Sonnenberg')
  ),
  (
    'Fitnessstudio PowerZone',
    'angebot_raus',
    54500,
    '2026-04-25',
    'Klimaanlage verursacht hohe Kosten. PV soll entlasten.',
    (SELECT id FROM kunden WHERE firma = 'Fitnessstudio PowerZone')
  ),
  (
    'Weber Maschinenbau AG',
    'verhandlung',
    415000,
    '2026-02-14',
    'Grossauftrag. Technische Klaerung Netzanschluss laeuft.',
    (SELECT id FROM kunden WHERE firma = 'Weber Maschinenbau AG')
  ),
  (
    'Blumengrossmarkt Suedwest',
    'erstkontakt',
    98000,
    '2026-05-02',
    'Halle mit Kuehlzellen. Stromkosten ueber 80.000 EUR p.a.',
    (SELECT id FROM kunden WHERE firma = 'Blumengrossmarkt Suedwest')
  ),
  (
    'Tischlerei Seefeld',
    'erstkontakt',
    32000,
    '2026-04-30',
    'Kleine Werkstatt. Budget knapp. Foerderprogramme pruefen.',
    (SELECT id FROM kunden WHERE firma = 'Tischlerei Seefeld')
  ),
  (
    'Kaeserei Allgaeuer Gold',
    'verloren',
    185000,
    '2026-03-20',
    'Kaesereifung braucht konstante Kuehlung. Speicher im Angebot. 2026.02.20 - Leider kein Auftrag, Kunde hat sich fuer anderen Anbieter entschieden.',
    (SELECT id FROM kunden WHERE firma = 'Kaeserei Allgaeuer Gold')
  ),
  (
    'Stadtwerke Mering',
    'gewonnen',
    580000,
    '2026-01-18',
    'Zuschlag erteilt. Projektstart Q3 2026. Groesstes Pipeline-Projekt.',
    (SELECT id FROM kunden WHERE firma = 'Stadtwerke Mering')
  ),
  (
    'Kreativpoint',
    'angebot_raus',
    90000,
    '2026-05-10',
    'Der Kunde wurde kontaktiert.',
    (SELECT id FROM kunden WHERE firma = 'Kreativpoint')
  ),
  (
    'Huber Schreinerei GmbH',
    'gewonnen',
    135000,
    '2026-05-20',
    '26.05.20_Wir verhandeln immer noch mit dem Kunden. 26.05.20_Der Kunde hat das Angebot akzeptiert.',
    (SELECT id FROM kunden WHERE firma = 'Huber Schreinerei GmbH')
  ),
  (
    'ArtScheune',
    'angebot_raus',
    135000,
    '2026-05-20',
    '26.05.20_Das Angebot wurde an den Kunden zugesendet.',
    (SELECT id FROM kunden WHERE firma = 'ArtScheune')
  ),
  (
    'Mueller Fensterbau GmbH',
    'angebot_raus',
    76500,
    '2026-05-20',
    '2026.05.20 - Das Angebot wurde erstellt.',
    (SELECT id FROM kunden WHERE firma = 'Mueller Fensterbau GmbH')
  ),
  (
    'Malereisterbetrieb Mirco Brückner',
    'gewonnen',
    67500,
    '2026-05-20',
    '2026.05.20 - Ueber das Angebot muss noch verhandelt werden. 2026.05.20 - Wir haben den Kunden gewonnen.',
    (SELECT id FROM kunden WHERE firma = 'Malereisterbetrieb Mirco Brückner')
  ),
  (
    'Reiterhof Sonnleitner',
    'angebot_raus',
    94500,
    '2026-05-20',
    '2026.05.20 - Angebot versendet.',
    (SELECT id FROM kunden WHERE firma = 'Reiterhof Sonnleitner')
  ),
  (
    'Bäckerei Becker GmbH',
    'angebot_raus',
    72000,
    '2026-05-22',
    'Angebot erstellt. Warten auf Kunden Feedback.',
    (SELECT id FROM kunden WHERE firma = 'Bäckerei Becker GmbH')
  ),
  (
    'Bäckerei Becker GmbH',
    'gewonnen',
    90000,
    '2026-05-22',
    'Der Kunde hat das Angebot angenommen.',
    (SELECT id FROM kunden WHERE firma = 'Bäckerei Becker GmbH')
  );
