-- ============================================================
-- Spec 3+4: RLS aktivieren & Policies anlegen
-- Ausführen im Supabase SQL-Editor
-- Reihenfolge: zuerst profiles-Setup, dann kunden-owner-Setup, dann dieses Script
-- ============================================================

-- Bei wiederholter Ausführung: bestehende Policies zuerst löschen
DROP POLICY IF EXISTS "kunden_select"             ON kunden;
DROP POLICY IF EXISTS "kunden_write_vertriebler"  ON kunden;
DROP POLICY IF EXISTS "kunden_write_leitung"      ON kunden;
DROP POLICY IF EXISTS "profiles_select"           ON profiles;
DROP POLICY IF EXISTS "profiles_update_leitung"   ON profiles;

-- ============================================================
-- Teil 1: kunden-Tabelle absichern
-- ============================================================

-- RLS einschalten — ab jetzt gilt "deny all" bis eine Policy greift
ALTER TABLE kunden ENABLE ROW LEVEL SECURITY;

-- SELECT-Policy: vertriebler UND leitung sehen alle Kunden
-- USING = die Bedingung, die jede Zeile erfüllen muss um sichtbar zu sein
-- Die Subquery schaut in profiles: Hat der eingeloggte Nutzer (auth.uid()) eine passende Rolle?
CREATE POLICY "kunden_select"
  ON kunden
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE  id   = auth.uid()
      AND    role IN ('vertriebler', 'leitung', 'admin', 'geschaeftsleitung')
    )
  );

-- INSERT/UPDATE/DELETE für Vertriebler: nur eigene Kunden (via kunden_owner)
-- USING = Bedingung für UPDATE/DELETE (welche Zeilen darf er anfassen?)
-- WITH CHECK = Bedingung für INSERT (darf er diese neue Zeile anlegen?)
CREATE POLICY "kunden_write_vertriebler"
  ON kunden
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'vertriebler'
    )
    AND EXISTS (
      SELECT 1 FROM kunden_owner
      WHERE kunden_id = kunden.id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'vertriebler'
    )
  );

-- INSERT/UPDATE/DELETE für Leitung: voller Zugriff auf alle Kunden
CREATE POLICY "kunden_write_leitung"
  ON kunden
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('leitung', 'admin', 'geschaeftsleitung')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('leitung', 'admin', 'geschaeftsleitung')
    )
  );

-- ============================================================
-- Teil 2: profiles-Tabelle absichern
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Jeder eingeloggte Nutzer darf profiles lesen (nötig für die USING-Subqueries oben)
CREATE POLICY "profiles_select"
  ON profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Rollen ändern: nur leitung/admin, und nicht an der eigenen Rolle
-- id != auth.uid() verhindert Selbst-Eskalation ("ich mache mich zum Admin")
CREATE POLICY "profiles_update_leitung"
  ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('leitung', 'admin')
    )
    AND id != auth.uid()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('leitung', 'admin')
    )
    AND id != auth.uid()
  );

-- ============================================================
-- Verifikation: aktive Policies anzeigen
-- ============================================================
SELECT tablename, policyname, cmd, qual
FROM   pg_policies
WHERE  tablename IN ('kunden', 'profiles')
ORDER  BY tablename, policyname;
