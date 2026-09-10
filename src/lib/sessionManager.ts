import { supabase } from './supabaseClient';
import { UserSessionRecord } from '../types/gdpr';
import { getDeviceType, sha256Hash } from './cryptoUtils';
import { setSecureCookie, deleteCookie } from './cookieConsent';

export const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
export const WARNING_BEFORE_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes warning before auto-logout

const SESSION_TOKEN_COOKIE = 'sb-access-token';
const REFRESH_TOKEN_COOKIE = 'sb-refresh-token';

class SessionManager {
  private idleTimer: NodeJS.Timeout | null = null;
  private warningTimer: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastActivityTime: number = Date.now();
  private currentSessionId: string | null = null;
  private warningCallback: ((remainingSeconds: number) => void) | null = null;
  private logoutCallback: (() => void) | null = null;

  constructor() {
    this.setupActivityListeners();
  }

  /**
   * Sets up user activity listeners (mouse, keyboard, scroll, touch)
   */
  private setupActivityListeners() {
    if (typeof window === 'undefined') return;

    const recordActivity = () => {
      const now = Date.now();
      // Throttle activity recording to at most once every 15 seconds
      if (now - this.lastActivityTime > 15000) {
        this.lastActivityTime = now;
        this.resetIdleTimers();
      }
    };

    window.addEventListener('mousemove', recordActivity, { passive: true });
    window.addEventListener('keydown', recordActivity, { passive: true });
    window.addEventListener('scroll', recordActivity, { passive: true });
    window.addEventListener('touchstart', recordActivity, { passive: true });
    window.addEventListener('click', recordActivity, { passive: true });
  }

  /**
   * Registers callbacks for session timeout warnings and auto-logout
   */
  public registerCallbacks(
    onWarning: (remainingSeconds: number) => void,
    onLogout: () => void
  ) {
    this.warningCallback = onWarning;
    this.logoutCallback = onLogout;
  }

  /**
   * Resets the idle timeout countdown
   */
  public resetIdleTimers() {
    if (this.warningTimer) clearTimeout(this.warningTimer);
    if (this.idleTimer) clearTimeout(this.idleTimer);

    const timeUntilWarning = IDLE_TIMEOUT_MS - WARNING_BEFORE_TIMEOUT_MS;

    this.warningTimer = setTimeout(() => {
      if (this.warningCallback) {
        this.warningCallback(Math.floor(WARNING_BEFORE_TIMEOUT_MS / 1000));
      }
    }, timeUntilWarning);

    this.idleTimer = setTimeout(() => {
      this.handleIdleTimeout();
    }, IDLE_TIMEOUT_MS);
  }

  /**
   * Triggered when user has been idle for 30 minutes
   */
  private async handleIdleTimeout() {
    console.warn('Nexcore Security: Session timed out due to 30 minutes of inactivity.');
    await this.performSecureSignOut('idle_timeout');
    if (this.logoutCallback) {
      this.logoutCallback();
    }
  }

  /**
   * Initializes session tracking for an authenticated user
   */
  public async initializeSession(userId: string, accessToken?: string): Promise<void> {
    this.resetIdleTimers();

    if (accessToken) {
      setSecureCookie(SESSION_TOKEN_COOKIE, accessToken, 1, 'Lax');
    }

    try {
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
      const deviceType = getDeviceType();
      const tokenHash = accessToken ? await sha256Hash(accessToken) : null;
      const ipHash = await sha256Hash(userId + userAgent);

      const expiresAt = new Date(Date.now() + IDLE_TIMEOUT_MS).toISOString();

      const sessionPayload: Partial<UserSessionRecord> = {
        user_id: userId,
        session_token_hash: tokenHash,
        ip_hash: ipHash,
        user_agent: userAgent.substring(0, 500),
        device_type: deviceType,
        last_active_at: new Date().toISOString(),
        expires_at: expiresAt,
        is_revoked: false,
      };

      const { data, error } = await supabase
        .from('user_sessions')
        .insert(sessionPayload)
        .select('id')
        .single();

      if (!error && data) {
        this.currentSessionId = data.id;
      }
    } catch (err) {
      console.warn('Could not record session in Supabase user_sessions:', err);
    }

    // Start 5-minute heartbeat to update last_active_at in database
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => {
      this.updateHeartbeat();
    }, 5 * 60 * 1000);
  }

  /**
   * Updates last_active_at in DB
   */
  private async updateHeartbeat() {
    if (!this.currentSessionId) return;
    try {
      await supabase
        .from('user_sessions')
        .update({
          last_active_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + IDLE_TIMEOUT_MS).toISOString(),
        })
        .eq('id', this.currentSessionId);
    } catch (e) {
      console.warn('Failed to update session heartbeat:', e);
    }
  }

  /**
   * Performs a clean, secure signout and revokes session everywhere
   */
  public async performSecureSignOut(reason: 'user_action' | 'idle_timeout' = 'user_action'): Promise<void> {
    if (this.warningTimer) clearTimeout(this.warningTimer);
    if (this.idleTimer) clearTimeout(this.idleTimer);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

    // 1. Revoke session in database
    if (this.currentSessionId) {
      try {
        await supabase
          .from('user_sessions')
          .update({
            is_revoked: true,
            expires_at: new Date().toISOString(),
          })
          .eq('id', this.currentSessionId);
      } catch (err) {
        console.warn('Could not mark session as revoked in DB:', err);
      }
      this.currentSessionId = null;
    }

    // 2. Terminate Supabase Auth session
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut error:', err);
    }

    // 3. Purge all auth tokens from cookies & localStorage
    deleteCookie(SESSION_TOKEN_COOKIE);
    deleteCookie(REFRESH_TOKEN_COOKIE);
    deleteCookie('sb-access-token');
    deleteCookie('sb-refresh-token');

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('nexcore_auth');
      localStorage.removeItem('supabase.auth.token');
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }

    console.log(`Nexcore Security: Session invalidated cleanly (${reason}).`);
  }
}

export const sessionManager = new SessionManager();
