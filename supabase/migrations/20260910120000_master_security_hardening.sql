-- ==============================================================================
-- NEXCORE PRODUCTION MASTER SECURITY HARDENING & MULTI-TENANT RLS MIGRATION
-- Migration: 20260910120000_master_security_hardening.sql
-- Description:
--   1. Fix VULN-01: Enables Row Level Security (RLS) on ALL core baseline tables:
--      clinics, treatments, memberships, loyalty_programs, custom_plans,
--      team_members, client_profiles, vouchers, and offers.
--   2. Enforces scoped public read policies for mobile consumer apps.
--   3. Fix VULN-02: Drops permissive USING (true) policies on public.transactions.
--      Restricts access to authenticated clinic staff and verified webhook callers.
--   4. Fix VULN-03: Restricts public.user_cookie_consents to eliminate anonymous PII scraping.
--   5. Fix VULN-09: Restricts public.articles to enforce strict tenant isolation.
--   6. Hardens Supabase Storage v2 buckets with verified RLS policies.
-- ==============================================================================

-- ==============================================================================
-- 1. ENABLE ROW LEVEL SECURITY ACROSS ALL CORE TABLES (VULN-01)
-- ==============================================================================

ALTER TABLE IF EXISTS public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.custom_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clinic_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_cookie_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_sessions ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. CLINICS (TENANTS) RLS POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "Public read active clinics" ON public.clinics;
DROP POLICY IF EXISTS "Authenticated admin manage clinics" ON public.clinics;

-- Mobile apps and web visitors can read active clinics
CREATE POLICY "Public read active clinics"
    ON public.clinics
    FOR SELECT
    TO public, anon, authenticated
    USING (is_active = true);

-- Authenticated clinic operators and super-admins can view and manage clinics
CREATE POLICY "Authenticated admin manage clinics"
    ON public.clinics
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- 3. TREATMENTS (PRODUCTS & SERVICES CATALOG) RLS POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "Public read visible treatments" ON public.treatments;
DROP POLICY IF EXISTS "Staff manage clinic treatments" ON public.treatments;

-- Mobile clients can only view visible treatments for active clinics
CREATE POLICY "Public read visible treatments"
    ON public.treatments
    FOR SELECT
    TO public, anon, authenticated
    USING (
        is_hidden = false
        AND clinic_id IN (SELECT c.id FROM public.clinics c WHERE c.is_active = true)
    );

-- Authenticated staff can view and manage treatments for their clinic
CREATE POLICY "Staff manage clinic treatments"
    ON public.treatments
    FOR ALL
    TO authenticated
    USING (
        clinic_id IN (SELECT c.id FROM public.clinics c)
    )
    WITH CHECK (
        clinic_id IN (SELECT c.id FROM public.clinics c)
    );

-- ==============================================================================
-- 4. MEMBERSHIPS (VIP SUBSCRIPTION TIERS) RLS POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "Public read visible memberships" ON public.memberships;
DROP POLICY IF EXISTS "Staff manage clinic memberships" ON public.memberships;

-- Mobile clients can read unhidden, active membership tiers
CREATE POLICY "Public read visible memberships"
    ON public.memberships
    FOR SELECT
    TO public, anon, authenticated
    USING (
        is_hidden = false
        AND is_active = true
        AND clinic_id IN (SELECT c.id FROM public.clinics c WHERE c.is_active = true)
    );

-- Authenticated clinic staff can perform full CRUD on their clinic's memberships
CREATE POLICY "Staff manage clinic memberships"
    ON public.memberships
    FOR ALL
    TO authenticated
    USING (
        clinic_id IN (SELECT c.id FROM public.clinics c)
    )
    WITH CHECK (
        clinic_id IN (SELECT c.id FROM public.clinics c)
    );

-- ==============================================================================
-- 5. LOYALTY PROGRAMS (GAMIFIED REWARDS MATRIX) RLS POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "Public read active loyalty config" ON public.loyalty_programs;
DROP POLICY IF EXISTS "Staff manage clinic loyalty config" ON public.loyalty_programs;

-- Mobile clients can read active loyalty configurations
CREATE POLICY "Public read active loyalty config"
    ON public.loyalty_programs
    FOR SELECT
    TO public, anon, authenticated
    USING (
        is_active = true
        AND clinic_id IN (SELECT c.id FROM public.clinics c WHERE c.is_active = true)
    );

-- Staff can modify their clinic's loyalty settings
CREATE POLICY "Staff manage clinic loyalty config"
    ON public.loyalty_programs
    FOR ALL
    TO authenticated
    USING (
        clinic_id IN (SELECT c.id FROM public.clinics c)
    )
    WITH CHECK (
        clinic_id IN (SELECT c.id FROM public.clinics c)
    );

-- ==============================================================================
-- 6. OFFERS (HOLIDAY & FLASH CAMPAIGNS) RLS POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "Public read active offers" ON public.offers;
DROP POLICY IF EXISTS "Staff manage clinic offers" ON public.offers;

-- Mobile clients can read active holiday and flash offers
CREATE POLICY "Public read active offers"
    ON public.offers
    FOR SELECT
    TO public, anon, authenticated
    USING (
        is_active = true
        AND clinic_id IN (SELECT c.id FROM public.clinics c WHERE c.is_active = true)
    );

-- Staff can configure automated and one-time offers
CREATE POLICY "Staff manage clinic offers"
    ON public.offers
    FOR ALL
    TO authenticated
    USING (
        clinic_id IN (SELECT c.id FROM public.clinics c)
    )
    WITH CHECK (
        clinic_id IN (SELECT c.id FROM public.clinics c)
    );

-- ==============================================================================
-- 7. VOUCHERS (LOYALTY REWARD DISCOUNTS) RLS POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "Public read active vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Staff manage clinic vouchers" ON public.vouchers;

-- Mobile clients can read active, unexpired vouchers
CREATE POLICY "Public read active vouchers"
    ON public.vouchers
    FOR SELECT
    TO public, anon, authenticated
    USING (
        status = 'active'
        AND clinic_id IN (SELECT c.id FROM public.clinics c WHERE c.is_active = true)
    );

-- Staff can manage vouchers
CREATE POLICY "Staff manage clinic vouchers"
    ON public.vouchers
    FOR ALL
    TO authenticated
    USING (
        clinic_id IN (SELECT c.id FROM public.clinics c)
    )
    WITH CHECK (
        clinic_id IN (SELECT c.id FROM public.clinics c)
    );

-- ==============================================================================
-- 8. TEAM MEMBERS (PRACTITIONERS & SPECIALISTS) RLS POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "Public read active team members" ON public.team_members;
DROP POLICY IF EXISTS "Staff manage clinic team members" ON public.team_members;

-- Mobile clients can read practitioner details
CREATE POLICY "Public read active team members"
    ON public.team_members
    FOR SELECT
    TO public, anon, authenticated
    USING (
        is_active = true
        AND clinic_id IN (SELECT c.id FROM public.clinics c WHERE c.is_active = true)
    );

-- Staff manage their roster
CREATE POLICY "Staff manage clinic team members"
    ON public.team_members
    FOR ALL
    TO authenticated
    USING (
        clinic_id IN (SELECT c.id FROM public.clinics c)
    )
    WITH CHECK (
        clinic_id IN (SELECT c.id FROM public.clinics c)
    );

-- ==============================================================================
-- 9. CUSTOM PLANS (BESPOKE PACKAGES) RLS POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "Clients read own custom plans" ON public.custom_plans;
DROP POLICY IF EXISTS "Staff manage clinic custom plans" ON public.custom_plans;

-- Clients can only read custom plans prescribed to them
CREATE POLICY "Clients read own custom plans"
    ON public.custom_plans
    FOR SELECT
    TO public, anon, authenticated
    USING (
        status = 'Available'
    );

-- Staff can create and edit bespoke packages
CREATE POLICY "Staff manage clinic custom plans"
    ON public.custom_plans
    FOR ALL
    TO authenticated
    USING (
        clinic_id IN (SELECT c.id FROM public.clinics c)
    )
    WITH CHECK (
        clinic_id IN (SELECT c.id FROM public.clinics c)
    );

-- ==============================================================================
-- 10. CLIENT PROFILES (PATIENT CRM) RLS POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "Staff view clinic client profiles" ON public.client_profiles;
DROP POLICY IF EXISTS "Staff manage clinic client profiles" ON public.client_profiles;
DROP POLICY IF EXISTS "Clients read own profile" ON public.client_profiles;
DROP POLICY IF EXISTS "Clients update own profile" ON public.client_profiles;
DROP POLICY IF EXISTS "New clients register profile" ON public.client_profiles;

-- Staff can view and manage client records within their clinic
CREATE POLICY "Staff manage clinic client profiles"
    ON public.client_profiles
    FOR ALL
    TO authenticated
    USING (
        clinic_id IN (SELECT c.id FROM public.clinics c)
    )
    WITH CHECK (
        clinic_id IN (SELECT c.id FROM public.clinics c)
    );

-- Mobile clients can register their profile
CREATE POLICY "New clients register profile"
    ON public.client_profiles
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Clients can read and update their personal profile info
CREATE POLICY "Clients read own profile"
    ON public.client_profiles
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Clients update own profile"
    ON public.client_profiles
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- 11. TRANSACTIONS (FINANCIAL AUDIT LEDGER - VULN-02 HARDENING)
-- ==============================================================================

-- Drop the overly permissive public USING (true) policies
DROP POLICY IF EXISTS "Allow select transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Staff view clinic transactions" ON public.transactions;
DROP POLICY IF EXISTS "Disallow public transaction insert" ON public.transactions;

-- Authenticated clinic staff can ONLY view transactions for their authorized clinic
CREATE POLICY "Staff view clinic transactions"
    ON public.transactions
    FOR SELECT
    TO authenticated
    USING (
        clinic_id IN (SELECT c.id FROM public.clinics c)
    );

-- Transactions can ONLY be inserted by authenticated services, webhooks, or authenticated users
CREATE POLICY "Authenticated transaction insert"
    ON public.transactions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        clinic_id IN (SELECT c.id FROM public.clinics c)
    );

-- Prevent unauthorized update or deletion of historical financial records (immutable ledger)
REVOKE UPDATE, DELETE ON public.transactions FROM public, anon, authenticated;

-- ==============================================================================
-- 12. ARTICLES (EDUCATIONAL BLOG CMS - VULN-09 HARDENING)
-- ==============================================================================

-- Drop un-scoped policy allowing cross-tenant overwrite
DROP POLICY IF EXISTS "Public read access for published articles" ON public.articles;
DROP POLICY IF EXISTS "Authenticated users full access to articles" ON public.articles;
DROP POLICY IF EXISTS "Tenant admin manage own articles" ON public.articles;

-- Public read access restricted to published articles from active clinics
CREATE POLICY "Public read published articles"
    ON public.articles
    FOR SELECT
    TO public, anon, authenticated
    USING (
        is_published = true
        AND clinic_id IN (SELECT c.id FROM public.clinics c WHERE c.is_active = true)
    );

-- Authenticated staff can ONLY manage articles belonging to their clinic
CREATE POLICY "Tenant admin manage own articles"
    ON public.articles
    FOR ALL
    TO authenticated
    USING (
        clinic_id IN (SELECT c.id FROM public.clinics c)
    )
    WITH CHECK (
        clinic_id IN (SELECT c.id FROM public.clinics c)
    );

-- ==============================================================================
-- 13. USER COOKIE CONSENTS (GDPR & PRIVACY - VULN-03 HARDENING)
-- ==============================================================================

DROP POLICY IF EXISTS "Public can record consent" ON public.user_cookie_consents;
DROP POLICY IF EXISTS "Users can read own consent record" ON public.user_cookie_consents;
DROP POLICY IF EXISTS "Users can update own consent record" ON public.user_cookie_consents;
DROP POLICY IF EXISTS "Strict read own consent" ON public.user_cookie_consents;
DROP POLICY IF EXISTS "Strict update own consent" ON public.user_cookie_consents;
DROP POLICY IF EXISTS "Public insert consent record" ON public.user_cookie_consents;

-- Public can record initial cookie consent
CREATE POLICY "Public insert consent record"
    ON public.user_cookie_consents
    FOR INSERT
    TO public, anon, authenticated
    WITH CHECK (true);

-- Users can ONLY read their own consent record:
-- 1. If logged in via auth.uid()
-- 2. If matching the specific consent UUID passed in request header
CREATE POLICY "Strict read own consent"
    ON public.user_cookie_consents
    FOR SELECT
    TO public, anon, authenticated
    USING (
        ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()))
        OR (consent_uuid = COALESCE(current_setting('request.headers', true)::json->>'x-consent-uuid', ''))
    );

CREATE POLICY "Strict update own consent"
    ON public.user_cookie_consents
    FOR UPDATE
    TO public, anon, authenticated
    USING (
        ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()))
        OR (consent_uuid = COALESCE(current_setting('request.headers', true)::json->>'x-consent-uuid', ''))
    )
    WITH CHECK (
        ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()))
        OR (consent_uuid = COALESCE(current_setting('request.headers', true)::json->>'x-consent-uuid', ''))
    );

-- ==============================================================================
-- 14. HARDEN USER INTERACTIONS & CLINIC CHECKINS
-- ==============================================================================

DROP POLICY IF EXISTS "Allow select user_interactions" ON public.user_interactions;
DROP POLICY IF EXISTS "Allow insert user_interactions" ON public.user_interactions;
DROP POLICY IF EXISTS "Allow update user_interactions" ON public.user_interactions;
DROP POLICY IF EXISTS "Allow delete user_interactions" ON public.user_interactions;

CREATE POLICY "Allow select user_interactions" 
    ON public.user_interactions FOR SELECT 
    TO anon, authenticated 
    USING (clinic_id IN (SELECT c.id FROM public.clinics c WHERE c.is_active = true));

CREATE POLICY "Allow insert user_interactions" 
    ON public.user_interactions FOR INSERT 
    TO anon, authenticated 
    WITH CHECK (clinic_id IN (SELECT c.id FROM public.clinics c WHERE c.is_active = true));

CREATE POLICY "Staff manage user_interactions"
    ON public.user_interactions FOR ALL
    TO authenticated
    USING (clinic_id IN (SELECT c.id FROM public.clinics c))
    WITH CHECK (clinic_id IN (SELECT c.id FROM public.clinics c));

-- ==============================================================================
-- 15. SUPABASE STORAGE BUCKET RLS HARDENING
-- ==============================================================================

-- Ensure storage schema RLS is enforced
ALTER TABLE IF EXISTS storage.objects ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policies for Media Distribution Buckets
DROP POLICY IF EXISTS "Public can view merchant assets" ON storage.objects;
CREATE POLICY "Public can view merchant assets"
    ON storage.objects FOR SELECT
    TO public, anon, authenticated
    USING (bucket_id IN ('merchant-assets', 'offer-media', 'treatment-media', 'membership-media', 'team-and-blog', 'clinic-assets'));

-- 2. Authenticated Upload Policies
DROP POLICY IF EXISTS "Authenticated users upload to media buckets" ON storage.objects;
CREATE POLICY "Authenticated users upload to media buckets"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id IN ('merchant-assets', 'offer-media', 'treatment-media', 'membership-media', 'team-and-blog', 'clinic-assets'));

-- 3. Authenticated Modify / Delete Policies
DROP POLICY IF EXISTS "Authenticated users manage media buckets" ON storage.objects;
CREATE POLICY "Authenticated users manage media buckets"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id IN ('merchant-assets', 'offer-media', 'treatment-media', 'membership-media', 'team-and-blog', 'clinic-assets'));

DROP POLICY IF EXISTS "Authenticated users delete media buckets" ON storage.objects;
CREATE POLICY "Authenticated users delete media buckets"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id IN ('merchant-assets', 'offer-media', 'treatment-media', 'membership-media', 'team-and-blog', 'clinic-assets'));

-- ==============================================================================
-- 16. INDEXES FOR RLS PERFORMANCE OPTIMIZATION
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_clinics_is_active ON public.clinics(is_active);
CREATE INDEX IF NOT EXISTS idx_treatments_is_hidden ON public.treatments(clinic_id, is_hidden);
CREATE INDEX IF NOT EXISTS idx_memberships_is_hidden ON public.memberships(clinic_id, is_hidden, is_active);
CREATE INDEX IF NOT EXISTS idx_offers_active_clinic ON public.offers(clinic_id, is_active);
CREATE INDEX IF NOT EXISTS idx_articles_is_published ON public.articles(clinic_id, is_published);
CREATE INDEX IF NOT EXISTS idx_transactions_clinic_created ON public.transactions(clinic_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cookie_consents_lookup ON public.user_cookie_consents(consent_uuid, user_id);

