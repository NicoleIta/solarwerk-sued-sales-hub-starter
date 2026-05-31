-- Pipeline Seed-Script (sicher wiederholbar)
-- Reihenfolge: erst Interessenten in kunden einfügen, dann Pipeline-Einträge.
-- WHERE NOT EXISTS verhindert Duplikate bei mehrfacher Ausführung.
--
-- Im Supabase SQL Editor ausführen: dieses Script komplett kopieren → Run

-- ============================================================
-- SCHRITT 1: Interessenten in kunden-Tabelle einfügen
-- ============================================================

INSERT INTO kunden (firma, ansprechpartner, branche, anlagengroesse_kwp, status, letzter_kontakt, telefon, email, notiz)
SELECT 'Druckhaus Lindauer', 'Martin Lindauer', 'Industrie', 95, 'aktiv', '2026-04-20', '', '', 'Interessent. Anfrage ueber Website.'
WHERE NOT EXISTS (SELECT 1 FROM kunden WHERE firma = 'Druckhaus Lindauer');

INSERT INTO kunden (firma, ansprechpartner, branche, anlagengroesse_kwp, status, letzter_kontakt, telefon, email, notiz)
SELECT 'Obsthof Berger', 'Claudia Berger', 'Landwirtschaft', 130, 'aktiv', '2026-04-15', '', '', 'Interessent. Kuehlhalle fuer Obstlagerung.'
WHERE NOT EXISTS (SELECT 1 FROM kunden WHERE firma = 'Obsthof Berger');

INSERT INTO kunden (firma, ansprechpartner, branche, anlagengroesse_kwp, status, letzter_kontakt, telefon, email, notiz)
SELECT 'Sporthotel Weitblick', 'Juergen Hintermeier', 'Gewerbe', 180, 'aktiv', '2026-03-28', '', '', 'Interessent. Angebot versendet.'
WHERE NOT EXISTS (SELECT 1 FROM kunden WHERE firma = 'Sporthotel Weitblick');

INSERT INTO kunden (firma, ansprechpartner, branche, anlagengroesse_kwp, status, letzter_kontakt, telefon, email, notiz)
SELECT 'Baeckerei Kronenbrot', 'Stefanie Kronenberger', 'Handwerk', 42, 'aktiv', '2026-04-02', '', '', 'Interessent. Angebot fuer Backstube.'
WHERE NOT EXISTS (SELECT 1 FROM kunden WHERE firma = 'Baeckerei Kronenbrot');

INSERT INTO kunden (firma, ansprechpartner, branche, anlagengroesse_kwp, status, letzter_kontakt, telefon, email, notiz)
SELECT 'Metallwerk Donau GmbH', 'Karl-Heinz Riedl', 'Industrie', 350, 'aktiv', '2026-03-10', '', '', 'Interessent. Verhandlung laeuft.'
WHERE NOT EXISTS (SELECT 1 FROM kunden WHERE firma = 'Metallwerk Donau GmbH');

INSERT INTO kunden (firma, ansprechpartner, branche, anlagengroesse_kwp, status, letzter_kontakt, telefon, email, notiz)
SELECT 'Weingut Am Sonnenberg', 'Elisabeth Frey', 'Landwirtschaft', 75, 'aktiv', '2026-04-08', '', '', 'Interessent. Interesse an Agri-PV.'
WHERE NOT EXISTS (SELECT 1 FROM kunden WHERE firma = 'Weingut Am Sonnenberg');

INSERT INTO kunden (firma, ansprechpartner, branche, anlagengroesse_kwp, status, letzter_kontakt, telefon, email, notiz)
SELECT 'Fitnessstudio PowerZone', 'Timo Albrecht', 'Gewerbe', 60, 'aktiv', '2026-04-25', '', '', 'Interessent. PV soll Klimaanlage entlasten.'
WHERE NOT EXISTS (SELECT 1 FROM kunden WHERE firma = 'Fitnessstudio PowerZone');

INSERT INTO kunden (firma, ansprechpartner, branche, anlagengroesse_kwp, status, letzter_kontakt, telefon, email, notiz)
SELECT 'Weber Maschinenbau AG', 'Iris Weber', 'Industrie', 480, 'aktiv', '2026-02-14', '', '', 'Interessent. Grossauftrag.'
WHERE NOT EXISTS (SELECT 1 FROM kunden WHERE firma = 'Weber Maschinenbau AG');

INSERT INTO kunden (firma, ansprechpartner, branche, anlagengroesse_kwp, status, letzter_kontakt, telefon, email, notiz)
SELECT 'Tischlerei Seefeld', 'Monika Seefeld', 'Handwerk', 35, 'aktiv', '2026-04-30', '', '', 'Interessent. Kleine Werkstatt.'
WHERE NOT EXISTS (SELECT 1 FROM kunden WHERE firma = 'Tischlerei Seefeld');

INSERT INTO kunden (firma, ansprechpartner, branche, anlagengroesse_kwp, status, letzter_kontakt, telefon, email, notiz)
SELECT 'Kaeserei Allgaeuer Gold', 'Anton Schmid', 'Landwirtschaft', 200, 'aktiv', '2026-03-20', '', '', 'Interessent. Kein Auftrag, anderer Anbieter.'
WHERE NOT EXISTS (SELECT 1 FROM kunden WHERE firma = 'Kaeserei Allgaeuer Gold');

INSERT INTO kunden (firma, ansprechpartner, branche, anlagengroesse_kwp, status, letzter_kontakt, telefon, email, notiz)
SELECT 'Stadtwerke Mering', 'Dr. Ulrich Fink', 'Gewerbe', 650, 'aktiv', '2026-01-18', '', '', 'Interessent gewonnen. Projektstart Q3 2026.'
WHERE NOT EXISTS (SELECT 1 FROM kunden WHERE firma = 'Stadtwerke Mering');

-- Firmen aus Pipeline-Inserts, die nicht im Prospects-Script stehen:
INSERT INTO kunden (firma, ansprechpartner, branche, anlagengroesse_kwp, status, letzter_kontakt, telefon, email, notiz)
SELECT 'Kreativpoint', 'unbekannt', 'Gewerbe', 100, 'aktiv', '2026-05-10', '', '', 'Interessent.'
WHERE NOT EXISTS (SELECT 1 FROM kunden WHERE firma = 'Kreativpoint');

INSERT INTO kunden (firma, ansprechpartner, branche, anlagengroesse_kwp, status, letzter_kontakt, telefon, email, notiz)
SELECT 'Reiterhof Sonnleitner', 'unbekannt', 'Landwirtschaft', 105, 'aktiv', '2026-05-20', '', '', 'Interessent.'
WHERE NOT EXISTS (SELECT 1 FROM kunden WHERE firma = 'Reiterhof Sonnleitner');

-- ============================================================
-- SCHRITT 2: Pipeline-Einträge einfügen
-- ============================================================

INSERT INTO pipeline (titel, status, betrag, datum, notizen, kunde_id)
SELECT 'Druckhaus Lindauer', 'erstkontakt', 89000, '2026-04-20', 'Anfrage ueber Website. Termin fuer Erstgespraech am 15.05.',
  (SELECT id FROM kunden WHERE firma = 'Druckhaus Lindauer' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM pipeline WHERE titel = 'Druckhaus Lindauer' AND datum = '2026-04-20');

INSERT INTO pipeline (titel, status, betrag, datum, notizen, kunde_id)
SELECT 'Obsthof Berger', 'erstkontakt', 124000, '2026-04-15', 'Kuehlhalle fuer Obstlagerung. Hoher Sommerverbrauch.',
  (SELECT id FROM kunden WHERE firma = 'Obsthof Berger' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM pipeline WHERE titel = 'Obsthof Berger' AND datum = '2026-04-15');

INSERT INTO pipeline (titel, status, betrag, datum, notizen, kunde_id)
SELECT 'Sporthotel Weitblick', 'angebot_raus', 168000, '2026-03-28', 'Angebot versendet. Foerderberatung laeuft parallel.',
  (SELECT id FROM kunden WHERE firma = 'Sporthotel Weitblick' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM pipeline WHERE titel = 'Sporthotel Weitblick' AND datum = '2026-03-28');

INSERT INTO pipeline (titel, status, betrag, datum, notizen, kunde_id)
SELECT 'Baeckerei Kronenbrot', 'angebot_raus', 38500, '2026-04-02', 'Angebot fuer Backstube und Laden. Dachstatik geprueft.',
  (SELECT id FROM kunden WHERE firma = 'Baeckerei Kronenbrot' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM pipeline WHERE titel = 'Baeckerei Kronenbrot' AND datum = '2026-04-02');

INSERT INTO pipeline (titel, status, betrag, datum, notizen, kunde_id)
SELECT 'Metallwerk Donau GmbH', 'verhandlung', 298000, '2026-03-10', 'Verhandlung ueber Zahlungskonditionen. Foerderzusage erwartet.',
  (SELECT id FROM kunden WHERE firma = 'Metallwerk Donau GmbH' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM pipeline WHERE titel = 'Metallwerk Donau GmbH' AND datum = '2026-03-10');

INSERT INTO pipeline (titel, status, betrag, datum, notizen, kunde_id)
SELECT 'Weingut Am Sonnenberg', 'erstkontakt', 68000, '2026-04-08', 'Interesse an Agri-PV. Erste Begehung geplant.',
  (SELECT id FROM kunden WHERE firma = 'Weingut Am Sonnenberg' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM pipeline WHERE titel = 'Weingut Am Sonnenberg' AND datum = '2026-04-08');

INSERT INTO pipeline (titel, status, betrag, datum, notizen, kunde_id)
SELECT 'Fitnessstudio PowerZone', 'angebot_raus', 54500, '2026-04-25', 'Klimaanlage verursacht hohe Kosten. PV soll entlasten.',
  (SELECT id FROM kunden WHERE firma = 'Fitnessstudio PowerZone' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM pipeline WHERE titel = 'Fitnessstudio PowerZone' AND datum = '2026-04-25');

INSERT INTO pipeline (titel, status, betrag, datum, notizen, kunde_id)
SELECT 'Weber Maschinenbau AG', 'verhandlung', 415000, '2026-02-14', 'Grossauftrag. Technische Klaerung Netzanschluss laeuft.',
  (SELECT id FROM kunden WHERE firma = 'Weber Maschinenbau AG' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM pipeline WHERE titel = 'Weber Maschinenbau AG' AND datum = '2026-02-14');

INSERT INTO pipeline (titel, status, betrag, datum, notizen, kunde_id)
SELECT 'Blumengrossmarkt Suedwest', 'erstkontakt', 98000, '2026-05-02', 'Halle mit Kuehlzellen. Stromkosten ueber 80.000 EUR p.a.',
  (SELECT id FROM kunden WHERE firma = 'Blumengrossmarkt Suedwest' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM pipeline WHERE titel = 'Blumengrossmarkt Suedwest' AND datum = '2026-05-02');

INSERT INTO pipeline (titel, status, betrag, datum, notizen, kunde_id)
SELECT 'Tischlerei Seefeld', 'erstkontakt', 32000, '2026-04-30', 'Kleine Werkstatt. Budget knapp. Foerderprogramme pruefen.',
  (SELECT id FROM kunden WHERE firma = 'Tischlerei Seefeld' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM pipeline WHERE titel = 'Tischlerei Seefeld' AND datum = '2026-04-30');

INSERT INTO pipeline (titel, status, betrag, datum, notizen, kunde_id)
SELECT 'Kaeserei Allgaeuer Gold', 'verloren', 185000, '2026-03-20', 'Kunde hat sich fuer anderen Anbieter entschieden.',
  (SELECT id FROM kunden WHERE firma = 'Kaeserei Allgaeuer Gold' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM pipeline WHERE titel = 'Kaeserei Allgaeuer Gold' AND datum = '2026-03-20');

INSERT INTO pipeline (titel, status, betrag, datum, notizen, kunde_id)
SELECT 'Stadtwerke Mering', 'gewonnen', 580000, '2026-01-18', 'Zuschlag erteilt. Projektstart Q3 2026. Groesstes Pipeline-Projekt.',
  (SELECT id FROM kunden WHERE firma = 'Stadtwerke Mering' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM pipeline WHERE titel = 'Stadtwerke Mering' AND datum = '2026-01-18');

INSERT INTO pipeline (titel, status, betrag, datum, notizen, kunde_id)
SELECT 'Kreativpoint', 'angebot_raus', 90000, '2026-05-10', 'Der Kunde wurde kontaktiert.',
  (SELECT id FROM kunden WHERE firma = 'Kreativpoint' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM pipeline WHERE titel = 'Kreativpoint' AND datum = '2026-05-10');

INSERT INTO pipeline (titel, status, betrag, datum, notizen, kunde_id)
SELECT 'Huber Schreinerei GmbH', 'gewonnen', 135000, '2026-05-20', 'Der Kunde hat das Angebot akzeptiert.',
  (SELECT id FROM kunden WHERE firma = 'Huber Schreinerei GmbH' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM pipeline WHERE titel = 'Huber Schreinerei GmbH' AND datum = '2026-05-20');

INSERT INTO pipeline (titel, status, betrag, datum, notizen, kunde_id)
SELECT 'ArtScheune', 'angebot_raus', 135000, '2026-05-20', 'Das Angebot wurde an den Kunden zugesendet.',
  (SELECT id FROM kunden WHERE firma = 'ArtScheune' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM pipeline WHERE titel = 'ArtScheune' AND datum = '2026-05-20');

INSERT INTO pipeline (titel, status, betrag, datum, notizen, kunde_id)
SELECT 'Mueller Fensterbau GmbH', 'angebot_raus', 76500, '2026-05-20', 'Das Angebot wurde erstellt.',
  (SELECT id FROM kunden WHERE firma = 'Mueller Fensterbau GmbH' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM pipeline WHERE titel = 'Mueller Fensterbau GmbH' AND datum = '2026-05-20');

INSERT INTO pipeline (titel, status, betrag, datum, notizen, kunde_id)
SELECT 'Malereisterbetrieb Mirco Brückner', 'gewonnen', 67500, '2026-05-20', 'Wir haben den Kunden gewonnen.',
  (SELECT id FROM kunden WHERE firma = 'Malereisterbetrieb Mirco Brückner' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM pipeline WHERE titel = 'Malereisterbetrieb Mirco Brückner' AND datum = '2026-05-20');

INSERT INTO pipeline (titel, status, betrag, datum, notizen, kunde_id)
SELECT 'Reiterhof Sonnleitner', 'angebot_raus', 94500, '2026-05-20', 'Angebot versendet.',
  (SELECT id FROM kunden WHERE firma = 'Reiterhof Sonnleitner' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM pipeline WHERE titel = 'Reiterhof Sonnleitner' AND datum = '2026-05-20');

INSERT INTO pipeline (titel, status, betrag, datum, notizen, kunde_id)
SELECT 'Bäckerei Becker GmbH', 'angebot_raus', 72000, '2026-05-22', 'Angebot erstellt. Warten auf Kunden Feedback.',
  (SELECT id FROM kunden WHERE firma = 'Bäckerei Becker GmbH' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM pipeline WHERE titel = 'Bäckerei Becker GmbH' AND datum::date = '2026-05-22' AND status = 'angebot_raus');

INSERT INTO pipeline (titel, status, betrag, datum, notizen, kunde_id)
SELECT 'Bäckerei Becker GmbH', 'gewonnen', 90000, '2026-05-22', 'Der Kunde hat das Angebot angenommen.',
  (SELECT id FROM kunden WHERE firma = 'Bäckerei Becker GmbH' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM pipeline WHERE titel = 'Bäckerei Becker GmbH' AND datum::date = '2026-05-22' AND status = 'gewonnen');
