-- ============================================================================
-- NEXCORE BEHAVIORAL TRACKING & RECOMMENDATION ENGINE MIGRATION
-- Migration: 20260910000000_behavioral_recommendations.sql
-- ============================================================================

-- 1. Create table public.user_interactions
CREATE TABLE IF NOT EXISTS public.user_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
    treatment_id UUID NOT NULL REFERENCES public.treatments(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'cart_add', 'purchase')),
    weight INTEGER NOT NULL, -- 1 for view, 3 for cart, 5 for purchase
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index on (client_id, interaction_type) for high-performance recommendation querying
CREATE INDEX IF NOT EXISTS idx_user_interactions_client_type 
    ON public.user_interactions (client_id, interaction_type);

CREATE INDEX IF NOT EXISTS idx_user_interactions_client_created 
    ON public.user_interactions (client_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_interactions_clinic 
    ON public.user_interactions (clinic_id);

-- Enable Row Level Security
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select user_interactions" ON public.user_interactions;
DROP POLICY IF EXISTS "Allow insert user_interactions" ON public.user_interactions;
DROP POLICY IF EXISTS "Allow update user_interactions" ON public.user_interactions;
DROP POLICY IF EXISTS "Allow delete user_interactions" ON public.user_interactions;

CREATE POLICY "Allow select user_interactions" 
    ON public.user_interactions FOR SELECT 
    TO anon, authenticated 
    USING (true);

CREATE POLICY "Allow insert user_interactions" 
    ON public.user_interactions FOR INSERT 
    TO anon, authenticated 
    WITH CHECK (true);

CREATE POLICY "Allow update user_interactions" 
    ON public.user_interactions FOR UPDATE 
    TO anon, authenticated 
    USING (true);

CREATE POLICY "Allow delete user_interactions" 
    ON public.user_interactions FOR DELETE 
    TO anon, authenticated 
    USING (true);

-- 2. PostgreSQL Recommendation RPC Function
CREATE OR REPLACE FUNCTION public.get_recommended_treatments(
    p_client_id UUID,
    p_clinic_id UUID,
    p_limit INT DEFAULT 4
)
RETURNS TABLE (
    id UUID,
    clinic_id UUID,
    slug VARCHAR(64),
    name VARCHAR(255),
    category VARCHAR(128),
    price NUMERIC(10, 2),
    duration VARCHAR(64),
    description TEXT,
    image VARCHAR(512),
    is_recommended BOOLEAN,
    is_membership_only BOOLEAN,
    tags TEXT[],
    client_results JSONB,
    score BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_has_interactions BOOLEAN;
BEGIN
    -- Check if client has interaction history in the last 30 days
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_interactions ui
        WHERE ui.client_id = p_client_id 
          AND ui.clinic_id = p_clinic_id
          AND ui.created_at >= (NOW() - INTERVAL '30 days')
    ) INTO v_has_interactions;

    IF v_has_interactions THEN
        -- Aggregate top concern tags and categories from treatments the user interacted with most in the last 30 days
        RETURN QUERY
        WITH client_top_tags AS (
            SELECT 
                tag,
                SUM(ui.weight) AS tag_weight
            FROM public.user_interactions ui
            JOIN public.treatments t ON t.id = ui.treatment_id
            CROSS JOIN LATERAL unnest(
                COALESCE(t.tags, ARRAY[]::TEXT[]) || ARRAY[COALESCE(t.category, '')]
            ) AS tag
            WHERE ui.client_id = p_client_id
              AND ui.clinic_id = p_clinic_id
              AND ui.created_at >= (NOW() - INTERVAL '30 days')
              AND tag IS NOT NULL 
              AND tag <> ''
            GROUP BY tag
        ),
        booked_treatments AS (
            SELECT DISTINCT ui.treatment_id
            FROM public.user_interactions ui
            WHERE ui.client_id = p_client_id
              AND ui.interaction_type = 'purchase'
        )
        SELECT 
            t.id,
            t.clinic_id,
            t.slug,
            t.name,
            t.category,
            t.price,
            t.duration,
            t.description,
            t.image,
            t.is_recommended,
            t.is_membership_only,
            COALESCE(t.tags, ARRAY[]::TEXT[]),
            COALESCE(t.client_results, '[]'::jsonb),
            COALESCE(SUM(ctt.tag_weight), 0)::BIGINT AS score
        FROM public.treatments t
        LEFT JOIN client_top_tags ctt 
            ON ctt.tag = ANY(COALESCE(t.tags, ARRAY[]::TEXT[]) || ARRAY[COALESCE(t.category, '')])
        LEFT JOIN booked_treatments bt 
            ON bt.treatment_id = t.id
        WHERE t.clinic_id = p_clinic_id
          AND COALESCE(t.is_hidden, false) = false
          AND bt.treatment_id IS NULL -- Treatment not yet booked by this client
        GROUP BY 
            t.id, t.clinic_id, t.slug, t.name, t.category, t.price, 
            t.duration, t.description, t.image, t.is_recommended, 
            t.is_membership_only, t.tags, t.client_results
        ORDER BY score DESC, t.is_recommended DESC, t.created_at DESC
        LIMIT p_limit;
    ELSE
        -- Fallback: return treatments where is_recommended = true, ordered by creation
        RETURN QUERY
        SELECT 
            t.id,
            t.clinic_id,
            t.slug,
            t.name,
            t.category,
            t.price,
            t.duration,
            t.description,
            t.image,
            t.is_recommended,
            t.is_membership_only,
            COALESCE(t.tags, ARRAY[]::TEXT[]),
            COALESCE(t.client_results, '[]'::jsonb),
            1::BIGINT AS score
        FROM public.treatments t
        WHERE t.clinic_id = p_clinic_id
          AND COALESCE(t.is_hidden, false) = false
        ORDER BY t.is_recommended DESC, t.created_at DESC
        LIMIT p_limit;
    END IF;
END;
$$;
