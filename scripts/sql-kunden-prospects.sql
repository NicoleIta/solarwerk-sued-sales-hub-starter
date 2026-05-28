-- 12 Interessenten als Kunden anlegen
-- Diese Firmen sind in solarwerk_pipeline.csv vorhanden,
-- aber noch nicht in der kunden-Tabelle.
-- Erst nach diesem INSERT können die Pipeline-Einträge
-- für diese Firmen eingefügt werden (FK-Constraint).
--
-- Reihenfolge: Dieses Statement VOR sql-pipeline-inserts.sql ausführen.

INSERT INTO kunden (firma, ansprechpartner, branche, anlagengroesse_kwp, status, letzter_kontakt, telefon, email, notiz)
VALUES
  (
    'Druckhaus Lindauer',
    'Martin Lindauer',
    'Industrie',
    95,
    'aktiv',
    '2026-04-20',
    '',
    '',
    'Interessent. Anfrage ueber Website. Termin fuer Erstgespraech am 15.05.'
  ),
  (
    'Obsthof Berger',
    'Claudia Berger',
    'Landwirtschaft',
    130,
    'aktiv',
    '2026-04-15',
    '',
    '',
    'Interessent. Kuehlhalle fuer Obstlagerung. Hoher Sommerverbrauch.'
  ),
  (
    'Sporthotel Weitblick',
    'Juergen Hintermeier',
    'Gewerbe',
    180,
    'aktiv',
    '2026-03-28',
    '',
    '',
    'Interessent. Angebot versendet. Foerderberatung laeuft parallel.'
  ),
  (
    'Baeckerei Kronenbrot',
    'Stefanie Kronenberger',
    'Handwerk',
    42,
    'aktiv',
    '2026-04-02',
    '',
    '',
    'Interessent. Angebot fuer Backstube und Laden. Dachstatik geprueft.'
  ),
  (
    'Metallwerk Donau GmbH',
    'Karl-Heinz Riedl',
    'Industrie',
    350,
    'aktiv',
    '2026-03-10',
    '',
    '',
    'Interessent. Verhandlung ueber Zahlungskonditionen. Foerderzusage erwartet.'
  ),
  (
    'Weingut Am Sonnenberg',
    'Elisabeth Frey',
    'Landwirtschaft',
    75,
    'aktiv',
    '2026-04-08',
    '',
    '',
    'Interessent. Interesse an Agri-PV. Erste Begehung geplant.'
  ),
  (
    'Fitnessstudio PowerZone',
    'Timo Albrecht',
    'Gewerbe',
    60,
    'aktiv',
    '2026-04-25',
    '',
    '',
    'Interessent. Klimaanlage verursacht hohe Kosten. PV soll entlasten.'
  ),
  (
    'Weber Maschinenbau AG',
    'Iris Weber',
    'Industrie',
    480,
    'aktiv',
    '2026-02-14',
    '',
    '',
    'Interessent. Grossauftrag. Technische Klaerung Netzanschluss laeuft.'
  ),
  (
    'Blumengrossmarkt Suedwest',
    'Gerhard Pfaff',
    'Gewerbe',
    110,
    'aktiv',
    '2026-05-02',
    '',
    '',
    'Interessent. Halle mit Kuehlzellen. Stromkosten ueber 80.000 EUR p.a.'
  ),
  (
    'Tischlerei Seefeld',
    'Monika Seefeld',
    'Handwerk',
    35,
    'aktiv',
    '2026-04-30',
    '',
    '',
    'Interessent. Kleine Werkstatt. Budget knapp. Foerderprogramme pruefen.'
  ),
  (
    'Kaeserei Allgaeuer Gold',
    'Anton Schmid',
    'Landwirtschaft',
    200,
    'aktiv',
    '2026-03-20',
    '',
    '',
    'Interessent. Kaesereifung braucht konstante Kuehlung. Speicher im Angebot. 2026.02.20 - Leider kein Auftrag, Kunde hat sich fuer anderen Anbieter entschieden.'
  ),
  (
    'Stadtwerke Mering',
    'Dr. Ulrich Fink',
    'Gewerbe',
    650,
    'aktiv',
    '2026-01-18',
    '',
    '',
    'Interessent gewonnen. Zuschlag erteilt. Projektstart Q3 2026. Groesstes Pipeline-Projekt.'
  );
