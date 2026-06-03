-- Migration: Temp-Passwort & Passwort-Änderung beim ersten Login
-- Ausführen in: Supabase Dashboard → SQL Editor

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS temp_password TEXT,
  ADD COLUMN IF NOT EXISTS muss_passwort_aendern BOOLEAN NOT NULL DEFAULT false;
