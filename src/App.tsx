import { useState } from 'react';
import { View, Merchant } from './types';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
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

const initialMerchants: Merchant[] = [
  {
    id: 'm-abela',
    name: 'Abela Medical',
    clients: 6,
    clientsCount: 6,
    active: true,
    status: 'to-verify',
    verified: false,
    color: '#EC4899',
    brandColor: '#EC4899',
    language: 'English',
    initials: 'AM',
  },
  {
    id: 'm-avogadro',
    name: 'Avogadro MedSpa',
    clients: 3,
    clientsCount: 3,
    active: true,
    status: 'verified',
    verified: true,
    color: '#3B82F6',
    brandColor: '#3B82F6',
    language: 'English',
    initials: 'AV',
  },
  {
    id: 'm-beauty2go',
    name: 'Beauty2Go Clinic',
    clients: 14,
    clientsCount: 14,
    active: true,
    status: 'verified',
    verified: true,
    color: '#8B5CF6',
    brandColor: '#8B5CF6',
    language: 'German',
    initials: 'B2',
  },
  {
    id: 'm-eva',
    name: 'Eva Clinic Bath',
    clients: 1,
    clientsCount: 1,
    active: true,
    status: 'to-verify',
    verified: false,
    color: '#10B981',
    brandColor: '#10B981',
    language: 'English',
    initials: 'EC',
  },
  {
    id: 'm-evolvmd',
    name: 'EvolvMD Aesthetic Medicine',
    clients: 8,
    clientsCount: 8,
    active: true,
    status: 'verified',
    verified: true,
    color: '#F97316',
    brandColor: '#F97316',
    language: 'English',
    initials: 'EV',
  },
  {
    id: 'm-goodskin',
    name: 'Good Skin Peterborough',
    clients: 0,
    clientsCount: 0,
    active: true,
    status: 'to-verify',
    verified: false,
    color: '#14B8A6',
    brandColor: '#14B8A6',
    language: 'English',
    initials: 'GS',
  },
  {
    id: 'm-hairless',
    name: 'Hairlessskin-Luxemburg',
    clients: 5,
    clientsCount: 5,
    active: true,
    status: 'to-verify',
    verified: false,
    color: '#6366F1',
    brandColor: '#6366F1',
    language: 'French',
    initials: 'HL',
  },
  {
    id: 'm-harley',
    name: 'Harley Skin And Laser',
    clients: 22,
    clientsCount: 22,
    active: true,
    status: 'verified',
    verified: true,
    color: '#EC4899',
    brandColor: '#EC4899',
    language: 'English',
    initials: 'HS',
  },
];

export function App() {
  const [currentView, setCurrentView] = useState<View>('agency');
  const [merchants, setMerchants] = useState<Merchant[]>(initialMerchants);
  const [currentMerchant, setCurrentMerchant] = useState<Merchant>(initialMerchants[0]);

  // Global Modals - closed by default
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isViewAppModalOpen, setIsViewAppModalOpen] = useState(false);

  const handleSelectMerchant = (merchant: Merchant) => {
    setCurrentMerchant(merchant);
    setCurrentView('merchant');
  };

  const handleSwitchToAgency = () => {
    setCurrentView('agency');
  };

  const handleAddMerchant = (newMerchantData: Partial<Merchant>) => {
    const newMerchant: Merchant = {
      id: 'm-' + Math.random().toString(36).substr(2, 9),
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
    setMerchants([newMerchant, ...merchants]);
  };

  const handleToggleStatus = (merchantId: string) => {
    setMerchants((prev) =>
      prev.map((m) =>
        m.id === merchantId
          ? {
            ...m,
            active: !m.active,
            status: m.active ? 'inactive' : 'active',
          }
          : m
      )
    );
  };

  const handleDeleteMerchant = (merchantId: string) => {
    setMerchants((prev) => prev.filter((m) => m.id !== merchantId));
  };

  const handleUpdateLanguage = (merchantId: string, language: string) => {
    setMerchants((prev) =>
      prev.map((m) => (m.id === merchantId ? { ...m, language } : m))
    );
  };

  const isAgencyView =
    currentView === 'agency' || currentView === 'whitelabel' || currentView === 'settings';

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex font-sans text-gray-900 antialiased selection:bg-pink-100 selection:text-pink-900">
      {/* Sidebar Navigation */}
      <Sidebar
        view={currentView}
        currentView={currentView}
        setView={setCurrentView}
        onNavigate={setCurrentView}
        isAgency={isAgencyView}
        merchants={merchants}
        currentMerchant={currentMerchant}
        onSelectMerchant={handleSelectMerchant}
        onSwitchToAgency={handleSwitchToAgency}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Persistent Top Navbar across the entire app */}
        <TopNavbar
          greeting={isAgencyView ? 'Welcome back, Wissem 👋🏻' : `Hello ${currentMerchant?.name || 'Lunè Luxe HeadSpa'} 👋🏻`}
          userName={isAgencyView ? 'Wissem' : currentMerchant?.name || 'Lunè Luxe HeadSpa'}
          onOpenQrScan={() => setIsQrModalOpen(true)}
          onOpenUserSettings={() => setCurrentView('user_settings')}
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

            {currentView === 'whitelabel' && <WhiteLabelSettings />}
            {currentView === 'settings' && <WhiteLabelSettings />}

            {currentView === 'merchant' && (
              <MerchantDashboard currentMerchant={currentMerchant} />
            )}

            {currentView === 'clients' && <ClientProfiles />}
            {currentView === 'shop' && <ShopSummary />}
            {currentView === 'memberships' && <MembershipsOverview />}

            {currentView === 'appbuilder' && (
              <AppBuilder
                merchantName={currentMerchant.name}
                onOpenViewApp={() => setIsViewAppModalOpen(true)}
                onOpenQrScan={() => setIsQrModalOpen(true)}
              />
            )}

            {currentView === 'user_settings' && <UserSettings />}
          </div>
        </main>
      </div>

      {/* Modals - conditionally rendered */}
      {isQrModalOpen && (
        <QrScanModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
        />
      )}

      {isViewAppModalOpen && (
        <ViewAppModal
          isOpen={isViewAppModalOpen}
          onClose={() => setIsViewAppModalOpen(false)}
          clinicName={currentMerchant?.name}
        />
      )}
    </div>
  );
}

export default App;
