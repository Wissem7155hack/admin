-- ==============================================================================
-- Nexcore Admin Dashboard - GDPR Cookie Consent & Session Audit Architecture
-- Migration: 20260909000000_gdpr_sessions_and_cookie_consent.sql
-- ==============================================================================

-- 1. Create user_cookie_consents table for GDPR & ePrivacy Compliance
CREATE TABLE IF NOT EXISTS public.user_cookie_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    consent_uuid TEXT NOT NULL,
    necessary BOOLEAN NOT NULL DEFAULT true,
    analytics BOOLEAN NOT NULL DEFAULT false,
    preferences BOOLEAN NOT NULL DEFAULT false,
    marketing BOOLEAN NOT NULL DEFAULT false,
    policy_version TEXT NOT NULL DEFAULT 'v1.0',
    ip_address TEXT,
    user_agent TEXT,
    consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for lightning fast lookups & audits
CREATE INDEX IF NOT EXISTS idx_cookie_consents_user_id ON public.user_cookie_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_cookie_consents_uuid ON public.user_cookie_consents(consent_uuid);
CREATE INDEX IF NOT EXISTS idx_cookie_consents_date ON public.user_cookie_consents(consented_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_cookie_consents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_cookie_consents
DROP POLICY IF EXISTS "Public can record consent" ON public.user_cookie_consents;
CREATE POLICY "Public can record consent"
    ON public.user_cookie_consents
    FOR INSERT
    TO public, anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own consent record" ON public.user_cookie_consents;
CREATE POLICY "Users can read own consent record"
    ON public.user_cookie_consents
    FOR SELECT
    TO public, anon, authenticated
    USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid())
        OR user_id IS NULL
    );

DROP POLICY IF EXISTS "Users can update own consent record" ON public.user_cookie_consents;
CREATE POLICY "Users can update own consent record"
    ON public.user_cookie_consents
    FOR UPDATE
    TO public, anon, authenticated
    USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid())
        OR user_id IS NULL
    )
    WITH CHECK (
        (auth.uid() IS NOT NULL AND user_id = auth.uid())
        OR user_id IS NULL
    );


-- 2. Create user_sessions table for active session audit & security
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token_hash TEXT,
    ip_hash TEXT,
    user_agent TEXT,
    device_type TEXT DEFAULT 'Desktop',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT false
);

-- Indexes for session management
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(user_id, is_revoked, expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_sessions
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.user_sessions;
CREATE POLICY "Users can manage their own sessions"
    ON public.user_sessions
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public insert fallback for sessions" ON public.user_sessions;
CREATE POLICY "Public insert fallback for sessions"
    ON public.user_sessions
    FOR INSERT
    TO public, anon, authenticated
    WITH CHECK (true);


-- 3. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_cookie_consents_updated_at ON public.user_cookie_consents;
CREATE TRIGGER trigger_user_cookie_consents_updated_at
    BEFORE UPDATE ON public.user_cookie_consents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- 4. GDPR Data Minimization & Session Cleanup Function
CREATE OR REPLACE FUNCTION public.clean_expired_sessions_and_consents()
RETURNS void AS $$
BEGIN
    -- Delete revoked or expired sessions older than 30 days
    DELETE FROM public.user_sessions
    WHERE (is_revoked = true OR expires_at < now() - INTERVAL '30 days');

    -- Anonymize IP and User Agent on consent records older than 180 days for data minimization
    UPDATE public.user_cookie_consents
    SET ip_address = 'anonymized_after_180_days',
        user_agent = 'anonymized'
    WHERE updated_at < now() - INTERVAL '180 days'
      AND ip_address != 'anonymized_after_180_days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
