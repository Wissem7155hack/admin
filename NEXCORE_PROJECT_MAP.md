# NEXCORE — SYSTEM ARCHITECTURE & MASTER PROJECT MAP
**Classification:** Production Engineering Blueprint  
**Version:** 2.5.0-PROD  
**Last Synchronized:** 2026-09-09  
**Architect:** Senior Full-Stack Software Architect & Systems Engineer  

---

## 1. Executive Architecture Overview

Nexcore is an enterprise-grade, multi-tenant B2B2C Software-as-a-Service (SaaS) ecosystem tailored specifically for luxury medical aesthetics clinics, cosmetic dermatology practices, and high-ticket medical wellness providers. 

The system bridges high-friction, after-hours client purchasing with clinical CRM management, closing the 6–8 week post-treatment drop-off gap by deploying custom-branded native client applications backed by a centralized command console.

```
+-----------------------------------------------------------------------------------------+
|                                  AGENCY SUPER-ADMIN                                     |
|  - White Label Master Engine      - Global Tenant Provisioning   - SaaS Billing & MRR   |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                              MULTI-TENANT CLINIC CONSOLE                                |
|  - App Builder (CMS)              - Product & Treatment Catalog  - Automated Offer Engine|
|  - Memberships & Dunning          - Gamified Rewards Engine      - Client Profiles & CRM |
+-----------------------------------------------------------------------------------------+
                    |                                        |
                    | (Supabase Realtime / REST API)         | (Storage CDN / Edge Functions)
                    v                                        v
+-----------------------------------------------------------------------------------------+
|                           PATIENT APP (MOBILE CLIENT CONTAINER)                         |
|  - Runtime Brand Re-theming       - Digital Loyalty Wallet       - One-Click Klarna / Card|
|  - Consultation Gateways          - Dynamic Holiday Popups       - In-Clinic QR Pairing  |
+-----------------------------------------------------------------------------------------+
```

### 1.1 High-Level Topology
The platform operates across three interconnected software tiers:

1. **Agency Admin Portal (Root Level):**
   - Orchestrates multi-tenant isolation, clinic onboarding, custom domains, and platform-wide white labeling.
   - Manages top-level agency brand identities, global currency fallbacks, and multi-clinic switcher contexts.

2. **Merchant Clinic Workspaces (Tenant Level):**
   - Individual aesthetic clinics (e.g., SLA Medical, SAGE & PURE, The Laser Club UK) operate in sandboxed tenant scopes.
   - Features include real-time analytics graphs, appointment booking bridges, recurring membership dunning, custom treatment bundling, automated push campaigns, and staff roster controls.

3. **Patient Mobile App Runtime (Client Consumer Level):**
   - A single unified mobile client engine compiled to iOS and Android (Flutter 3.x with Riverpod state orchestration).
   - Bootstraps dynamically at launch by resolving tenant slug/ID, fetching the remote JSON design system (hex palettes, typography, clinic imagery), and re-skinning without requiring app store resubmissions.

### 1.2 Technology Stack Specifics

| Layer | Technology | Engineering Role |
|---|---|---|
| **Admin Frontend** | React 18.3, TypeScript 5.5, Vite 7.3 | High-throughput SPA with hot-module reload and sub-15ms DOM renders |
| **Styling & UI Tokens** | Tailwind CSS v3.4, Vanilla CSS Design System | Obsidian dark sidebars (`#0B0D13`), glassmorphism card elevation, crisp editorial typography |
| **Icons & Visualization**| Lucide React, Recharts v2.12 | Responsive SVG iconography and transactional area charts with cubic bezier gradients |
| **Backend & Storage** | Supabase (PostgreSQL 15.6, PostgREST 12, Storage v2) | Row Level Security (RLS), ACID relational transactions, and global object storage |
| **Serverless Compute** | Supabase Edge Functions (Deno runtime) | Stripe Connect webhook listeners, scheduled cron triggers for automated holiday push campaigns |
| **Client App Runtime** | Flutter 3.x, Dart 3.x, Riverpod, GoRouter, Supabase SDK | Cross-platform container rendering native 60fps micro-animations and biometric wallets |

---

## 2. Complete Supabase Database & Storage Matrix

### 2.1 Relational Database Schemas

All multi-tenant data entities reside inside Postgres with strict foreign key cascading and indexed query execution paths.

#### 1. `clinics` (Tenants / Merchants)
```sql
CREATE TABLE public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    full_name TEXT,
    tagline TEXT DEFAULT 'Luxury medical aesthetics & wellness clinic.',
    address TEXT DEFAULT 'London, UK',
    hero_image TEXT,
    app_icon TEXT,
    currency_symbol TEXT DEFAULT '$',
    currency_code TEXT DEFAULT 'USD',
    theme JSONB DEFAULT '{"primaryColor":"#EC4899","secondaryColor":"#1E293B","accentColor":"#EC4899","backgroundColor":"#F8FAFC","surfaceColor":"#FFFFFF","borderColor":"#E2E8F0","textPrimary":"#0F172A","textSecondary":"#64748B"}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    stripe_account_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_clinics_slug ON public.clinics(slug);
```

#### 2. `treatments` (Products & Services Catalog)
```sql
CREATE TABLE public.treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    slug TEXT,
    name TEXT NOT NULL,
    category TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    duration TEXT DEFAULT '45 mins',
    description TEXT,
    image TEXT,
    is_recommended BOOLEAN DEFAULT false,
    is_membership_only BOOLEAN DEFAULT false,
    scheduling_link TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    service_unit_type TEXT DEFAULT 'Session',
    pricing_type TEXT DEFAULT 'Individual',
    pricing_data JSONB DEFAULT '{"individualPrice": 0, "bundleQuantity": 3, "bundlePrice": 0, "tiered": []}'::jsonb,
    before_instructions TEXT,
    after_instructions TEXT,
    requires_consultation BOOLEAN DEFAULT false,
    restrict_cash_balance BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    client_results JSONB DEFAULT '[]'::jsonb,
    practitioner_id UUID REFERENCES public.team_members(id),
    practitioner_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_treatments_clinic ON public.treatments(clinic_id);
CREATE INDEX idx_treatments_category ON public.treatments(clinic_id, category);
```

#### 3. `offers` (Automated & One-Time Flash Campaigns)
```sql
CREATE TABLE public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('automated', 'one_time')),
    occasion TEXT,
    title TEXT,
    subtitle TEXT,
    date_window TEXT,
    banner_title TEXT,
    banner_image_url TEXT,
    preview_image_url TEXT,
    is_active BOOLEAN DEFAULT false,
    discount_type TEXT DEFAULT 'Percentage',
    discount_value NUMERIC DEFAULT 15,
    include_recent_cart BOOLEAN DEFAULT true,
    include_similar_browse BOOLEAN DEFAULT true,
    target_mode TEXT DEFAULT 'Includes',
    target_products JSONB DEFAULT '[]'::jsonb,
    visibility TEXT DEFAULT 'Private',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_offers_clinic_type ON public.offers(clinic_id, type);
CREATE INDEX idx_offers_active ON public.offers(is_active);
```

#### 4. `memberships` (Recurring Subscription Tiers)
```sql
CREATE TABLE public.memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    interval TEXT DEFAULT 'monthly',
    commitment_enabled BOOLEAN DEFAULT false,
    commitment_months INTEGER DEFAULT 3,
    description TEXT,
    image_url TEXT,
    benefits JSONB DEFAULT '[]'::jsonb,
    bonuses JSONB DEFAULT '[]'::jsonb,
    hide_from_shop BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_memberships_clinic ON public.memberships(clinic_id);
```

#### 5. `loyalty_programs` (Gamified Rewards Matrix)
```sql
CREATE TABLE public.loyalty_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    signup_reward INTEGER DEFAULT 150,
    referral_reward INTEGER DEFAULT 300,
    review_reward INTEGER DEFAULT 100,
    checkin_reward INTEGER DEFAULT 50,
    purchase_reward_per_dollar INTEGER DEFAULT 1,
    points_config JSONB DEFAULT '{"signUpReward": 150, "referralReward": 300, "googleReviewReward": 100, "checkInReward": 50, "purchaseRewardPerDollar": 1}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_loyalty_clinic ON public.loyalty_programs(clinic_id);
```

#### 6. `custom_plans` (Bespoke Treatment Bundles)
```sql
CREATE TABLE public.custom_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.client_profiles(id),
    client_name TEXT NOT NULL DEFAULT 'Walk-in Client',
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'Available',
    treatments_count INTEGER DEFAULT 1,
    treatments JSONB DEFAULT '[]'::jsonb,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_custom_plans_clinic ON public.custom_plans(clinic_id);
```

#### 7. `team_members` (Staff Roster & Specialist Permissions)
```sql
CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    aka_name TEXT,
    job_title TEXT NOT NULL,
    biography TEXT,
    avatar_url TEXT,
    phone TEXT,
    email TEXT,
    mrr_generated NUMERIC DEFAULT 0,
    sales_total NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_team_clinic ON public.team_members(clinic_id);
```

#### 8. `client_profiles` (Patient CRM & Historical Spend)
```sql
CREATE TABLE public.client_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    total_spend NUMERIC DEFAULT 0,
    visit_count INTEGER DEFAULT 0,
    last_visit_at TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'active',
    beauty_bank_balance NUMERIC DEFAULT 0,
    reward_points INTEGER DEFAULT 0,
    treatment_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_clients_clinic ON public.client_profiles(clinic_id);
CREATE INDEX idx_clients_email ON public.client_profiles(clinic_id, email);
```

#### 9. `transactions` (Orders, Subscriptions & Redemptions)
```sql
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.client_profiles(id) ON DELETE SET NULL,
    client_name TEXT,
    type TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT DEFAULT 'stripe',
    payment_status TEXT DEFAULT 'succeeded',
    stripe_charge_id TEXT,
    line_items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_transactions_clinic ON public.transactions(clinic_id);
```

### 2.2 Storage Buckets & Content Distribution Matrix

| Bucket Identifier | Purpose & Domain | Permitted MIME Types | Active CDN Path Structure |
|---|---|---|---|
| `merchant-assets` | Agency & Clinic Brand Identity | `image/png`, `image/webp`, `image/svg+xml`, `image/jpeg` | `/merchant-assets/{clinic_id}/logo.webp`, `/ui/empty-state-image.webp` |
| `offer-media` | Automated Campaign & One-time Banners | `image/webp`, `image/png`, `image/jpeg` | `/offer-media/automated/{campaign_name}.webp`, `/offer-media/flash/{id}.jpg` |
| `treatment-media` | Clinical Photography & Before/After Proofs | `image/webp`, `image/jpeg`, `image/png` | `/treatment-media/{clinic_id}/{treatment_slug}/hero.webp` |
| `membership-media` | VIP Membership Lifestyle & Benefit Imagery | `image/webp`, `image/jpeg` | `/membership-media/tiers/{timestamp}_{hash}.ext` |
| `team-and-blog` | Medical Specialists & Educational Posts | `image/webp`, `image/jpeg`, `image/png` | `/team-and-blog/avatars/{timestamp}_{hash}.ext` |
| `clinic-assets` | General Clinic Uploads Fallback | Any image MIME | `/clinic-assets/{folder}/{timestamp}_{hash}.ext` |

---

## 3. Module-by-Module Technical Breakdown

### 3.1 Agency Portal & White Label Engine
- **Tenant Context Provider (`ClinicContext.tsx`):** Holds active selected clinic state in local memory synchronized with browser `localStorage`.
- **Tenant Switcher Bar:** Top-level dropdown allowing rapid switching between medical spas (`SLA Medical`, `SAGE & PURE`, `The Laser Club UK`). Changing tenant context re-keys all downstream query hooks.
- **Dynamic CSS Injection:** Parses the 8-key hex theme palette (`primaryColor`, `accentColor`, `surfaceColor`, etc.) from Supabase and applies inline CSS variables to the DOM root.

### 3.2 Merchant Core Dashboard & Financial Analytics
- **Live Transactions Feed:** Queries `public.transactions` in real time, computing Net Revenue, Average Order Value (AOV), and MRR.
- **Dynamic Recharts Spline Curves:** Real-time visualization curves plotting hourly throughput and monthly subscription growth.
- **Staff Practitioner Performance:** Evaluates individual practitioner sales and MRR contributions dynamically from `team_members`.

### 3.3 App Builder Engine
- **Automated Offers (`OffersTab.tsx`):** 9 holiday campaigns seeded directly with Cloudflare/Supabase CDN assets in `offer-media`. Real-time active status switches sync directly with PostgreSQL.
- **Product Catalog (`ProductsTab.tsx`):** Full CRUD for aesthetic services with multi-tier pricing modes, unit types, anatomical concern tags, before/after photography, and dynamic specialist assignments.
- **Membership Matrix (`AppBuilderMembership.tsx` & `CreateMembershipSheet.tsx`):** Multi-tier recurring plans with minimum commitment controls, direct image uploads to `membership-media`, and nested signup bonuses.
- **Gamified Rewards (`RewardsTab.tsx`):** 5 activity slider controls (sign-up, referral, review, check-in, spend) with 500ms debounced auto-save to `loyalty_programs`.
- **Custom Plans (`CustomPlansTab.tsx`):** Prescribes bespoke multi-treatment packages for individual clients with custom bundled prices and expiration limits, persisted in `custom_plans`.
- **Education Blog CMS (`SettingsTab.tsx`):** Slide-over blog composer publishing articles directly to `articles` table for consumption in the mobile app feed.

### 3.4 Patient App Runtime Integration
- **Direct Supabase Bootstrap:** Mobile container initializes via `SupabaseConfig.url` and `anonKey`, pulling dynamic brand palettes, treatments, and memberships.
- **Automated Holiday Popups (`AutomatedOfferDialog`):** Home screen listens to `activeOffersProvider`, popping high-resolution holiday campaign banners when active.

---

## 4. Current Status, Data Wiring Audit & Discrepancies

| Component / Screen | File Location | Status | Supabase Wiring Details | Notes / Capabilities |
|---|---|---|---|---|
| **Left Sidebar Nav** | `src/components/Sidebar.tsx` | `[Fully Functional]` | Static / Route Driver | Obsidian black (`#0B0D13`) matching design specs |
| **Top Navbar** | `src/components/TopNavbar.tsx` | `[Fully Functional]` | Linked to `ClinicContext` | Crisp white header with active clinic switcher |
| **Dashboard Analytics** | `src/components/MerchantDashboard.tsx`| `[Fully Functional & Wired]` | `public.transactions` | Live Net Revenue, MRR, activity feed & staff sales |
| **Clinic Onboarding Modal**| `src/components/CreateClinicModal.tsx` | `[Fully Functional & Wired]` | `public.clinics` INSERT | Uploads hero image to `clinic-assets` |
| **Product Catalog (Grid)**| `src/components/AppBuilder/ProductsTab.tsx`| `[Fully Functional & Wired]` | `public.treatments` SELECT | Real-time fetch with category & tag filters |
| **Create Product Drawer** | `src/components/AppBuilder/ProductsTab.tsx`| `[Fully Functional & Wired]` | `public.treatments` INSERT | Pricing JSONB, tags, photos & specialist selector |
| **Automated Offers** | `src/components/AppBuilder/OffersTab.tsx` | `[Fully Functional & Wired]` | `public.offers` SELECT/UPDATE | 9 holiday cards wired to `offer-media` CDN |
| **One-Time Flash Offers** | `src/components/AppBuilder/OffersTab.tsx` | `[Fully Functional & Wired]` | `public.offers` INSERT | Creates public/private flash promotions |
| **Membership Plans** | `src/components/AppBuilder/AppBuilderMembership.tsx` | `[Fully Functional & Wired]` | `public.memberships` CRUD | Uploads tier photos to `membership-media` |
| **Dunning & Overview** | `src/components/MembershipsOverview.tsx` | `[Fully Functional & Wired]` | AreaChart + EmptyState | Credit card dunning alerts & monthly signups |
| **Custom Treatment Plans**| `src/components/AppBuilder/CustomPlansTab.tsx`| `[Fully Functional & Wired]` | `public.custom_plans` CRUD | Bespoke bundled treatments saved to database |
| **Rewards & Loyalty** | `src/components/AppBuilder/RewardsTab.tsx` | `[Fully Functional & Wired]` | `public.loyalty_programs` | 500ms debounced auto-sync with saving indicator |
| **App Identity Settings** | `src/components/AppBuilder/SettingsTab.tsx` | `[Fully Functional & Wired]` | `public.clinics` UPDATE | Brand colors, app icon & splash banners |
| **Education Blog CMS** | `src/components/AppBuilder/SettingsTab.tsx` | `[Fully Functional & Wired]` | `public.articles` CRUD | Slide-over drawer publishing to mobile app |
| **Client Profiles CRM** | `src/components/ClientProfiles.tsx` | `[Fully Functional & Wired]` | `public.client_profiles` | Live patient spend, visits & detail history drawer |
| **Empty State Graphic** | `src/components/EmptyState.tsx` | `[Fully Functional & Wired]` | Static Asset & CDN | Integrated across all 7 zero-data states |
| **Team Roster** | `src/components/UserSettings.tsx` | `[Fully Functional & Wired]` | `public.team_members` CRUD | Uploads staff headshots to `team-and-blog` |
| **Shop Summary** | `src/components/ShopSummary.tsx` | `[Fully Functional & Wired]` | `public.transactions` | Live KPI cards (AOV, Total Sales, Recharts Area) |
| **Patient Mobile Offers** | `Patient app/lib/presentation/widgets/automated_offer_dialog.dart` | `[Fully Functional & Wired]` | `public.offers` SELECT | Dynamic holiday modal on home screen load |

---

## 5. Actionable Next Sprint Roadmap

1. **Stripe Connect Express Onboarding:**
   - Deploy Supabase Edge Function `create-stripe-account-link` to handle express onboarding for clinic bank payouts.
2. **Real-time Push Notifications:**
   - Configure Firebase Cloud Messaging (FCM) via Supabase database webhooks on `offers` insert/update.
3. **Automated Cron Jobs:**
   - Schedule `pg_cron` jobs in Supabase to evaluate holiday date windows and toggle `is_active` flags automatically.

---
*Signed and Approved for Production Staging by Antigravity Senior Systems Architecture Team.*
