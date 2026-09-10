import { createClient } from '@supabase/supabase-js';
import { setSecureCookie, deleteCookie } from './cookieConsent';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://jndcmymcnivessmvzpzc.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuZGNteW1jbml2ZXNzbXZ6cHpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1OTAyNjgsImV4cCI6MjEwNDE2NjI2OH0.dnYecqdQfd-U6Pfu1jjZr9Ievt3HKHv9Cil4wiLWG6A';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Synchronize session token to secure cookies on auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    if (session?.access_token) {
      setSecureCookie('sb-access-token', session.access_token, 1, 'Lax');
    }
    if (session?.refresh_token) {
      setSecureCookie('sb-refresh-token', session.refresh_token, 30, 'Lax');
    }
  } else if (event === 'SIGNED_OUT') {
    deleteCookie('sb-access-token');
    deleteCookie('sb-refresh-token');
  }
});

/**
 * Upload any asset (logo, treatment photography, article cover) to 'clinic-assets' storage bucket
 */
export async function uploadClinicAsset(file: File, folder = 'general'): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 15);
  const fileName = `${folder}/${Date.now()}_${cleanName}.${fileExt}`;

  const { error } = await supabase.storage
    .from('clinic-assets')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Supabase storage upload error:', error);
    throw error;
  }

  const { data } = supabase.storage
    .from('clinic-assets')
    .getPublicUrl(fileName);

  return data.publicUrl;
}
