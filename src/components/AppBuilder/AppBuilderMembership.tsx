import { useMemo, useState, useEffect } from 'react';
import {
  MoreVertical,
  Pencil,
  Trash2,
  Plus,
  Sparkles,
  Loader2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Check,
} from 'lucide-react';
import CreateMembershipSheet from './CreateMembershipSheet';
import MembershipPhonePreviewContent from './MembershipPhonePreviewContent';
import IPhoneLockScreen from '../common/IPhoneLockScreen';
import { MembershipRecord } from '../../types';
import { useMemberships } from '../../hooks/useSupabaseData';

interface Props {
  clinicId?: string;
  clinicName?: string;
  openComposer: boolean;
  onComposerChange: (open: boolean) => void;
}

export default function AppBuilderMembership({
  clinicId,
  clinicName = 'SLA Medical Clinic',
  openComposer,
  onComposerChange,
}: Props) {
  const {
    memberships,
    loading,
    addMembership,
    updateMembership,
    reorderMemberships,
    toggleHideMembership,
    deleteMembership,
  } = useMemberships(clinicId);

  const [selectedMembershipId, setSelectedMembershipId] = useState<string | null>(null);
  const [editingMembership, setEditingMembership] = useState<MembershipRecord | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);

  // Drag-and-drop state for 6-dot handles
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [orderNotification, setOrderNotification] = useState<string | null>(null);

  // Auto-select first membership if available
  const featuredMembership = useMemo(() => {
    if (selectedMembershipId) {
      const found = memberships.find((m) => m.id === selectedMembershipId);
      if (found) return found;
    }
    return memberships[0] || null;
  }, [memberships, selectedMembershipId]);

  // Sync external openComposer trigger
  useEffect(() => {
    if (openComposer) {
      setEditingMembership(null);
      setOpenModal(true);
    }
  }, [openComposer]);

  // Close 3-dots dropdown on outside click
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-membership-menu]') && !target.closest('[data-membership-trigger]')) {
        setDropdownOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  // Handle Drag Events
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...memberships];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);

    setDraggedIndex(null);
    setDragOverIndex(null);

    const orderedIds = reordered.map((m) => m.id);
    await reorderMemberships(orderedIds);

    setOrderNotification('Display order updated live in mobile app!');
    setTimeout(() => setOrderNotification(null), 3000);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Move Up / Move Down quick exchange
  const handleMove = async (currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= memberships.length) return;

    const reordered = [...memberships];
    const [item] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, item);

    const orderedIds = reordered.map((m) => m.id);
    await reorderMemberships(orderedIds);

    setOrderNotification('Display order updated live in mobile app!');
    setTimeout(() => setOrderNotification(null), 3000);
  };

  async function handleSaveMembership(record: Partial<MembershipRecord>) {
    try {
      if (editingMembership) {
        await updateMembership(editingMembership.id, record);
      } else {
        await addMembership(record);
      }
    } catch (err) {
      console.error('Failed to save membership in Supabase:', err);
    }
    setOpenModal(false);
    onComposerChange(false);
    setEditingMembership(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this membership plan?')) return;
    try {
      await deleteMembership(id);
      if (selectedMembershipId === id) setSelectedMembershipId(null);
      setDropdownOpenId(null);
    } catch (err) {
      console.error('Failed to delete membership:', err);
    }
  }

  async function handleToggleHide(m: MembershipRecord) {
    setDropdownOpenId(null);
    try {
      await toggleHideMembership(m.id, !!m.hideFromShop);
    } catch (err) {
      console.error('Failed to toggle visibility:', err);
    }
  }

  function openEdit(m: MembershipRecord) {
    setEditingMembership(m);
    setOpenModal(true);
    setDropdownOpenId(null);
  }

  function openCreate() {
    setEditingMembership(null);
    setOpenModal(true);
    onComposerChange(true);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Memberships</h2>
          {loading && <Loader2 size={16} className="animate-spin text-pink-500" />}
          {orderNotification && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 animate-in fade-in">
              <Check size={13} /> {orderNotification}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-pink-500 hover:bg-pink-600 active:scale-[0.98] text-white rounded-full text-xs font-semibold shadow-sm shadow-pink-200 transition-all hover:shadow-md cursor-pointer"
        >
          <Plus size={15} />
          <span>Create a new membership</span>
        </button>
      </div>

      {/* Main 2-Column Split: Left Phone Simulation + Right Reorderable Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Phone Simulation Preview (Enhanced scale 1.75 for crisp readability) */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col items-center sticky top-4">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Live App Preview
          </span>

          <IPhoneLockScreen scale={1.75} className="my-1 drop-shadow-xl">
            <MembershipPhonePreviewContent
              membership={featuredMembership}
              onOpenCreate={openCreate}
              clinicName={clinicName}
            />
          </IPhoneLockScreen>
        </div>

        {/* Right Column: Reorderable Membership Offer Cards */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-500">
              Drag by the 6 dots on the left to reorder membership ranking in the mobile app.
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {memberships.length} {memberships.length === 1 ? 'tier' : 'tiers'}
            </span>
          </div>

          {/* Zero state */}
          {memberships.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-10 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center mb-3">
                <Sparkles size={22} />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Create your first membership!</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Design recurring membership tiers that reward loyalty and unlock steady monthly revenue.
              </p>
              <button
                type="button"
                onClick={openCreate}
                className="mt-4 px-6 py-2.5 bg-pink-500 hover:bg-pink-600 active:scale-[0.98] text-white rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                Create your first membership!
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {memberships.map((m, index) => {
                const isSelected = featuredMembership?.id === m.id;
                const isDropdownOpen = dropdownOpenId === m.id;
                const isDragging = draggedIndex === index;
                const isOver = dragOverIndex === index;
                const currency = m.currency || '£';
                const commitmentStr = m.commitmentMonths ? `${m.commitmentMonths} months` : 'No commitment';
                const isHidden = !!m.hideFromShop || !!m.is_hidden;

                return (
                  <div
                    key={m.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedMembershipId(m.id)}
                    onDoubleClick={() => openEdit(m)}
                    className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                      isOver ? 'border-pink-500 ring-2 ring-pink-500/20 bg-pink-50/20' : ''
                    } ${
                      isSelected
                        ? 'bg-white border-pink-400 shadow-md ring-2 ring-pink-500/10'
                        : 'bg-white border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm'
                    } ${isDragging ? 'opacity-40 scale-[0.99]' : ''}`}
                  >
                    {/* Left: 6-Dot Drag Handle + Offer Details */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* 6-dot drag handle */}
                      <div
                        className="flex items-center justify-center p-1 text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing flex-shrink-0 transition-colors"
                        title="Drag to exchange position and reorder ranking in mobile app"
                      >
                        <div className="grid grid-cols-2 gap-1 w-3.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-500" />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-500" />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-500" />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-500" />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-500" />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-500" />
                        </div>
                      </div>

                      {/* Info & Offer Line matching prompt specification */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-[#25262C] truncate">
                            {m.name}
                          </h4>
                          {isHidden ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                              <EyeOff size={11} /> Hidden from Shop
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <Eye size={11} /> Live in App
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-medium">
                            Rank #{index + 1}
                          </span>
                        </div>

                        {/* Offer line: "Save big money as a SLA Medical Clinic member £159/monthly 3 months" */}
                        <p className="text-xs text-[#6F7788] mt-1 truncate font-normal">
                          Save big money as a {clinicName} member{' '}
                          <span className="font-bold text-pink-600">
                            {currency}{m.price}/monthly
                          </span>{' '}
                          {commitmentStr}
                        </p>
                      </div>
                    </div>

                    {/* Right: Up/Down Swap Controls + Price + 3-Dots Menu */}
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      {/* Keyboard / Click Reorder Arrows */}
                      <div className="hidden sm:flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMove(index, 'up');
                          }}
                          className={`p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors ${
                            index === 0 ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                          title="Move rank up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={index === memberships.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMove(index, 'down');
                          }}
                          className={`p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors ${
                            index === memberships.length - 1 ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                          title="Move rank down"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>

                      {/* Direct Edit Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(m);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-pink-50 text-slate-700 hover:text-pink-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        title="Edit Membership"
                      >
                        <Pencil size={13} />
                        <span>Edit</span>
                      </button>

                      {/* 3-Dots Action Menu */}
                      <div className="relative" data-membership-trigger>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDropdownOpenId(isDropdownOpen ? null : m.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          aria-label="Membership options"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {isDropdownOpen && (
                          <div
                            data-membership-menu
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-8 z-30 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 text-xs animate-in fade-in zoom-in-95 duration-100 text-left"
                          >
                            {/* 1. Edit Membership */}
                            <button
                              type="button"
                              onClick={() => openEdit(m)}
                              className="w-full px-3.5 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium cursor-pointer"
                            >
                              <Pencil size={14} className="text-slate-400" />
                              <span>Edit Membership</span>
                            </button>

                            {/* 2. Hide / Show Membership */}
                            <button
                              type="button"
                              onClick={() => handleToggleHide(m)}
                              className="w-full px-3.5 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium cursor-pointer"
                            >
                              {isHidden ? (
                                <>
                                  <Eye size={14} className="text-emerald-500" />
                                  <span>Show Membership</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff size={14} className="text-amber-500" />
                                  <span>Hide Membership</span>
                                </>
                              )}
                            </button>

                            <div className="h-px bg-slate-100 my-1" />

                            {/* 3. Delete Membership */}
                            <button
                              type="button"
                              onClick={() => handleDelete(m.id)}
                              className="w-full px-3.5 py-2 flex items-center gap-2.5 text-rose-600 hover:bg-rose-50 transition-colors font-medium cursor-pointer"
                            >
                              <Trash2 size={14} />
                              <span>Delete Membership</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SlideOver Modal for Creating & Editing Memberships */}
      <CreateMembershipSheet
        isOpen={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditingMembership(null);
          onComposerChange(false);
        }}
        onSave={handleSaveMembership}
        editingMembership={editingMembership}
        clinicId={clinicId}
        clinicName={clinicName}
      />
    </div>
  );
}
