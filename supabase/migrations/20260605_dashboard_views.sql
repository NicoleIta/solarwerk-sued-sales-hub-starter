-- Gespeicherte Dashboard-Sichten
-- Speichert Filterkriterien (kein Kunden-Snapshot), nutzer-spezifisch via RLS

CREATE TABLE IF NOT EXISTS dashboard_views (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  filter_json jsonb NOT NULL,
  erstellt_am timestamptz DEFAULT now()
);

ALTER TABLE dashboard_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutzer verwalten nur eigene Sichten"
  ON dashboard_views FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
