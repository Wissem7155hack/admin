/**
 * Cryptographic utility functions for GDPR data anonymization
 */

/**
 * Computes a SHA-256 hash using native Web Crypto API
 * Used for GDPR-compliant hashing of IP addresses and sensitive identifiers
 */
export async function sha256Hash(input: string, salt: string = 'nexcore_gdpr_salt'): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(input + salt);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (err) {
    console.warn('Web Crypto SHA-256 failed, falling back to basic hash algorithm:', err);
  }

  // Pure JS fallback
  let hash = 0;
  const str = input + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return 'fb_' + Math.abs(hash).toString(16).padStart(16, '0');
}

/**
 * Generates a standard UUID v4
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Detects device category from user agent
 */
export function getDeviceType(): 'Desktop' | 'Mobile' | 'Tablet' {
  if (typeof navigator === 'undefined') return 'Desktop';
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(
      ua
    )
  ) {
    return 'Mobile';
  }
  return 'Desktop';
}
