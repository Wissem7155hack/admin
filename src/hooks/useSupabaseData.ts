import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Merchant } from '../types';

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

// Upload any file directly to Supabase storage bucket 'clinic-assets'
export async function uploadClinicAsset(file: File, folder = 'uploads'): Promise<string> {
  const cleanExt = (file.name.split('.').pop() || 'png').toLowerCase();
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${cleanExt}`;
  
  const { data, error } = await supabase.storage
    .from('clinic-assets')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Storage upload error:', error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from('clinic-assets')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

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

  return { treatments, loading, refetch: fetchTreatments, addTreatment, updateTreatment, deleteTreatment };
}

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

  const deleteArticle = async (id: string) => {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) throw error;
    await fetchArticles();
  };

  return { articles, loading, refetch: fetchArticles, addArticle, deleteArticle };
}
