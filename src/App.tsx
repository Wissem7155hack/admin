import { useState, useEffect, useCallback } from 'react';
import { View, Merchant, AppBuilderTab } from './types';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import Login from './components/Login';
import { AgencyDashboard } from './components/AgencyDashboard';
import { MerchantDashboard } from './components/MerchantDashboard';
import WhiteLabelSettings from './components/WhiteLabelSettings';
import ClientProfiles from './components/ClientProfiles';
import ShopSummary from './components/ShopSummary';
import MembershipsOverview from './components/MembershipsOverview';
import AppBuilder from './components/AppBuilder/AppBuilder';
import UserSettings from './components/UserSettings';
import QrScanModal from './components/QrScanModal';
import ViewAppModal from './components/ViewAppModal';
import CookieConsentBanner from './components/CookieConsentBanner';
import PrivacySettingsModal from './components/PrivacySettingsModal';
import SessionTimeoutModal from './components/SessionTimeoutModal';
import { useClinics } from './hooks/useSupabaseData';
import { useSessionManager } from './hooks/useSessionManager';
import { useCookieConsent } from './hooks/useCookieConsent';
import { useEncryptedRouting } from './hooks/useEncryptedRouting';
import { supabase } from './lib/supabaseClient';

const initialMerchants: Merchant[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'SLA Medical Clinic',
    clients: 14,
    clientsCount: 14,
    active: true,
    status: 'verified',
    verified: true,
    color: '#111111',
    brandColor: '#C5A880',
    language: 'English',
    initials: 'SLA',
    logoUrl: 'assets/clinics logos/sla logo.png',
    address: '3 Monton Grn, Worsley, Eccles, Manchester',
    tagline: 'Flawless, radiant, and smooth skin enhances facial beauty.',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Sage & Pure Aesthetics',
    clients: 8,
    clientsCount: 8,
    active: true,
    status: 'verified',
    verified: true,
    color: '#1C2826',
    brandColor: '#7D9D8B',
    language: 'English',
    initials: 'SP',
    logoUrl: 'assets/clinics logos/sage pure logo.png',
    address: 'Harley Street, London',
    tagline: 'Holistic clinical dermatology & regenerative aesthetics.',
  },
];

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('nexcore_auth') === 'true';
  });

  const {
    clinics: liveClinics,
    addClinic,
    deleteClinic,
    updateClinicStatus,
  } = useClinics();

  const [merchants, setMerchants] = useState<Merchant[]>(initialMerchants);
  const [currentMerchant, setCurrentMerchant] = useState<Merchant>(initialMerchants[0]);

  // Callback to sync merchant state when URL token is decrypted
  const handleStateDecrypted = useCallback(
    (decryptedState: { merchantId?: string }) => {
      if (decryptedState.merchantId) {
        const found = merchants.find((m) => m.id === decryptedState.merchantId);
        if (found) {
          setCurrentMerchant(found);
        }
      }
    },
    [merchants]
  );

  // Cryptographically Encrypted URL Routing State Hook
  const {
    currentView,
    appBuilderTab,
    activeModal,
    navigateSecure,
    setAppBuilderTab,
    setActiveModal,
  } = useEncryptedRouting({
    merchants,
    onStateDecrypted: handleStateDecrypted,
  });

  // Cookie Consent state
  const { isPreferencesOpen, closePreferences } = useCookieConsent();

  // Session Manager & Idle Timeout handling
  const { isWarningOpen, warningSeconds, keepSessionAlive, performSignOut } = useSessionManager({
    isAuthenticated,
    onAutoLogout: () => {
      setIsAuthenticated(false);
      navigateSecure({ view: 'agency', merchantId: undefined });
    },
  });

  // Keep React state in sync with Supabase Auth session
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        navigateSecure({ view: 'agency', merchantId: undefined });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigateSecure]);

  // Sync live Supabase clinics when available
  useEffect(() => {
    if (liveClinics && liveClinics.length > 0) {
      setMerchants(liveClinics);
      setCurrentMerchant((prev) => {
        const found = liveClinics.find((c) => c.id === prev.id);
        return found || liveClinics[0];
      });
    }
  }, [liveClinics]);

  const handleSelectMerchant = (merchant: Merchant) => {
    setCurrentMerchant(merchant);
    navigateSecure({
      view: 'merchant',
      merchantId: merchant.id,
    });
  };

  const handleSwitchToAgency = () => {
    navigateSecure({
      view: 'agency',
      merchantId: undefined,
    });
  };

  const handleSignOut = async () => {
    await performSignOut();
  };

  const handleAddMerchant = async (newMerchantData: Partial<Merchant>) => {
    try {
      const created = await addClinic(newMerchantData);
      if (created) {
        console.log('Created clinic in Supabase:', created);
      }
    } catch (e) {
      console.warn('Falling back to local state:', e);
    }
    const newMerchant: Merchant = {
      id: 'm-' + Math.random().toString(36).substring(2, 9),
      name: newMerchantData.name || 'New Clinic',
      clients: 0,
      clientsCount: 0,
      verified: false,
      active: true,
      status: 'to-verify',
      color: newMerchantData.brandColor || newMerchantData.color || '#EC4899',
      brandColor: newMerchantData.brandColor || newMerchantData.color || '#EC4899',
      language: newMerchantData.language || 'English',
      initials: (newMerchantData.name || 'NC').substring(0, 2).toUpperCase(),
    };
    setMerchants((prev) => [newMerchant, ...prev]);
  };

  const handleToggleStatus = async (merchantId: string) => {
    const target = merchants.find((m) => m.id === merchantId);
    const newActive = target ? !target.active : true;
    try {
      await updateClinicStatus(merchantId, newActive);
    } catch (e) {
      console.warn('Failed to update status in Supabase:', e);
    }
    setMerchants((prev) =>
      prev.map((m) =>
        m.id === merchantId
          ? {
              ...m,
              active: newActive,
              status: newActive ? 'active' : 'inactive',
            }
          : m
      )
    );
  };

  const handleDeleteMerchant = async (merchantId: string) => {
    try {
      await deleteClinic(merchantId);
    } catch (e) {
      console.warn('Failed to delete clinic from Supabase:', e);
    }
    setMerchants((prev) => prev.filter((m) => m.id !== merchantId));
  };

  const handleUpdateLanguage = (merchantId: string, language: string) => {
    setMerchants((prev) =>
      prev.map((m) => (m.id === merchantId ? { ...m, language } : m))
    );
  };

  if (!isAuthenticated) {
    return (
      <>
        <Login
          onLogin={() => {
            localStorage.setItem('nexcore_auth', 'true');
            setIsAuthenticated(true);
          }}
        />
        {/* GDPR Cookie Consent Banner visible on login screen */}
        <CookieConsentBanner />
      </>
    );
  }

  const isAgencyView =
    currentView === 'agency' || currentView === 'whitelabel' || currentView === 'settings';

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex font-sans text-gray-900 antialiased selection:bg-pink-100 selection:text-pink-900">
      {/* Sidebar Navigation */}
      <Sidebar
        view={currentView}
        currentView={currentView}
        setView={(v: View) => navigateSecure({ view: v })}
        onNavigate={(v: View) => navigateSecure({ view: v })}
        isAgency={isAgencyView}
        merchants={merchants}
        currentMerchant={currentMerchant}
        onSelectMerchant={handleSelectMerchant}
        onSwitchToAgency={handleSwitchToAgency}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Persistent Top Navbar across the entire app */}
        <TopNavbar
          greeting={isAgencyView ? '' : `${currentMerchant?.name || ''} 👋🏻`}
          userName={isAgencyView ? '' : currentMerchant?.name || ''}
          onOpenQrScan={() => setActiveModal('qr')}
          onOpenUserSettings={() => navigateSecure({ view: 'user_settings' })}
        />

        {/* View Router */}
        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8 lg:py-7">
          <div key={currentView} className="w-full max-w-[1400px] view-transition">
            {currentView === 'agency' && (
              <AgencyDashboard
                merchants={merchants}
                onSelectMerchant={handleSelectMerchant}
                onAddMerchant={handleAddMerchant}
                onToggleStatus={handleToggleStatus}
                onDeleteMerchant={handleDeleteMerchant}
                onUpdateLanguage={handleUpdateLanguage}
              />
            )}

            {(currentView === 'whitelabel' || currentView === 'settings') && (
              <WhiteLabelSettings
                currentMerchant={currentMerchant}
                merchants={merchants}
                onUpdateMerchantColor={(id, color) => {
                  setMerchants((prev) =>
                    prev.map((m) => (m.id === id ? { ...m, color, brandColor: color } : m))
                  );
                  if (currentMerchant.id === id) {
                    setCurrentMerchant((prev) => ({ ...prev, color, brandColor: color }));
                  }
                }}
              />
            )}

            {currentView === 'merchant' && (
              <MerchantDashboard currentMerchant={currentMerchant} />
            )}

            {currentView === 'clients' && <ClientProfiles clinicId={currentMerchant.id} />}
            {currentView === 'shop' && <ShopSummary clinicId={currentMerchant.id} />}
            {currentView === 'memberships' && <MembershipsOverview />}

            {currentView === 'appbuilder' && (
              <AppBuilder
                merchantName={currentMerchant.name}
                currentMerchant={currentMerchant}
                activeTab={appBuilderTab}
                onTabChange={(tab: AppBuilderTab) => setAppBuilderTab(tab)}
                onOpenViewApp={() => setActiveModal('view_app')}
                onOpenQrScan={() => setActiveModal('qr')}
                onUpdateClinic={(updated) => {
                  setMerchants((prev) =>
                    prev.map((m) => (m.id === currentMerchant.id ? { ...m, ...updated } : m))
                  );
                  setCurrentMerchant((prev) => ({ ...prev, ...updated }));
                }}
              />
            )}

            {currentView === 'user_settings' && <UserSettings clinicId={currentMerchant.id} />}
          </div>
        </main>
      </div>

      {/* GDPR Cookie Consent Banner */}
      <CookieConsentBanner />

      {/* Privacy Preference Center Modal */}
      {isPreferencesOpen && (
        <PrivacySettingsModal
          isOpen={isPreferencesOpen}
          onClose={closePreferences}
        />
      )}

      {/* Session Inactivity Timeout Warning Modal */}
      <SessionTimeoutModal
        isOpen={isWarningOpen}
        remainingSeconds={warningSeconds}
        onStayLoggedIn={keepSessionAlive}
        onSignOut={handleSignOut}
      />

      {/* Modals - synced to encrypted route state */}
      {activeModal === 'qr' && (
        <QrScanModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'view_app' && (
        <ViewAppModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          clinicName={currentMerchant?.name}
        />
      )}
    </div>
  );
}

export default App;
