-- Migration: Add fotoUrl column to laporan table
-- Date: 2026-11-15
-- Description: Add optional photo URL field for laporan reports

ALTER TABLE laporan 
ADD COLUMN IF NOT EXISTS "fotoUrl" TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN laporan."fotoUrl" IS 'Public URL of photo uploaded to Supabase Storage (optional)';
