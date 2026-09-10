import { useState, useEffect, useCallback } from 'react';
import { CookieCategories } from '../types/gdpr';
import {
  getStoredConsent,
  hasUserConsented,
  acceptAllCookies,
  rejectNonEssentialCookies,
  saveAndSyncConsent,
  revokeAllConsent,
  DEFAULT_COOKIE_PREFERENCES,
} from '../lib/cookieConsent';
import { supabase } from '../lib/supabaseClient';

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieCategories>(() => {
    return getStoredConsent() || DEFAULT_COOKIE_PREFERENCES;
  });
  const [hasConsented, setHasConsented] = useState<boolean>(() => hasUserConsented());
  const [isBannerOpen, setIsBannerOpen] = useState<boolean>(() => !hasUserConsented());
  const [isPreferencesOpen, setIsPreferencesOpen] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync current Supabase user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUserId(data.user.id);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Listen for consent updates
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<CookieCategories>;
      if (customEvent.detail) {
        setConsent(customEvent.detail);
        setHasConsented(true);
      }
    };

    window.addEventListener('nexcore_consent_update', handleUpdate);
    return () => window.removeEventListener('nexcore_consent_update', handleUpdate);
  }, []);

  const acceptAll = useCallback(async () => {
    setIsSaving(true);
    try {
      await acceptAllCookies(userId);
      setHasConsented(true);
      setIsBannerOpen(false);
      setIsPreferencesOpen(false);
    } finally {
      setIsSaving(false);
    }
  }, [userId]);

  const rejectNonEssential = useCallback(async () => {
    setIsSaving(true);
    try {
      await rejectNonEssentialCookies(userId);
      setHasConsented(true);
      setIsBannerOpen(false);
      setIsPreferencesOpen(false);
    } finally {
      setIsSaving(false);
    }
  }, [userId]);

  const savePreferences = useCallback(
    async (newPreferences: Partial<CookieCategories>) => {
      setIsSaving(true);
      try {
        await saveAndSyncConsent(newPreferences, userId);
        setHasConsented(true);
        setIsBannerOpen(false);
        setIsPreferencesOpen(false);
      } finally {
        setIsSaving(false);
      }
    },
    [userId]
  );

  const revokeConsent = useCallback(async () => {
    setIsSaving(true);
    try {
      await revokeAllConsent(userId);
      setHasConsented(false);
      setIsPreferencesOpen(false);
      setIsBannerOpen(true);
    } finally {
      setIsSaving(false);
    }
  }, [userId]);

  return {
    consent,
    hasConsented,
    isBannerOpen,
    isPreferencesOpen,
    isSaving,
    openBanner: () => setIsBannerOpen(true),
    closeBanner: () => setIsBannerOpen(false),
    openPreferences: () => setIsPreferencesOpen(true),
    closePreferences: () => setIsPreferencesOpen(false),
    acceptAll,
    rejectNonEssential,
    savePreferences,
    revokeConsent,
  };
}
