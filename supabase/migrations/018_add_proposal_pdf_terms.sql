-- ALTTEZ: campos configurables para el acuerdo PDF de propuestas comerciales.

ALTER TABLE propuestas
  ADD COLUMN IF NOT EXISTS objeto_pdf text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cliff_pdf text NOT NULL DEFAULT '';
