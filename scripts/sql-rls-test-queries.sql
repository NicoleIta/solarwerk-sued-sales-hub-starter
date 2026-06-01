-- ============================================================
-- Spec 5: RLS-Verifikation — 4 Tests
--
-- Jeden Test einzeln ausführen, mit dem richtigen Account eingeloggt.
-- Im Supabase SQL-Editor: der eingeloggte Dashboard-User wird als auth.uid() verwendet.
-- Für Tests mit zwei Accounts: normales Fenster + Inkognito-Fenster.
-- ============================================================

-- ============================================================
-- TEST 1: Vertriebler sieht alle Kunden (SELECT)
--
-- Account: Vertriebler eingeloggt (z.B. felix@solarwerk-sued.de)
-- Erwartetes Ergebnis: alle 25 Kunden sichtbar
-- ============================================================
SELECT COUNT(*) AS sichtbare_kunden FROM kunden;
-- Erwartung: 25 (oder wie viele in der DB sind)

-- ============================================================
-- TEST 2: Leitung sieht alle Kunden (SELECT)
--
-- Account: Leitungs-Account eingeloggt (Inkognito-Fenster)
-- Erwartetes Ergebnis: alle 25 Kunden sichtbar
-- ============================================================
SELECT COUNT(*) AS sichtbare_kunden FROM kunden;
-- Erwartung: 25

-- ============================================================
-- TEST 3: Vertriebler kann fremden Kunden NICHT ändern
--
-- Account: Vertriebler eingeloggt
-- Voraussetzung: es gibt mind. einen Kunden der NICHT in kunden_owner für diesen Vertriebler steht
--
-- ERSETZE 'HIER-UUID-EINES-FREMDEN-KUNDEN' mit einer echten kunden.id
-- (eine id aus kunden die NICHT in kunden_owner für den Vertriebler steht)
-- ============================================================
UPDATE kunden
SET    notiz = 'Test-Änderung'
WHERE  id = 'HIER-UUID-EINES-FREMDEN-KUNDEN';
-- Erwartetes Ergebnis: "0 rows affected" (kein Fehler, aber nichts geändert — das ist RLS)

-- ============================================================
-- TEST 4: Vertriebler kann eigene Rolle NICHT eskalieren
--
-- Account: Vertriebler eingeloggt
-- Versucht die eigene Rolle auf 'leitung' zu setzen
-- ============================================================
UPDATE profiles
SET    role = 'leitung'
WHERE  id = auth.uid();
-- Erwartetes Ergebnis: "0 rows affected"
-- Die Policy blockiert: id != auth.uid() ist verletzt

-- ============================================================
-- Bonus: Wer bin ich gerade?
-- (zeigt die Rolle des aktuell eingeloggten Nutzers)
-- ============================================================
SELECT id, role, name, email
FROM   profiles
WHERE  id = auth.uid();
