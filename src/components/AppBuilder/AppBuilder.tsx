import { useState } from 'react';
import { Eye } from 'lucide-react';
import { AppBuilderTab, Merchant } from '../../types';
import CustomPlansTab from './CustomPlansTab';
import OffersTab from './OffersTab';
import ProductsTab from './ProductsTab';
import AppBuilderMembership from './AppBuilderMembership';
import RewardsTab from './RewardsTab';
import SettingsTab from './SettingsTab';
import ViewAppModal from '../ViewAppModal';

const TABS: AppBuilderTab[] = [
  'Custom plans',
  'Offers',
  'Products',
  'Membership',
  'Rewards',
  'Settings',
];

interface AppBuilderProps {
  merchantName?: string;
  currentMerchant?: Merchant;
  activeTab?: AppBuilderTab;
  onTabChange?: (tab: AppBuilderTab) => void;
  onOpenViewApp?: () => void;
  onOpenQrScan?: () => void;
  onUpdateClinic?: (updated: Partial<Merchant>) => void;
}

export default function AppBuilder({
  merchantName = 'My Clinic',
  currentMerchant,
  activeTab,
  onTabChange,
  onOpenViewApp,
  onUpdateClinic,
}: AppBuilderProps) {
  const [internalTab, setInternalTab] = useState<AppBuilderTab>('Products');
  const tab = activeTab || internalTab;

  const handleTabSelect = (selectedTab: AppBuilderTab) => {
    if (onTabChange) {
      onTabChange(selectedTab);
    } else {
      setInternalTab(selectedTab);
    }
  };

  const [viewAppOpen, setViewAppOpen] = useState(false);
  const [openMembershipComposer, setOpenMembershipComposer] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Clean Tabs Header */}
      <div className="border-b border-slate-200 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8 text-sm">
            {TABS.map((t) => {
              const active = t === tab;
              return (
                <button
                  key={t}
                  onClick={() => handleTabSelect(t)}
                  className={'relative pb-3 transition-all tracking-tight cursor-pointer ' + (active ? 'text-slate-900 font-bold border-b-2 border-pink-500' : 'text-slate-400 hover:text-slate-700 font-medium')}
                >
                  <span className="text-[14px]">{t}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              if (onOpenViewApp) onOpenViewApp();
              else setViewAppOpen(true);
            }}
            className="flex items-center gap-2 text-sm font-bold text-pink-600 hover:text-pink-700 pb-2 transition-colors cursor-pointer"
          >
            <Eye size={17} />
            <span>View app</span>
          </button>
        </div>
      </div>

      {/* Active Tab View Content */}
      <div className="w-full">
        {tab === 'Custom plans' && <CustomPlansTab clinicId={currentMerchant?.id} />}
        {tab === 'Offers' && <OffersTab clinicId={currentMerchant?.id} />}
        {tab === 'Products' && (
          <ProductsTab
            clinicId={currentMerchant?.id}
            clinicName={currentMerchant?.name || merchantName}
          />
        )}
        {tab === 'Membership' && (
          <AppBuilderMembership
            clinicId={currentMerchant?.id}
            clinicName={currentMerchant?.name || merchantName}
            openComposer={openMembershipComposer}
            onComposerChange={setOpenMembershipComposer}
          />
        )}
        {tab === 'Rewards' && <RewardsTab clinicId={currentMerchant?.id} />}
        {tab === 'Settings' && (
          <SettingsTab
            clinicId={currentMerchant?.id}
            currentMerchant={currentMerchant}
            onUpdateClinic={onUpdateClinic}
          />
        )}
      </div>

      {viewAppOpen && (
        <ViewAppModal
          isOpen={viewAppOpen}
          merchantName={merchantName}
          onClose={() => setViewAppOpen(false)}
        />
      )}
    </div>
  );
}

export { AppBuilder };
