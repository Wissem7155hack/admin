export interface CookieCategories {
  necessary: boolean;
  analytics: boolean;
  preferences: boolean;
  marketing: boolean;
}

export type ConsentStatus = 'pending' | 'accepted' | 'rejected' | 'customized';

export interface CookieConsentRecord {
  id?: string;
  user_id?: string | null;
  consent_uuid: string;
  necessary: boolean;
  analytics: boolean;
  preferences: boolean;
  marketing: boolean;
  policy_version: string;
  ip_address?: string | null;
  user_agent?: string | null;
  consented_at?: string;
  updated_at?: string;
}

export interface UserSessionRecord {
  id?: string;
  user_id: string;
  session_token_hash?: string | null;
  ip_hash?: string | null;
  user_agent?: string | null;
  device_type?: string | null;
  created_at?: string;
  last_active_at?: string;
  expires_at: string;
  is_revoked?: boolean;
}

export interface CookieItemInfo {
  name: string;
  provider: string;
  purpose: string;
  expiry: string;
  category: keyof CookieCategories;
  type: 'HTTP Cookie' | 'Local Storage' | 'Session Storage';
}
