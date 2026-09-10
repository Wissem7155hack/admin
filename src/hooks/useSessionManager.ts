import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { sessionManager } from '../lib/sessionManager';

interface UseSessionManagerOptions {
  onAutoLogout?: () => void;
  isAuthenticated?: boolean;
}

export function useSessionManager({ onAutoLogout, isAuthenticated }: UseSessionManagerOptions = {}) {
  const [warningSeconds, setWarningSeconds] = useState<number | null>(null);
  const [isWarningOpen, setIsWarningOpen] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Initial fetch of user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
      if (data?.user && isAuthenticated) {
        supabase.auth.getSession().then(({ data: sessionData }) => {
          sessionManager.initializeSession(data.user.id, sessionData.session?.access_token);
        });
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        sessionManager.initializeSession(session.user.id, session.access_token);
      }
    });

    // Register session idle warnings and logout handler
    sessionManager.registerCallbacks(
      (remainingSeconds) => {
        if (isAuthenticated) {
          setWarningSeconds(remainingSeconds);
          setIsWarningOpen(true);
        }
      },
      () => {
        setIsWarningOpen(false);
        setWarningSeconds(null);
        if (onAutoLogout) {
          onAutoLogout();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isAuthenticated, onAutoLogout]);

  // Countdown timer when warning modal is open
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isWarningOpen && warningSeconds !== null && warningSeconds > 0) {
      interval = setInterval(() => {
        setWarningSeconds((prev) => {
          if (prev === null || prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWarningOpen, warningSeconds]);

  const keepSessionAlive = useCallback(() => {
    sessionManager.resetIdleTimers();
    setIsWarningOpen(false);
    setWarningSeconds(null);
  }, []);

  const performSignOut = useCallback(async () => {
    setIsWarningOpen(false);
    setWarningSeconds(null);
    await sessionManager.performSecureSignOut('user_action');
    if (onAutoLogout) {
      onAutoLogout();
    }
  }, [onAutoLogout]);

  return {
    user,
    isWarningOpen,
    warningSeconds,
    keepSessionAlive,
    performSignOut,
  };
}
