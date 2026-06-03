-- Migration: Aktivitäts-Historie pro Kunde
-- Ausführen in: Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS aktivitaeten (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  kunde_id     uuid        NOT NULL REFERENCES kunden(id),
  typ          text        NOT NULL CHECK (typ IN ('Anruf', 'E-Mail', 'Notiz', 'Besuch/Termin')),
  betreff      text        NOT NULL,
  inhalt       text,
  erstellt_von uuid        NOT NULL REFERENCES auth.users(id),
  erstellt_am  timestamptz NOT NULL DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE aktivitaeten ENABLE ROW LEVEL SECURITY;

-- Eingeloggte Nutzer dürfen alle Aktivitäten ihres Mandanten lesen
CREATE POLICY "aktivitaeten_select" ON aktivitaeten
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Jeder eingeloggte Nutzer darf eigene Aktivitäten einfügen
CREATE POLICY "aktivitaeten_insert" ON aktivitaeten
  FOR INSERT WITH CHECK (auth.uid() = erstellt_von);

-- Nur eigene Aktivitäten löschen
CREATE POLICY "aktivitaeten_delete" ON aktivitaeten
  FOR DELETE USING (auth.uid() = erstellt_von);
