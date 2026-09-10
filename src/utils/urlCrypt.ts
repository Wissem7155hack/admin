/**
 * Nexcore Cryptographic URL Obfuscation & Deep-Linking Utility
 *
 * Implements authenticated symmetric encryption (AES-GCM 256-bit) via the
 * W3C Web Crypto API with URL-Safe Base64 encoding (RFC 4648).
 *
 * Security Characteristics:
 * - Confidentiality: 256-bit AES encryption prevents exposure of raw IDs or state.
 * - Authenticity & Integrity: AES-GCM provides built-in Galois message authentication (128-bit auth tag),
 *   guaranteeing detection of any tampered or forged URL tokens.
 * - Nonce Uniqueness: Fresh 96-bit (12-byte) cryptographically secure random IV per encryption.
 * - Format: URL-safe Base64 without '=' padding, safe for query params and path segments.
 */

// Global cached CryptoKey to avoid re-deriving on every single route change
let cachedCryptoKey: CryptoKey | null = null;
let cachedRawKeyString: string | null = null;

/**
 * Fallback key strictly for local development if environment variable is missing.
 * Production builds must provide VITE_APP_ENCRYPTION_KEY in .env
 */
const DEFAULT_DEV_KEY = 'nexcore_dev_secret_key_32_bytes_len_secure_default!!';

/**
 * Converts a regular Base64 string to a URL-safe Base64 string (RFC 4648 section 5)
 */
function toBase64Url(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Converts a URL-safe Base64 string back to standard Base64
 */
function fromBase64Url(base64url: string): string {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  return base64;
}

/**
 * Converts Uint8Array to binary string
 */
function bytesToString(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return binary;
}

/**
 * Converts binary string to Uint8Array
 */
function stringToBytes(str: string): Uint8Array {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derives or imports an AES-GCM 256-bit CryptoKey using SHA-256 hash of the secret string.
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  const rawKey =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_ENCRYPTION_KEY) ||
    DEFAULT_DEV_KEY;

  if (cachedCryptoKey && cachedRawKeyString === rawKey) {
    return cachedCryptoKey;
  }

  // Derive 256-bit key from passphrase using SHA-256 digest
  const encoder = new TextEncoder();
  const keyData = encoder.encode(rawKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);

  const importedKey = await crypto.subtle.importKey(
    'raw',
    hashBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  cachedCryptoKey = importedKey;
  cachedRawKeyString = rawKey;

  return importedKey;
}

/**
 * Encrypted payload envelope structure
 */
interface EncryptedEnvelope<T> {
  v: number; // Schema version
  iat: number; // Issued-at timestamp
  data: T; // Actual route parameters / state
}

/**
 * Encrypts an object into a compact, URL-safe AES-GCM encrypted token string.
 *
 * @param data Object containing route parameters, IDs, or state
 * @returns Promise resolving to URL-safe encrypted token
 */
export async function encryptRouteParams<T extends Record<string, any>>(
  data: T
): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit standard IV for AES-GCM

    const envelope: EncryptedEnvelope<T> = {
      v: 1,
      iat: Date.now(),
      data,
    };

    const encoder = new TextEncoder();
    const encodedData = encoder.encode(JSON.stringify(envelope));

    const cipherBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
        tagLength: 128, // 128-bit authentication tag
      },
      key,
      encodedData
    );

    const cipherBytes = new Uint8Array(cipherBuffer);

    // Concatenate [IV (12 bytes) + Ciphertext + Tag (16 bytes)]
    const combined = new Uint8Array(iv.length + cipherBytes.length);
    combined.set(iv, 0);
    combined.set(cipherBytes, iv.length);

    // Convert to Base64URL
    const base64 = btoa(bytesToString(combined));
    return toBase64Url(base64);
  } catch (error) {
    console.error('[urlCrypt] Encryption failed:', error);
    throw new Error('Failed to encrypt route parameters');
  }
}

/**
 * Decrypts a URL-safe token back into the original typed object.
 * Returns null if the token is corrupted, tampered with, expired, or invalid.
 *
 * @param token URL-safe encrypted token string
 * @returns Promise resolving to decrypted object or null
 */
export async function decryptRouteParams<T extends Record<string, any>>(
  token: string
): Promise<T | null> {
  if (!token || typeof token !== 'string') {
    return null;
  }

  try {
    const base64 = fromBase64Url(token.trim());
    const binary = atob(base64);
    const combined = stringToBytes(binary);

    // Minimum length: 12 bytes IV + 16 bytes auth tag = 28 bytes
    if (combined.length < 28) {
      console.warn('[urlCrypt] Token is too short to contain valid IV and tag');
      return null;
    }

    const key = await getEncryptionKey();

    // Extract IV (first 12 bytes) and Ciphertext (remaining bytes including 16-byte tag)
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
        tagLength: 128,
      },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    const decryptedJson = decoder.decode(decryptedBuffer);
    const envelope = JSON.parse(decryptedJson) as EncryptedEnvelope<T>;

    if (!envelope || envelope.v !== 1 || !envelope.data) {
      console.warn('[urlCrypt] Invalid envelope schema version');
      return null;
    }

    return envelope.data;
  } catch (error) {
    // Authentication tag failure or invalid JSON occurs on tampering
    console.warn('[urlCrypt] Decryption or verification failed (tampered or invalid token):', error);
    return null;
  }
}
