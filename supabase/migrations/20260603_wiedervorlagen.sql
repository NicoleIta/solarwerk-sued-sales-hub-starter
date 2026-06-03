-- Migration: Wiedervorlage-Feature
-- Ausführen in: Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS wiedervorlagen (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       UUID        REFERENCES kunden(id) ON DELETE SET NULL,
  pipeline_entry_id UUID        REFERENCES pipeline(id) ON DELETE SET NULL,
  due_date          DATE        NOT NULL,
  reason            TEXT,
  status            TEXT        NOT NULL DEFAULT 'offen'
                                CHECK (status IN ('offen', 'erledigt')),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_fk CHECK (
    customer_id IS NOT NULL OR pipeline_entry_id IS NOT NULL
  )
);

ALTER TABLE wiedervorlagen ENABLE ROW LEVEL SECURITY;

-- Nutzer sieht und verwaltet nur eigene Wiedervorlagen (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'wiedervorlagen' AND policyname = 'wiedervorlagen_eigene'
  ) THEN
    CREATE POLICY "wiedervorlagen_eigene" ON wiedervorlagen
      USING  (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
