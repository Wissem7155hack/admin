const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'hooks', 'useSupabaseData.ts');
let content = fs.readFileSync(file, 'utf8');

// 1. Add uploadTreatmentAsset if not present
if (!content.includes('uploadTreatmentAsset')) {
  content = content.replace(
    /export async function uploadTeamAsset[\s\S]*?\n\}/,
    (m) => m + "\n\nexport async function uploadTreatmentAsset(file: File): Promise<string> {\n  return uploadToBucket('clinic-assets', file, 'treatments');\n}"
  );
}

// 2. Replace useMemberships implementation
const searchStart = 'export function useMemberships(clinicId?: string) {';
const searchEnd = '/* ========================================================\n   5. LOYALTY PROGRAM HOOK';
const pStart = content.indexOf(searchStart);
const pLoyalty = content.indexOf('export interface LoyaltyConfig');

if (pStart === -1 || pLoyalty === -1) {
  console.error('Indices not found:', { pStart, pLoyalty });
  process.exit(1);
}

// Find comment block before LoyaltyConfig
let pCut = content.lastIndexOf('/* ========================================================', pLoyalty);
if (pCut === -1) pCut = pLoyalty;

const newUseMemberships = `export function useMemberships(clinicId?: string) {
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

  const addMembership = async (membership: Omit<MembershipRecord, 'id'>) => {
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

`;

content = content.substring(0, pStart) + newUseMemberships + content.substring(pCut);
fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated useMemberships in useSupabaseData.ts!');
