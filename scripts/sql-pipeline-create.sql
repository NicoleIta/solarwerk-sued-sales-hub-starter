-- Pipeline-Tabelle anlegen
-- Spec: spec-pipeline-tabelle-foreign-key.md
-- Branch: tag46-pipeline-schema
--
-- Dieses Statement im Supabase SQL Editor ausführen.
-- Voraussetzung: Tabelle "kunden" muss bereits existieren.

CREATE TABLE pipeline (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  titel       text        NOT NULL,
  status      text        NOT NULL CHECK (status IN (
                'erstkontakt',
                'angebot_raus',
                'verhandlung',
                'vor_ort_termin',
                'gewonnen',
                'verloren'
              )),
  betrag      numeric,
  datum       timestamptz NOT NULL,
  notizen     text,
  kunde_id    uuid        NOT NULL REFERENCES kunden(id) ON DELETE RESTRICT,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- RLS deaktivieren (Lehr-Repo, konsistent mit kunden-Tabelle)
ALTER TABLE pipeline DISABLE ROW LEVEL SECURITY;
