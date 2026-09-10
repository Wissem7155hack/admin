-- ==============================================================================
-- Nexcore Admin Dashboard - Memberships Display Order & Education Articles
-- Migration: 20260909010000_memberships_order_and_articles.sql
-- ==============================================================================

-- 1. Ensure display_order and sort_order exist on public.memberships
ALTER TABLE IF EXISTS public.memberships
    ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS subtitle TEXT DEFAULT 'The membership that pays for itself',
    ADD COLUMN IF NOT EXISTS tagline TEXT DEFAULT 'TRY REFINED METHOD',
    ADD COLUMN IF NOT EXISTS benefit_cards JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS included_treatments JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS treatments_header TEXT DEFAULT 'Included treatments',
    ADD COLUMN IF NOT EXISTS testimonials JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_memberships_clinic_order ON public.memberships(clinic_id, display_order ASC);

-- 2. Ensure articles table exists for live Education & Blog feed
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
    slug TEXT,
    title TEXT NOT NULL,
    author TEXT DEFAULT 'Clinical Specialist',
    snippet TEXT,
    body TEXT,
    image TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_articles_clinic_created ON public.articles(clinic_id, created_at DESC);

-- Enable RLS
ALTER TABLE IF EXISTS public.articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for published articles" ON public.articles;
CREATE POLICY "Public read access for published articles"
    ON public.articles
    FOR SELECT
    TO public, anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users full access to articles" ON public.articles;
CREATE POLICY "Authenticated users full access to articles"
    ON public.articles
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
