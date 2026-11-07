-- Schéma Supabase pour « Les repas de la semaine »
-- À exécuter une seule fois dans l'éditeur SQL de Supabase (dashboard → SQL Editor → New query)

-- ── Table principale : état de chaque foyer ─────────────────────────────────
CREATE TABLE IF NOT EXISTS households (
  code_hash  TEXT        PRIMARY KEY,  -- SHA-256 hex du code foyer (calculé côté client)
  data       JSONB       NOT NULL,     -- état complet de l'app (planning, recettes, courses…)
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour les requêtes de polling (GET /api/sync?code=…)
CREATE INDEX IF NOT EXISTS households_updated_at_idx ON households (updated_at DESC);

-- ── Table de quota Firecrawl ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fc_usage (
  date  DATE    PRIMARY KEY,  -- ex. '2026-11-07'
  count INTEGER NOT NULL DEFAULT 0
);

-- ── Fonction RPC : incrémenter le quota Firecrawl ───────────────────────────
-- Appelée par api/import.js après chaque scraping réussi.
-- ON CONFLICT assure un incrément atomique même en concurrence.
CREATE OR REPLACE FUNCTION increment_fc(p_date DATE)
RETURNS void
LANGUAGE sql
AS $$
  INSERT INTO fc_usage (date, count)
  VALUES (p_date, 1)
  ON CONFLICT (date) DO UPDATE
    SET count = fc_usage.count + 1;
$$;

-- ── Sécurité Row Level Security (RLS) ───────────────────────────────────────
-- Les tables ne sont accessibles que via la service role key (côté serveur).
-- Le client public (anon key) n'a aucun accès.
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE fc_usage    ENABLE ROW LEVEL SECURITY;

-- Pas de policy anon → aucun accès public, service role contourne RLS par défaut.
