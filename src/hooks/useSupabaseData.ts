
export const SAFE_IMAGE_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23F1F5F9'/%3E%3Cpath d='M30 65 L45 45 L55 58 L70 38 L85 65 Z' fill='%23CBD5E1'/%3E%3Ccircle cx='40' cy='35' r='6' fill='%23CBD5E1'/%3E%3C/svg%3E";

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, fallback = SAFE_IMAGE_FALLBACK) => {
  const target = e.currentTarget;
  if (!target.dataset.hasFallback) {
    target.dataset.hasFallback = 'true';
    target.src = fallback;
  }
};

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Merchant, MembershipRecord, CustomPlan, TeamMember, ClientProfile } from '../types';

export interface ClinicRecord {
  id: string;
  slug: string;
  name: string;
  full_name?: string;
  tagline?: string;
  address?: string;
  hero_image?: string;
  currency_symbol?: string;
  currency_code?: string;
  theme?: Record<string, string>;
  is_active?: boolean;
  created_at?: string;
}

export interface TreatmentRecord {
  id: string;
  clinic_id: string;
  slug?: string;
  name: string;
  category?: string;
  price: number | string;
  duration?: string;
  description?: string;
  image?: string;
  is_recommended?: boolean;
  is_membership_only?: boolean;
  scheduling_link?: string;
  tags?: string[];
  service_unit_type?: string;
  pricing_type?: string;
  pricing_data?: any;
  before_instructions?: string;
  after_instructions?: string;
  requires_consultation?: boolean;
  restrict_cash_balance?: boolean;
  is_hidden?: boolean;
  client_results?: any;
  practitioner_id?: string;
  practitioner_name?: string;
  sort_order?: number;
  created_at?: string;
}

export interface ArticleRecord {
  id: string;
  clinic_id: string;
  slug?: string;
  title: string;
  author?: string;
  snippet?: string;
  body?: string;
  image?: string;
  created_at?: string;
}

export interface TransactionRecord {
  id: string;
  clinic_id: string;
  client_id?: string;
  client_name?: string;
  type: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  stripe_charge_id?: string;
  line_items: any[];
  created_at: string;
}

/**
 * Upload helper to any Supabase bucket
 */
export async function uploadToBucket(
  bucketName: 'clinic-assets' | 'merchant-assets' | 'offer-media' | 'treatment-media' | 'membership-media' | 'team-and-blog',
  file: File,
  folder = 'uploads'
): Promise<string> {
  const cleanExt = (file.name.split('.').pop() || 'png').toLowerCase();
  const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 15);
  const fileName = `${folder}/${Date.now()}_${cleanName}.${cleanExt}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error(`Storage upload error on bucket ${bucketName}:`, error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

export async function uploadMerchantAsset(file: File, folder = 'branding'): Promise<string> {
  return uploadToBucket('merchant-assets', file, folder);
}

export async function uploadClinicAsset(file: File, folder = 'uploads'): Promise<string> {
  return uploadToBucket('clinic-assets', file, folder);
}

export async function uploadMembershipAsset(file: File): Promise<string> {
  return uploadToBucket('membership-media', file, 'tiers');
}

export async function uploadTeamAsset(file: File): Promise<string> {
  return uploadToBucket('team-and-blog', file, 'avatars');
}

export async function uploadTreatmentAsset(file: File): Promise<string> {
  return uploadToBucket('treatment-media', file, 'treatments');
}

/* ========================================================
   1. CLINICS HOOK
   ======================================================== */
export function useClinics() {
  const [clinics, setClinics] = useState<Merchant[]>([]);
  const [rawClinics, setRawClinics] = useState<ClinicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClinics = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setRawClinics(data);
        const mapped: Merchant[] = data.map((c) => ({
          id: c.id,
          name: c.full_name || c.name || 'Clinic',
          clients: 14,
          clientsCount: 14,
          active: c.is_active !== false,
          status: c.is_active !== false ? 'verified' : 'inactive',
          verified: c.is_active !== false,
          color: c.theme?.accentColor || c.theme?.primaryColor || '#EC4899',
          brandColor: c.theme?.accentColor || c.theme?.primaryColor || '#EC4899',
          language: 'English',
          initials: (c.name || c.full_name || 'CL').substring(0, 2).toUpperCase(),
          logoUrl: c.hero_image,
          websiteUrl: '',
          currency: `${c.currency_code || 'USD'} (${c.currency_symbol || '$'})`,
          address: c.address || 'London, UK',
          tagline: c.tagline,
          theme: c.theme,
        }));
        setClinics(mapped);
      }
    } catch (err: any) {
      console.warn('Supabase clinics fetch fallback:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  const addClinic = async (newClinicData: Partial<Merchant> & { themePalette?: Record<string, string>; logoUrl?: string; tagline?: string }) => {
    try {
      const slug = (newClinicData.name || 'clinic')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString(36);
        
      const theme = newClinicData.themePalette || {
        primaryColor: newClinicData.brandColor || '#EC4899',
        secondaryColor: '#1E293B',
        accentColor: newClinicData.brandColor || '#EC4899',
        backgroundColor: '#F8FAFC',
        surfaceColor: '#FFFFFF',
        borderColor: '#E2E8F0',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
      };

      const { data, error } = await supabase
        .from('clinics')
        .insert([
          {
            slug,
            name: (newClinicData.name || 'Clinic').substring(0, 16).toUpperCase(),
            full_name: newClinicData.name || 'New Clinic',
            tagline: newClinicData.tagline || 'Luxury medical aesthetics & wellness clinic.',
            address: newClinicData.address || 'London, UK',
            hero_image: newClinicData.logoUrl || '/images/default-clinic.jpg',
            currency_symbol: '$',
            currency_code: 'USD',
            theme,
            is_active: true,
          },
        ])
        .select();

      if (error) throw error;
      await fetchClinics();
      return data?.[0];
    } catch (err: any) {
      console.error('Failed to create clinic in Supabase:', err);
      throw err;
    }
  };

  const updateClinicTheme = async (clinicId: string, updatedTheme: Record<string, string>) => {
    try {
      const { error } = await supabase
        .from('clinics')
        .update({ theme: updatedTheme })
        .eq('id', clinicId);

      if (error) throw error;
      await fetchClinics();
    } catch (err: any) {
      console.error('Failed to update clinic theme in Supabase:', err);
      throw err;
    }
  };

  const updateClinicStatus = async (clinicId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('clinics')
        .update({ is_active: isActive })
        .eq('id', clinicId);

      if (error) throw error;
      await fetchClinics();
    } catch (err: any) {
      console.error('Failed to update clinic status in Supabase:', err);
      throw err;
    }
  };

  const updateClinicDetails = async (clinicId: string, updates: Partial<ClinicRecord>) => {
    try {
      const { error } = await supabase
        .from('clinics')
        .update(updates)
        .eq('id', clinicId);

      if (error) throw error;
      await fetchClinics();
    } catch (err: any) {
      console.error('Failed to update clinic details in Supabase:', err);
      throw err;
    }
  };

  const deleteClinic = async (clinicId: string) => {
    try {
      const { error } = await supabase
        .from('clinics')
        .delete()
        .eq('id', clinicId);

      if (error) throw error;
      await fetchClinics();
    } catch (err: any) {
      console.error('Failed to delete clinic in Supabase:', err);
      throw err;
    }
  };

  return {
    clinics,
    rawClinics,
    loading,
    error,
    refetch: fetchClinics,
    addClinic,
    updateClinicTheme,
    updateClinicStatus,
    updateClinicDetails,
    deleteClinic,
  };
}

/* ========================================================
   2. TREATMENTS HOOK
   ======================================================== */
export function useTreatments(clinicId?: string) {
  const [treatments, setTreatments] = useState<TreatmentRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTreatments = useCallback(async () => {
    if (!clinicId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTreatments(data || []);
    } catch (err) {
      console.warn('Could not fetch treatments from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    fetchTreatments();
  }, [fetchTreatments]);

  const addTreatment = async (treatment: Omit<TreatmentRecord, 'id'>) => {
    if (!clinicId) return;
    const slug = treatment.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const { data, error } = await supabase
      .from('treatments')
      .insert([{ ...treatment, slug, clinic_id: clinicId }])
      .select();

    if (error) throw error;
    await fetchTreatments();
    return data?.[0];
  };

  const updateTreatment = async (id: string, updates: Partial<Omit<TreatmentRecord, 'id'>>) => {
    const { data, error } = await supabase
      .from('treatments')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    await fetchTreatments();
    return data?.[0];
  };

  const deleteTreatment = async (id: string) => {
    const { error } = await supabase.from('treatments').delete().eq('id', id);
    if (error) throw error;
    await fetchTreatments();
  };

  /**
   * Persist a new display order for treatments.
   * Takes an ordered array of treatment ids (index 0 = first displayed)
   * and writes sort_order = index for each row in a single round trip.
   */
  const reorderTreatments = async (orderedIds: string[]) => {
    const updates = orderedIds.map((id, index) => ({ id, sort_order: index }));
    const { error } = await supabase
      .from('treatments')
      .upsert(updates, { onConflict: 'id' });

    if (error) throw error;
    await fetchTreatments();
  };

  return { treatments, loading, refetch: fetchTreatments, addTreatment, updateTreatment, deleteTreatment, reorderTreatments };
}

/* ========================================================
   3. ARTICLES HOOK
   ======================================================== */
export function useArticles(clinicId?: string) {
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchArticles = useCallback(async () => {
    if (!clinicId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (err) {
      console.warn('Could not fetch articles from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const addArticle = async (article: Omit<ArticleRecord, 'id'>) => {
    if (!clinicId) return;
    const slug = article.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const { data, error } = await supabase
      .from('articles')
      .insert([{ ...article, slug, clinic_id: clinicId }])
      .select();

    if (error) throw error;
    await fetchArticles();
    return data?.[0];
  };

  const updateArticle = async (id: string, updates: Partial<Omit<ArticleRecord, 'id'>>) => {
    const { data, error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    await fetchArticles();
    return data?.[0];
  };

  const deleteArticle = async (id: string) => {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) throw error;
    await fetchArticles();
  };

  return { articles, loading, refetch: fetchArticles, addArticle, updateArticle, deleteArticle };
}

/* ========================================================
   4. MEMBERSHIPS HOOK
   ======================================================== */
export function useMemberships(clinicId?: string) {
  const [memberships, setMemberships] = useState<MembershipRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMemberships = useCallback(async () => {
    if (!clinicId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('clinic_id', clinicId);

      if (error) throw error;

      if (data) {
        const mapped: MembershipRecord[] = data.map((m: any, idx: number) => {
          const rawBenefits = m.benefits;
          let benefitsList: string[] = [];
          let benefitCards: any[] | undefined = undefined;
          let includedTreatments: any[] | undefined = undefined;
          let treatmentsHeader: string = 'Included treatments';
          let testimonials: any[] | undefined = undefined;
          let currency: string = '£';
          let tagline: string = m.name ? ('TRY ' + m.name.toUpperCase()) : 'TRY REFINED METHOD';

          if (rawBenefits && typeof rawBenefits === 'object' && !Array.isArray(rawBenefits)) {
            benefitsList = Array.isArray(rawBenefits.items) ? rawBenefits.items : [];
            benefitCards = Array.isArray(rawBenefits.benefit_cards) ? rawBenefits.benefit_cards : undefined;
            includedTreatments = Array.isArray(rawBenefits.included_treatments) ? rawBenefits.included_treatments : undefined;
            treatmentsHeader = rawBenefits.treatments_header || 'Included treatments';
            testimonials = Array.isArray(rawBenefits.testimonials) ? rawBenefits.testimonials : undefined;
            if (rawBenefits.currency) currency = rawBenefits.currency;
            if (rawBenefits.tagline) tagline = rawBenefits.tagline;
          } else if (Array.isArray(rawBenefits)) {
            benefitsList = rawBenefits;
          } else if (Array.isArray(m.perks)) {
            benefitsList = m.perks;
          }

          if (!testimonials || testimonials.length === 0) {
            testimonials = [
              {
                photoUrl: 'https://jndcmymcnivessmvzpzc.supabase.co/storage/v1/object/public/membership-media/client-results/before_after.webp',
                text: "The transformation was unbelievable. My skin went from dull and tired to glowing and radiant within weeks. I couldn't be happier with the results!",
                clientName: 'Sarah M.',
                treatmentTag: 'After 3 months on Refined Method',
              },
            ];
          }

          if (!includedTreatments || includedTreatments.length === 0) {
            includedTreatments = [
              {
                id: '1',
                name: 'HydraFacial',
                count: 1,
                unit: '1 treatment',
                description:
                  'The HydraFacial delivers unparalleled skin refinement, deep hydration, and luminous radiance, leaving your complexion smooth, refreshed, and exceptionally glowing after just one session.',
                photoUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=300',
              },
              {
                id: '2',
                name: 'Microneedling',
                count: 1,
                unit: '1 treatment',
                description: 'Stimulate natural collagen and elastin production for smoother, firmer texture.',
                photoUrl: 'https://images.unsplash.com/photo-1512290900672-1f02e60f0898?auto=format&fit=crop&q=80&w=300',
              },
            ];
          }

          if (!benefitCards || benefitCards.length === 0) {
            benefitCards = [
              { id: '1', title: 'Savings', desc: 'See big savings on treatments from exclusive member-only discounts!' },
              { id: '2', title: 'Priority booking', desc: 'Enjoy priority booking for hassle-free scheduling and access!' },
              { id: '3', title: 'Exclusive events', desc: 'Attend exclusive events for special offers, treatments and wellness tips!' },
              { id: '4', title: 'Free treatments', desc: 'Get free treatments with your membership on top of special promotions!' },
            ];
          }

          return {
            id: m.id,
            name: m.name || m.title || m.tier_name || 'VIP Tier',
            price: Number(m.price || m.monthly_price) || 0,
            currency,
            description: m.description || '',
            subtitle: m.subtitle || 'The membership that pays for itself',
            tagline,
            imageUrl: m.image_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
            commitmentEnabled: m.commitment_enabled ?? (m.commitment_months > 0),
            commitmentMonths: Number(m.commitment_months) || 6,
            benefits: benefitsList,
            benefitCards,
            includedTreatments,
            treatmentsHeader,
            testimonials,
            bonuses: Array.isArray(m.bonuses) ? m.bonuses : [],
            hideFromShop: !!m.hide_from_shop || !m.is_active,
            is_hidden: !m.is_active || !!m.hide_from_shop,
            display_order: idx,
            sort_order: idx,
          };
        });

        setMemberships(mapped);
      }
    } catch (err) {
      console.warn('Error fetching memberships from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  const addMembership = async (membership: Partial<MembershipRecord>) => {
    if (!clinicId) return;
    try {
      const benefitsData = {
        items: Array.isArray(membership.benefits) ? membership.benefits : [],
        benefit_cards: membership.benefitCards || [],
        included_treatments: membership.includedTreatments || [],
        treatments_header: membership.treatmentsHeader || 'Included treatments',
        testimonials: membership.testimonials || [],
        currency: membership.currency || '£',
        tagline: membership.tagline || (membership.name ? ('TRY ' + membership.name.toUpperCase()) : 'TRY MEMBERSHIP'),
      };

      const payload = {
        clinic_id: clinicId,
        name: membership.name,
        tier_name: membership.name,
        title: membership.name,
        price: Number(membership.price) || 0,
        monthly_price: Number(membership.price) || 0,
        description: membership.description || '',
        subtitle: membership.subtitle || 'The membership that pays for itself',
        button_text: 'See benefits',
        image_url: membership.imageUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
        commitment_enabled: membership.commitmentEnabled ?? true,
        commitment_months: Number(membership.commitmentMonths) || 6,
        perks: Array.isArray(membership.benefits) ? membership.benefits : [],
        benefits: benefitsData,
        bonuses: membership.bonuses || [],
        hide_from_shop: !!membership.hideFromShop,
        is_active: !membership.hideFromShop,
        interval: 'monthly',
      };

      const { data, error } = await supabase
        .from('memberships')
        .insert([payload])
        .select();

      if (error) throw error;
      await fetchMemberships();
      return data?.[0];
    } catch (err) {
      console.error('Failed to create membership in Supabase:', err);
      throw err;
    }
  };

  const updateMembership = async (id: string, membership: Partial<MembershipRecord>) => {
    try {
      const existing = memberships.find((m) => m.id === id);
      const benefitsData = {
        items: membership.benefits ?? existing?.benefits ?? [],
        benefit_cards: membership.benefitCards ?? existing?.benefitCards ?? [],
        included_treatments: membership.includedTreatments ?? existing?.includedTreatments ?? [],
        treatments_header: membership.treatmentsHeader ?? existing?.treatmentsHeader ?? 'Included treatments',
        testimonials: membership.testimonials ?? existing?.testimonials ?? [],
        currency: membership.currency ?? existing?.currency ?? '£',
        tagline: membership.tagline ?? existing?.tagline ?? (membership.name ? ('TRY ' + membership.name.toUpperCase()) : 'TRY MEMBERSHIP'),
      };

      const payload: any = {
        updated_at: new Date().toISOString(),
        benefits: benefitsData,
      };

      if (membership.name !== undefined) {
        payload.name = membership.name;
        payload.tier_name = membership.name;
        payload.title = membership.name;
      }
      if (membership.price !== undefined) {
        payload.price = Number(membership.price) || 0;
        payload.monthly_price = Number(membership.price) || 0;
      }
      if (membership.description !== undefined) payload.description = membership.description;
      if (membership.subtitle !== undefined) payload.subtitle = membership.subtitle;
      if (membership.imageUrl !== undefined) payload.image_url = membership.imageUrl;
      if (membership.commitmentEnabled !== undefined) payload.commitment_enabled = membership.commitmentEnabled;
      if (membership.commitmentMonths !== undefined) payload.commitment_months = Number(membership.commitmentMonths);
      if (membership.benefits !== undefined) {
        payload.perks = Array.isArray(membership.benefits) ? membership.benefits : [];
      }
      if (membership.bonuses !== undefined) payload.bonuses = membership.bonuses;
      if (membership.hideFromShop !== undefined) {
        payload.hide_from_shop = membership.hideFromShop;
        payload.is_active = !membership.hideFromShop;
      }

      const { data, error } = await supabase
        .from('memberships')
        .update(payload)
        .eq('id', id)
        .select();

      if (error) throw error;
      await fetchMemberships();
      return data?.[0];
    } catch (err) {
      console.error('Failed to update membership in Supabase:', err);
      throw err;
    }
  };

  const reorderMemberships = async (orderedIds: string[]) => {
    setMemberships((prev) => {
      const map = new Map(prev.map((m) => [m.id, m]));
      return orderedIds
        .map((id, idx) => {
          const item = map.get(id);
          return item ? { ...item, display_order: idx, sort_order: idx } : null;
        })
        .filter(Boolean) as MembershipRecord[];
    });
  };

  const toggleHideMembership = async (id: string, currentlyHidden: boolean) => {
    const nextHidden = !currentlyHidden;
    setMemberships((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, hideFromShop: nextHidden, is_hidden: nextHidden } : m
      )
    );
    try {
      const { error } = await supabase
        .from('memberships')
        .update({
          hide_from_shop: nextHidden,
          is_active: !nextHidden,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
      await fetchMemberships();
    } catch (err) {
      console.error('Failed to toggle hide membership:', err);
      await fetchMemberships();
    }
  };

  const deleteMembership = async (id: string) => {
    try {
      const { error } = await supabase
        .from('memberships')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setMemberships((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Failed to delete membership in Supabase:', err);
      throw err;
    }
  };

  return {
    memberships,
    loading,
    refetch: fetchMemberships,
    addMembership,
    updateMembership,
    reorderMemberships,
    toggleHideMembership,
    deleteMembership,
  };
}

/* ========================================================
   5. LOYALTY & REWARDS HOOK (With 500ms Debounce)
   ======================================================== */
export interface LoyaltyConfig {
  signUpReward: number;
  referralReward: number;
  googleReviewReward: number;
  checkInReward: number;
  purchaseRewardPerDollar: number;
}

export function useLoyaltyProgram(clinicId?: string) {
  const [config, setConfig] = useState<LoyaltyConfig>({
    signUpReward: 150,
    referralReward: 300,
    googleReviewReward: 100,
    checkInReward: 50,
    purchaseRewardPerDollar: 1,
  });
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch program
  const fetchLoyalty = useCallback(async () => {
    if (!clinicId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('loyalty_programs')
        .select('*')
        .eq('clinic_id', clinicId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const pc = data.points_config || {};
        setConfig({
          signUpReward: data.signup_reward ?? pc.signUpReward ?? 150,
          referralReward: data.referral_reward ?? pc.referralReward ?? 300,
          googleReviewReward: data.review_reward ?? pc.googleReviewReward ?? 100,
          checkInReward: data.checkin_reward ?? pc.checkInReward ?? 50,
          purchaseRewardPerDollar: data.purchase_reward_per_dollar ?? pc.purchaseRewardPerDollar ?? 1,
        });
      }
    } catch (err) {
      console.warn('Error fetching loyalty program:', err);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    fetchLoyalty();
  }, [fetchLoyalty]);

  // Debounced auto-save to Supabase (500ms)
  const saveLoyalty = useCallback(
    (newConfig: LoyaltyConfig) => {
      if (!clinicId) return;

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      setIsSaving(true);
      debounceTimer.current = setTimeout(async () => {
        try {
          const payload = {
            clinic_id: clinicId,
            signup_reward: newConfig.signUpReward,
            referral_reward: newConfig.referralReward,
            review_reward: newConfig.googleReviewReward,
            checkin_reward: newConfig.checkInReward,
            purchase_reward_per_dollar: newConfig.purchaseRewardPerDollar,
            points_config: newConfig,
            updated_at: new Date().toISOString(),
          };

          // Check if exists
          const { data: existing } = await supabase
            .from('loyalty_programs')
            .select('id')
            .eq('clinic_id', clinicId)
            .maybeSingle();

          if (existing) {
            await supabase
              .from('loyalty_programs')
              .update(payload)
              .eq('id', existing.id);
          } else {
            await supabase
              .from('loyalty_programs')
              .insert([payload]);
          }

          setLastSaved(new Date());
        } catch (err) {
          console.error('Failed to sync loyalty config to Supabase:', err);
        } finally {
          setIsSaving(false);
        }
      }, 500);
    },
    [clinicId]
  );

  const updateConfigField = (field: keyof LoyaltyConfig, val: number) => {
    const updated = { ...config, [field]: val };
    setConfig(updated);
    saveLoyalty(updated);
  };

  return { config, loading, isSaving, lastSaved, updateConfigField, refetch: fetchLoyalty };
}

/* ========================================================
   6. CUSTOM PLANS HOOK
   ======================================================== */
export function useCustomPlans(clinicId?: string) {
  const [plans, setPlans] = useState<CustomPlan[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlans = useCallback(async () => {
    if (!clinicId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('custom_plans')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped: CustomPlan[] = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          clientName: p.client_name || 'Walk-in Client',
          status: p.status || 'Available',
          price: Number(p.price) || 0,
          createdAt: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Today',
          treatmentsCount: p.treatments_count || (Array.isArray(p.treatments) ? p.treatments.length : 1),
        }));
        setPlans(mapped);
      }
    } catch (err) {
      console.warn('Error fetching custom plans from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const addPlan = async (plan: { name: string; clientName: string; price: number; treatmentsCount?: number }) => {
    if (!clinicId) return;
    try {
      const payload = {
        clinic_id: clinicId,
        name: plan.name,
        client_name: plan.clientName || 'Walk-in Client',
        price: plan.price,
        status: 'Available',
        treatments_count: plan.treatmentsCount || 3,
        treatments: [],
      };

      const { data, error } = await supabase
        .from('custom_plans')
        .insert([payload])
        .select();

      if (error) throw error;
      await fetchPlans();
      return data?.[0];
    } catch (err) {
      console.error('Failed to create custom plan in Supabase:', err);
      throw err;
    }
  };

  return { plans, loading, refetch: fetchPlans, addPlan };
}

/* ========================================================
   7. TEAM MEMBERS HOOK
   ======================================================== */
export function useTeamMembers(clinicId?: string) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTeam = useCallback(async () => {
    if (!clinicId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        const mapped: TeamMember[] = data.map((m: any) => ({
          id: m.id,
          firstName: m.first_name,
          lastName: m.last_name,
          akaName: m.aka_name || '',
          jobTitle: m.job_title,
          biography: m.biography || '',
          avatarUrl: m.avatar_url,
          mrr: Number(m.mrr_generated) || 0,
          sales: Number(m.sales_total) || 0,
        }));
        setTeamMembers(mapped);
      }
    } catch (err) {
      console.warn('Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const addTeamMember = async (member: {
    firstName: string;
    lastName: string;
    akaName?: string;
    jobTitle: string;
    biography?: string;
    avatarUrl?: string;
  }) => {
    if (!clinicId) return;
    try {
      const payload = {
        clinic_id: clinicId,
        first_name: member.firstName,
        last_name: member.lastName,
        aka_name: member.akaName,
        job_title: member.jobTitle,
        biography: member.biography,
        avatar_url: member.avatarUrl,
        mrr_generated: 0,
        sales_total: 0,
        is_active: true,
      };

      const { data, error } = await supabase
        .from('team_members')
        .insert([payload])
        .select();

      if (error) throw error;
      await fetchTeam();
      return data?.[0];
    } catch (err) {
      console.error('Failed to insert team member in Supabase:', err);
      throw err;
    }
  };

  return { teamMembers, loading, refetch: fetchTeam, addTeamMember };
}

/* ========================================================
   8. CLIENT PROFILES HOOK
   ======================================================== */
export function useClientProfiles(clinicId?: string) {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClients = useCallback(async () => {
    if (!clinicId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped: ClientProfile[] = data.map((c: any) => ({
          id: c.id,
          name: c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Client',
          email: c.email,
          phone: c.phone || '',
          totalSpend: Number(c.total_spend) || 0,
          visits: Number(c.visit_count) || 0,
          lastVisit: c.last_visit_at ? new Date(c.last_visit_at).toLocaleDateString() : 'Recent',
          status: (c.status as any) || 'active',
          avatar: c.avatar_url,
          beautyBankBalance: Number(c.beauty_bank_balance) || 0,
          rewardPoints: Number(c.reward_points) || 0,
          treatmentHistory: c.treatment_history || [],
        }));
        setClients(mapped);
      }
    } catch (err) {
      console.warn('Error fetching client profiles:', err);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return { clients, loading, refetch: fetchClients };
}

/* ========================================================
   9. TRANSACTIONS HOOK (For Live KPI Analytics)
   ======================================================== */
export function useTransactions(clinicId?: string) {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!clinicId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.warn('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Computed metrics
  const totalRevenue = transactions
    .filter((t) => t.payment_status === 'succeeded')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const mrr = transactions
    .filter((t) => t.type === 'membership_rebill' && t.payment_status === 'succeeded')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  return { transactions, totalRevenue, mrr, loading, refetch: fetchTransactions };
}
