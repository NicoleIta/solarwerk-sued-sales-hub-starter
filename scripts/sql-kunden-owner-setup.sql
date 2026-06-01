-- ============================================================
-- Spec 1: kunden_owner-Tabelle anlegen & Bestandskunden seeden
-- Ausführen im Supabase SQL-Editor (einmalig, nach profiles-Setup)
-- ============================================================

-- 1. Zwischentabelle erstellen
--    PRIMARY KEY (kunden_id, user_id) verhindert doppelte Einträge
--    ON DELETE CASCADE: wird ein Kunde gelöscht, fällt der Owner-Eintrag automatisch weg
CREATE TABLE IF NOT EXISTS kunden_owner (
  kunden_id uuid NOT NULL REFERENCES kunden(id) ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (kunden_id, user_id)
);

-- ============================================================
-- 2. Seed: alle 25 Bestandskunden bekommen einen Owner
--    Wir weisen sie der Leitung zu — sie kann später umverteilen.
--
--    VORHER: UUID der Leitung aus dem Supabase-Dashboard holen
--    Dashboard → Authentication → Users → UUID kopieren
-- ============================================================

-- ERSETZE 'HIER-UUID-DER-LEITUNG' mit der echten UUID
INSERT INTO kunden_owner (kunden_id, user_id)
-- Nicole (leitung) bekommt alle Bestandskunden als Owner
SELECT id, 'b2d6bd6b-06ab-4162-82e9-d5e2a8c925cb'::uuid
FROM   kunden
ON CONFLICT (kunden_id, user_id) DO NOTHING;

-- ============================================================
-- 3. Optional: Einzelne Kunden einem Vertriebler zuweisen
--    (nach dem ersten Test-Durchlauf sinnvoll)
--
--    ERSETZE beide UUIDs mit echten Werten:
-- ============================================================
-- Optional: Markus (vertriebler) bekommt zusätzlich einzelne Kunden
-- INSERT INTO kunden_owner (kunden_id, user_id)
-- SELECT id, '11af1a99-1024-4d50-9d52-963f49cb43f4'::uuid
-- FROM   kunden
-- WHERE  firma IN ('SolarMax GmbH', 'GreenPower AG')  -- Beispiel-Firmen
-- ON CONFLICT (kunden_id, user_id) DO NOTHING;

-- ============================================================
-- 4. Verifikation: kein Kunde ohne Eintrag?
-- ============================================================
SELECT COUNT(*) AS kunden_ohne_owner
FROM   kunden k
WHERE  NOT EXISTS (
  SELECT 1 FROM kunden_owner ko WHERE ko.kunden_id = k.id
);
-- Erwartetes Ergebnis: 0
