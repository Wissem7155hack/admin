import { supabase } from './supabaseClient';
import { CookieCategories, CookieConsentRecord, CookieItemInfo } from '../types/gdpr';
import { generateUUID, sha256Hash } from './cryptoUtils';

export const CURRENT_POLICY_VERSION = 'v1.0';

export const DEFAULT_COOKIE_PREFERENCES: CookieCategories = {
  necessary: true,
  analytics: false,
  preferences: false,
  marketing: false,
};

export const REGISTERED_COOKIES: CookieItemInfo[] = [
  {
    name: 'sb-access-token',
    provider: 'Supabase Auth',
    purpose: 'Stores encrypted session credentials and JWT for dashboard access.',
    expiry: '1 hour (auto-refreshes)',
    category: 'necessary',
    type: 'HTTP Cookie',
  },
  {
    name: 'sb-refresh-token',
    provider: 'Supabase Auth',
    purpose: 'Securely refreshes expired session tokens without user re-prompt.',
    expiry: '30 days',
    category: 'necessary',
    type: 'HTTP Cookie',
  },
  {
    name: 'nexcore_consent_id',
    provider: 'Nexcore Security',
    purpose: 'Preserves anonymous guest consent UUID for GDPR compliance tracking.',
    expiry: '1 year',
    category: 'necessary',
    type: 'HTTP Cookie',
  },
  {
    name: 'nexcore_cookie_consent',
    provider: 'Nexcore Compliance',
    purpose: 'Stores user-selected cookie categories and privacy policy version.',
    expiry: '6 months',
    category: 'necessary',
    type: 'HTTP Cookie',
  },
  {
    name: '_ga, _ga_*',
    provider: 'Google Analytics 4',
    purpose: 'Measures aggregated clinic dashboard performance and usage metrics.',
    expiry: '2 years',
    category: 'analytics',
    type: 'HTTP Cookie',
  },
  {
    name: 'ph_*_posthog',
    provider: 'PostHog Analytics',
    purpose: 'Captures diagnostic user flows to detect UI friction and errors.',
    expiry: '1 year',
    category: 'analytics',
    type: 'HTTP Cookie',
  },
  {
    name: 'nexcore_ui_prefs',
    provider: 'Nexcore App',
    purpose: 'Stores user dashboard layout preferences and theme modes.',
    expiry: '1 year',
    category: 'preferences',
    type: 'Local Storage',
  },
  {
    name: '_fbp',
    provider: 'Meta Pixel',
    purpose: 'Measures marketing campaign effectiveness for patient app onboarding.',
    expiry: '3 months',
    category: 'marketing',
    type: 'HTTP Cookie',
  },
];

const CONSENT_COOKIE_KEY = 'nexcore_cookie_consent';
const CONSENT_UUID_KEY = 'nexcore_consent_id';

/**
 * Sets a secure cookie with strict security flags
 */
export function setSecureCookie(
  name: string,
  value: string,
  days: number = 180,
  sameSite: 'Lax' | 'Strict' | 'None' = 'Lax'
): void {
  if (typeof document === 'undefined') return;

  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const secureFlag = isSecure ? '; Secure' : '';

  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; ${expires}; path=/; SameSite=${sameSite}${secureFlag}`;
}

/**
 * Retrieves a cookie by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
}

/**
 * Removes a cookie completely
 */
export function deleteCookie(name: string, path: string = '/'): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Max-Age=-99999999; path=${path};`;
}

/**
 * Gets or creates an anonymous UUID for consent tracking
 */
export function getOrCreateConsentUUID(): string {
  let uuid = getCookie(CONSENT_UUID_KEY);
  if (!uuid && typeof localStorage !== 'undefined') {
    uuid = localStorage.getItem(CONSENT_UUID_KEY);
  }
  if (!uuid) {
    uuid = generateUUID();
    setSecureCookie(CONSENT_UUID_KEY, uuid, 365, 'Lax');
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CONSENT_UUID_KEY, uuid);
    }
  }
  return uuid;
}

/**
 * Reads the stored consent object from cookie / localStorage
 */
export function getStoredConsent(): CookieCategories | null {
  try {
    const raw = getCookie(CONSENT_COOKIE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        necessary: true,
        analytics: Boolean(parsed.analytics),
        preferences: Boolean(parsed.preferences),
        marketing: Boolean(parsed.marketing),
      };
    }
    if (typeof localStorage !== 'undefined') {
      const lsRaw = localStorage.getItem(CONSENT_COOKIE_KEY);
      if (lsRaw) {
        const parsed = JSON.parse(lsRaw);
        return {
          necessary: true,
          analytics: Boolean(parsed.analytics),
          preferences: Boolean(parsed.preferences),
          marketing: Boolean(parsed.marketing),
        };
      }
    }
  } catch (e) {
    console.error('Failed to parse cookie consent record:', e);
  }
  return null;
}

/**
 * Checks if explicit consent has been recorded
 */
export function hasUserConsented(): boolean {
  return getStoredConsent() !== null;
}

/**
 * Checks whether a specific category has user consent
 */
export function isCategoryAllowed(category: keyof CookieCategories): boolean {
  if (category === 'necessary') return true;
  const current = getStoredConsent();
  return current ? Boolean(current[category]) : false;
}

/**
 * Dispatches a DOM event when consent changes
 */
function notifyConsentChange(consent: CookieCategories): void {
  if (typeof window === 'undefined') return;
  const event = new CustomEvent('nexcore_consent_update', { detail: consent });
  window.dispatchEvent(event);
}

/**
 * Synchronizes user consent with local cookies, storage, and Supabase backend
 */
export async function saveAndSyncConsent(
  categories: Partial<CookieCategories>,
  userId?: string | null
): Promise<CookieConsentRecord> {
  const finalCategories: CookieCategories = {
    necessary: true,
    analytics: Boolean(categories.analytics),
    preferences: Boolean(categories.preferences),
    marketing: Boolean(categories.marketing),
  };

  const consentPayload = JSON.stringify(finalCategories);
  setSecureCookie(CONSENT_COOKIE_KEY, consentPayload, 180, 'Lax');

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(CONSENT_COOKIE_KEY, consentPayload);
  }

  const consentUuid = getOrCreateConsentUUID();
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  const ipHash = await sha256Hash(consentUuid + userAgent);

  const consentRecord: CookieConsentRecord = {
    user_id: userId || null,
    consent_uuid: consentUuid,
    necessary: true,
    analytics: finalCategories.analytics,
    preferences: finalCategories.preferences,
    marketing: finalCategories.marketing,
    policy_version: CURRENT_POLICY_VERSION,
    ip_address: ipHash,
    user_agent: userAgent.substring(0, 500),
    updated_at: new Date().toISOString(),
  };

  // Sync with Supabase table `user_cookie_consents`
  try {
    const { data: existingRows } = await supabase
      .from('user_cookie_consents')
      .select('id')
      .eq('consent_uuid', consentUuid)
      .limit(1);

    if (existingRows && existingRows.length > 0) {
      await supabase
        .from('user_cookie_consents')
        .update({
          user_id: userId || null,
          necessary: consentRecord.necessary,
          analytics: consentRecord.analytics,
          preferences: consentRecord.preferences,
          marketing: consentRecord.marketing,
          policy_version: consentRecord.policy_version,
          ip_address: consentRecord.ip_address,
          user_agent: consentRecord.user_agent,
          updated_at: new Date().toISOString(),
        })
        .eq('consent_uuid', consentUuid);
    } else {
      await supabase.from('user_cookie_consents').insert({
        ...consentRecord,
        consented_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.warn('Could not sync consent to Supabase (offline or unmigrated table):', error);
  }

  // Purge cookies if user revoked consent for analytics/marketing
  if (!finalCategories.analytics) {
    deleteCookie('_ga');
    deleteCookie('_gid');
    deleteCookie('_gat');
  }
  if (!finalCategories.marketing) {
    deleteCookie('_fbp');
  }

  notifyConsentChange(finalCategories);
  return consentRecord;
}

/**
 * Revokes all non-essential cookies and marks preferences as rejected
 */
export async function revokeAllConsent(userId?: string | null): Promise<void> {
  await saveAndSyncConsent(
    {
      necessary: true,
      analytics: false,
      preferences: false,
      marketing: false,
    },
    userId
  );
}

/**
 * Accepts all cookie categories
 */
export async function acceptAllCookies(userId?: string | null): Promise<void> {
  await saveAndSyncConsent(
    {
      necessary: true,
      analytics: true,
      preferences: true,
      marketing: true,
    },
    userId
  );
}

/**
 * Rejects non-essential cookies
 */
export async function rejectNonEssentialCookies(userId?: string | null): Promise<void> {
  await saveAndSyncConsent(
    {
      necessary: true,
      analytics: false,
      preferences: false,
      marketing: false,
    },
    userId
  );
}
