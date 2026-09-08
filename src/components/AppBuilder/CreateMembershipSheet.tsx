import React, { ChangeEvent, useState } from 'react';
import { UploadCloud, Info, Plus } from 'lucide-react';
import SignupBonusSheet from './SignupBonusSheet';
import SlideOverDrawer from '../common/SlideOverDrawer';
import { MembershipRecord, SignupBonus } from '../../types';

interface Props {
  onClose: () => void;
  onCreate: (membership: MembershipRecord) => void;
}

const defaultImage = '/images/spa-membership.jpg';

export default function CreateMembershipSheet({ onClose, onCreate }: Props) {
  const [showSignupBonus, setShowSignupBonus] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(defaultImage);
  const [commitmentEnabled, setCommitmentEnabled] = useState(true);
  const [commitmentMonths, setCommitmentMonths] = useState(0);
  const [bonuses, setBonuses] = useState<SignupBonus[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [nextBenefit, setNextBenefit] = useState('');

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const image = event.target.files?.[0];
    if (!image) {
      return;
    }
    setImageUrl(URL.createObjectURL(image));
  }

  function addBenefit() {
    if (!nextBenefit.trim()) {
      return;
    }
    setBenefits((prev) => [...prev, nextBenefit.trim()]);
    setNextBenefit('');
  }

  function handleAddBonus(bonus: SignupBonus) {
    setBonuses((prev) => [...prev, bonus]);
  }

  function handleCreate() {
    if (!name.trim()) {
      return;
    }

    onCreate({
      id: Date.now().toString(),
      name: name.trim(),
      price,
      description: description.trim(),
      imageUrl,
      commitmentEnabled,
      commitmentMonths,
      benefits,
      bonuses,
    });
  }

  return (
    <>
      <SlideOverDrawer
        isOpen={true}
        onClose={onClose}
        title="Create a membership"
        maxWidth="max-w-xl"
        showCloseX={true}
        footer={
          <>
            <button
              onClick={onClose}
              className="text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-xs font-semibold shadow-sm shadow-pink-200 transition-all hover:shadow-md"
            >
              Create membership
            </button>
          </>
        }
      >
        <div className="space-y-6 text-xs">
          {/* Basic info */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Basic information</h3>
            <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Membership name</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Membership name"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Price per month</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 bg-gray-50 rounded-l-xl text-gray-500 text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    value={price === 0 ? '' : price}
                    onChange={(event) => setPrice(Number(event.target.value))}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded-r-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Membership description"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 placeholder:text-gray-400 resize-none"
              />
            </div>
          </section>

          {/* Picture */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Membership picture</h3>
            <div className="border border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-pink-400 transition-colors bg-gray-50/50">
              <input
                id="membership-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label htmlFor="membership-image" className="cursor-pointer block">
                <UploadCloud className="mx-auto text-gray-400 mb-2" size={24} />
                <p className="text-xs font-semibold text-gray-700">Click to upload or drag and drop</p>
                <p className="text-[11px] text-gray-400 mt-0.5">PNG or JPG (max. 1920x1080px)</p>
              </label>
            </div>
          </section>

          {/* Commitment */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Commitment period (optional)</h3>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50">
              <span className="text-xs text-gray-700 font-medium">Enable minimum commitment period</span>
              <input
                type="checkbox"
                checked={commitmentEnabled}
                onChange={(event) => setCommitmentEnabled(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-pink-500 focus:ring-pink-400"
              />
            </div>
            {commitmentEnabled && (
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={commitmentMonths === 0 ? '' : commitmentMonths}
                  onChange={(event) => setCommitmentMonths(Number(event.target.value))}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  months
                </span>
              </div>
            )}
          </section>

          {/* Signup bonuses */}
          <section className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Signup Bonuses (optional)</h3>
              <button
                type="button"
                onClick={() => setShowSignupBonus(true)}
                className="flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Plus size={13} />
                Add signup bonus
              </button>
            </div>
            {bonuses.length > 0 && (
              <div className="space-y-2">
                {bonuses.map((bonus) => (
                  <div key={bonus.id} className="rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-600">
                    <p className="font-semibold text-gray-800">{bonus.discountType} - {bonus.availability}</p>
                    <p className="text-gray-500">{bonus.description || 'No description'}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Membership benefits */}
          <section className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Membership benefits (optional)</h3>
              <button
                type="button"
                onClick={addBenefit}
                className="flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Plus size={13} />
                Add membership benefits
              </button>
            </div>
            <input
              value={nextBenefit}
              onChange={(event) => setNextBenefit(event.target.value)}
              placeholder="Example: 10% off retail products"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
            />
            {benefits.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {benefits.map((benefit) => (
                  <span key={benefit} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                    {benefit}
                  </span>
                ))}
              </div>
            )}
          </section>
        </div>
      </SlideOverDrawer>

      {showSignupBonus && (
        <SignupBonusSheet
          onClose={() => setShowSignupBonus(false)}
          onSave={(bonus) => {
            handleAddBonus(bonus);
            setShowSignupBonus(false);
          }}
        />
      )}
    </>
  );
}
