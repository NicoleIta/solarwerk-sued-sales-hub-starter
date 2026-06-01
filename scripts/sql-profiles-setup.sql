-- ============================================================
-- Spec 2: profiles-Tabelle anlegen & alle Nutzer eintragen
-- Ausführen im Supabase SQL-Editor (einmalig)
-- ============================================================

-- 1. Tabelle erstellen
CREATE TABLE IF NOT EXISTS profiles (
  id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role  text NOT NULL CHECK (role IN (
          'vertriebler', 'leitung', 'marketing',
          'verkauf', 'admin', 'geschaeftsleitung'
        )),
  name  text NOT NULL,
  email text NOT NULL
);

-- ============================================================
-- 2. Alle 9 Nutzer mit Rollen eintragen
-- ============================================================

INSERT INTO profiles (id, role, name, email) VALUES
  ('152722c6-2999-4418-9dd6-c3c562dd293d', 'admin',              'Admin',              'admin@solarwerk-sued.de'),
  ('3098fd49-6bf8-4c3c-9ad2-640f7ea3d72b', 'verkauf',            'Maria Cappola',      'buchhaltung@solarwerk-sued.de'),
  ('be7e9f4b-6b00-43aa-8099-91d7e9127294', 'geschaeftsleitung',  'Geschäftsleitung',   'chefetage@solarwerk-sued.de'),
  ('b62152f2-e754-4768-ab5a-7fd581bc14de', 'leitung',            'Soe Studer',         'leiter.soe@solarwerk-sued.de'),
  ('5b6fa9da-9d56-42f1-9848-9442c9c64f99', 'marketing',          'Sandra Müller',      'marketing.sandra@solarwerk-sued.de'),
  ('11af1a99-1024-4d50-9d52-963f49cb43f4', 'vertriebler',        'Markus Gyger',       'markus@solarwerk-sued.de'),
  ('b2d6bd6b-06ab-4162-82e9-d5e2a8c925cb', 'leitung',            'Nicole Ita',         'nicole@solarwerk-sued.de'),
  ('01fc304d-487a-4917-a14f-dfda2a29b6f1', 'vertriebler',        'Karsten Brückner',   'vertrieb.karsten@solarwerk-sued.de'),
  ('989ee574-c6f1-4816-aa22-8054684b908f', 'vertriebler',        'Max Meile',          'vertrieb.max@solarwerk-sued.de')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. Verifikation
-- ============================================================
SELECT * FROM profiles ORDER BY role;
