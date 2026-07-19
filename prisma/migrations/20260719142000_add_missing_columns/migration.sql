-- Migration: Add missing columns that exist in schema.prisma but were absent from the initial migration
-- Adds `image` to seo_metadata and `sections` to pages

-- AddColumn: image to seo_metadata
ALTER TABLE "seo_metadata" ADD COLUMN IF NOT EXISTS "image" TEXT;

-- AddColumn: sections (JSONB) to pages
ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "sections" JSONB;
