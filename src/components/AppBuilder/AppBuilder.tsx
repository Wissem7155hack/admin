import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { AppBuilderTab } from '../../types';
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
  onOpenViewApp?: () => void;
  onOpenQrScan?: () => void;
}

export default function AppBuilder({
  merchantName = 'My Clinic',
  onOpenViewApp,
}: AppBuilderProps) {
  const [tab, setTab] = useState<AppBuilderTab>('Custom plans');
  const [viewAppOpen, setViewAppOpen] = useState(false);
  const [openMembershipComposer, setOpenMembershipComposer] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Clean Tabs Header - Aligned to left edge, larger typography */}
      <div className="border-b border-slate-200 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8 text-sm">
            {TABS.map((t) => {
              const active = t === tab;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={'relative pb-3 transition-all tracking-tight ' + (active ? 'text-slate-900 font-bold border-b-2 border-pink-500' : 'text-slate-400 hover:text-slate-700 font-medium')}
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
            className="flex items-center gap-2 text-sm font-bold text-pink-600 hover:text-pink-700 pb-2 transition-colors"
          >
            <Eye size={17} />
            <span>View app</span>
          </button>
        </div>
      </div>

      {/* Active Tab View Content */}
      <div className="w-full">
        {tab === 'Custom plans' && <CustomPlansTab />}
        {tab === 'Offers' && <OffersTab />}
        {tab === 'Products' && <ProductsTab />}
        {tab === 'Membership' && (
          <AppBuilderMembership
            openComposer={openMembershipComposer}
            onComposerChange={setOpenMembershipComposer}
          />
        )}
        {tab === 'Rewards' && <RewardsTab />}
        {tab === 'Settings' && <SettingsTab />}
      </div>

      {viewAppOpen && (
        <ViewAppModal
          merchantName={merchantName}
          onClose={() => setViewAppOpen(false)}
        />
      )}
    </div>
  );
}
export { AppBuilder };
