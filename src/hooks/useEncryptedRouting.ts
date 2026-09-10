import { useState, useEffect, useCallback, useRef } from 'react';
import { View, AppBuilderTab, Merchant } from '../types';
import { SecureRouteState, EncryptedRoutingOptions } from '../types/routeState';
import { encryptRouteParams, decryptRouteParams } from '../utils/urlCrypt';

const URL_PARAM_KEY = 'p';

interface UseEncryptedRoutingProps {
  merchants: Merchant[];
  onStateDecrypted?: (state: SecureRouteState) => void;
}

export function useEncryptedRouting({
  merchants,
  onStateDecrypted,
}: UseEncryptedRoutingProps) {
  const [currentView, setCurrentView] = useState<View>('agency');
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
  const [appBuilderTab, setAppBuilderTab] = useState<AppBuilderTab>('Products');
  const [activeModal, setActiveModal] = useState<SecureRouteState['modal']>(null);
  const [isReady, setIsReady] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(true);

  const stateRef = useRef<SecureRouteState>({
    view: 'agency',
    merchantId: undefined,
    tab: 'Products',
    modal: null,
  });

  // Keep ref updated
  useEffect(() => {
    stateRef.current = {
      view: currentView,
      merchantId: selectedMerchantId || undefined,
      tab: appBuilderTab,
      modal: activeModal,
    };
  }, [currentView, selectedMerchantId, appBuilderTab, activeModal]);

  /**
   * Applies decrypted state to React state and verifies merchant validity
   */
  const applyState = useCallback(
    (state: SecureRouteState | null) => {
      if (!state) {
        // Fallback to safe default view
        setCurrentView('agency');
        setSelectedMerchantId(null);
        setActiveModal(null);
        return;
      }

      if (state.view) {
        setCurrentView(state.view);
      }
      if (state.merchantId) {
        const isValid = !merchants || merchants.length === 0 || merchants.some((m) => m.id === state.merchantId);
        if (isValid) {
          setSelectedMerchantId(state.merchantId);
        }
      }
      if (state.tab) {
        setAppBuilderTab(state.tab);
      }
      if (state.modal !== undefined) {
        setActiveModal(state.modal);
      }

      if (onStateDecrypted) {
        onStateDecrypted(state);
      }
    },
    [merchants, onStateDecrypted]
  );

  /**
   * Reads URL query parameters and decrypts the route token
   */
  const syncFromUrl = useCallback(async () => {
    setIsDecrypting(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get(URL_PARAM_KEY);

      if (token) {
        const decrypted = await decryptRouteParams<SecureRouteState>(token);
        if (decrypted) {
          applyState(decrypted);
        } else {
          console.warn('[useEncryptedRouting] Tampered or corrupted token detected. Resetting to safe state.');
          applyState(null);
          // Clean corrupted token from browser URL cleanly without reload
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        }
      }
    } catch (err) {
      console.error('[useEncryptedRouting] Failed to parse URL token:', err);
      applyState(null);
    } finally {
      setIsDecrypting(false);
      setIsReady(true);
    }
  }, [applyState]);

  // Initial load sync
  useEffect(() => {
    syncFromUrl();
  }, [syncFromUrl]);

  // Handle browser Back / Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      syncFromUrl();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [syncFromUrl]);

  /**
   * Programmatic navigation that automatically encrypts state into URL query parameter
   */
  const navigateSecure = useCallback(
    async (
      nextState: Partial<SecureRouteState>,
      options: EncryptedRoutingOptions = {}
    ) => {
      const merged: SecureRouteState = {
        ...stateRef.current,
        ...nextState,
      };

      // Update internal React states immediately for instant UI responsiveness
      if (nextState.view) setCurrentView(nextState.view);
      if (nextState.merchantId !== undefined) setSelectedMerchantId(nextState.merchantId);
      if (nextState.tab) setAppBuilderTab(nextState.tab);
      if (nextState.modal !== undefined) setActiveModal(nextState.modal);

      try {
        const token = await encryptRouteParams(merged);
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set(URL_PARAM_KEY, token);

        const newUrl = `${window.location.pathname}?${searchParams.toString()}`;

        if (options.replace) {
          window.history.replaceState(merged, '', newUrl);
        } else {
          window.history.pushState(merged, '', newUrl);
        }
      } catch (err) {
        console.error('[useEncryptedRouting] Failed to update encrypted URL:', err);
      }
    },
    []
  );

  /**
   * Generates an encrypted URL string for sharing or deep-linking
   */
  const getEncryptedUrl = useCallback(
    async (targetState: SecureRouteState): Promise<string> => {
      const token = await encryptRouteParams(targetState);
      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set(URL_PARAM_KEY, token);
      return url.toString();
    },
    []
  );

  return {
    currentView,
    selectedMerchantId,
    appBuilderTab,
    activeModal,
    isReady,
    isDecrypting,
    navigateSecure,
    getEncryptedUrl,
    setCurrentView: (view: View) => navigateSecure({ view }),
    setSelectedMerchantId: (id: string | null) => navigateSecure({ merchantId: id || undefined }),
    setAppBuilderTab: (tab: AppBuilderTab) => navigateSecure({ tab }),
    setActiveModal: (modal: SecureRouteState['modal']) => navigateSecure({ modal }),
  };
}
