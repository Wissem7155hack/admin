import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, MoreVertical, Eye, EyeOff, Trash2, Edit3, Check, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export interface MembershipItem {
  id: string;
  clinic_id: string;
  tier_name: string;
  title: string;
  subtitle: string;
  monthly_price: number;
  perks?: string[] | any;
  display_order: number;
  is_hidden?: boolean;
}

export interface ReorderableMembershipListProps {
  clinicId: string;
  initialMemberships?: MembershipItem[];
  onEdit?: (membership: MembershipItem) => void;
  onDelete?: (membershipId: string) => void;
}

export default function ReorderableMembershipList({
  clinicId,
  initialMemberships = [],
  onEdit,
  onDelete,
}: ReorderableMembershipListProps) {
  const [items, setItems] = useState<MembershipItem[]>(initialMemberships);
  const [loading, setLoading] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch memberships if not provided or when clinic changes
  useEffect(() => {
    if (initialMemberships && initialMemberships.length > 0) {
      const sorted = [...initialMemberships].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
      setItems(sorted);
      return;
    }

    fetchMemberships();
  }, [clinicId, initialMemberships]);

  const fetchMemberships = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Failed to load memberships:', err);
    } finally {
      setLoading(false);
    }
  };

  // Drag & Drop Handler
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    // 1. Optimistic UI Reorder
    const updatedList = Array.from(items);
    const [movedItem] = updatedList.splice(sourceIndex, 1);
    updatedList.splice(destinationIndex, 0, movedItem);

    // Re-assign display_order indices sequentially
    const reordered = updatedList.map((item, index) => ({
      ...item,
      display_order: index,
    }));

    const previousList = items;
    setItems(reordered);
    setIsSavingOrder(true);

    // 2. Persist new display_order to Supabase
    try {
      const updates = reordered.map((m) => ({
        id: m.id,
        clinic_id: m.clinic_id,
        tier_name: m.tier_name,
        title: m.title,
        subtitle: m.subtitle,
        monthly_price: m.monthly_price,
        display_order: m.display_order,
        is_hidden: m.is_hidden ?? false,
      }));

      const { error } = await supabase
        .from('memberships')
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;

      showToast('Order saved successfully');
    } catch (err) {
      console.error('Failed to persist membership reordering:', err);
      // Revert optimistic update
      setItems(previousList);
      showToast('Error saving order. Reverted changes.');
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Toggle Visibility
  const toggleHide = async (id: string, currentHidden: boolean) => {
    setActiveMenuId(null);
    const updated = items.map((i) => (i.id === id ? { ...i, is_hidden: !currentHidden } : i));
    setItems(updated);

    try {
      const { error } = await supabase
        .from('memberships')
        .update({ is_hidden: !currentHidden })
        .eq('id', id);

      if (error) throw error;
      showToast(currentHidden ? 'Tier is now visible' : 'Tier hidden from patient app');
    } catch (err) {
      console.error('Error updating membership visibility:', err);
      fetchMemberships();
    }
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    setActiveMenuId(null);
    if (!window.confirm('Are you sure you want to remove this membership plan?')) return;

    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      const { error } = await supabase.from('memberships').delete().eq('id', id);
      if (error) throw error;
      if (onDelete) onDelete(id);
      showToast('Membership plan removed');
    } catch (err) {
      console.error('Error deleting membership:', err);
      fetchMemberships();
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
        <span className="text-xs">Loading membership tiers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header bar with saving indicator */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <p className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Drag cards by the left grip handle to reorder patient app hierarchy.</span>
        </p>
        {isSavingOrder && (
          <span className="inline-flex items-center gap-1 text-amber-400 font-medium animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Saving order...
          </span>
        )}
        {toastMessage && (
          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium animate-in fade-in">
            <Check className="w-3.5 h-3.5" /> {toastMessage}
          </span>
        )}
      </div>

      {/* Reorderable List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="memberships-droppable">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-3"
            >
              {items.map((item, index) => {
                const perksList = Array.isArray(item.perks)
                  ? item.perks
                  : typeof item.perks === 'string'
                  ? JSON.parse(item.perks || '[]')
                  : [];

                return (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(dragProvided, snapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        className={`group relative flex items-center justify-between rounded-2xl border transition-all ${
                          snapshot.isDragging
                            ? 'bg-slate-900/95 border-amber-500/80 shadow-[0_15px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(212,175,55,0.2)] scale-[1.01] z-30'
                            : item.is_hidden
                            ? 'bg-slate-950/60 border-slate-800/60 opacity-60'
                            : 'bg-slate-950/90 border-slate-800 hover:border-slate-700 shadow-sm'
                        } p-4`}
                      >
                        {/* LEFT: 6-DOT DRAG HANDLE */}
                        <div
                          {...dragProvided.dragHandleProps}
                          className="pr-3 text-slate-500 hover:text-amber-400 cursor-grab active:cursor-grabbing transition-colors"
                          title="Drag to reorder"
                        >
                          <GripVertical className="w-5 h-5" />
                        </div>

                        {/* CENTER: CONTENT */}
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              {item.tier_name || 'VIP TIER'}
                            </span>
                            {item.is_hidden && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-400 bg-slate-800/80">
                                Hidden
                              </span>
                            )}
                            <h4 className="text-sm font-bold text-white truncate">
                              {item.title}
                            </h4>
                          </div>

                          <p className="text-xs text-slate-400 mt-1 truncate">
                            {item.subtitle}
                          </p>

                          {/* Perks Badges */}
                          {perksList.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {perksList.slice(0, 3).map((perk: any, pIdx: number) => (
                                <span
                                  key={pIdx}
                                  className="text-[10px] text-slate-300 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800"
                                >
                                  {typeof perk === 'string' ? perk : perk?.title || 'Perk'}
                                </span>
                              ))}
                              {perksList.length > 3 && (
                                <span className="text-[10px] text-slate-500 font-medium">
                                  +{perksList.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* RIGHT: PRICE & 3-DOT MENU */}
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <div className="text-sm font-extrabold text-white">
                              £{Number(item.monthly_price).toFixed(0)}
                              <span className="text-[11px] font-normal text-slate-400">/mo</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Priority: #{index + 1}
                            </span>
                          </div>

                          {/* 3-Dot Dropdown */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {activeMenuId === item.id && (
                              <div className="absolute right-0 top-9 z-40 w-36 rounded-xl bg-slate-900 border border-slate-800 shadow-xl py-1 text-xs text-slate-300 animate-in fade-in duration-150">
                                {onEdit && (
                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onEdit(item);
                                    }}
                                    className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-800 hover:text-white text-left"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Edit Plan</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => toggleHide(item.id, !!item.is_hidden)}
                                  className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-800 hover:text-white text-left"
                                >
                                  {item.is_hidden ? (
                                    <>
                                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Show in App</span>
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Hide in App</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="w-full px-3 py-2 flex items-center gap-2 hover:bg-red-950/50 hover:text-red-300 text-red-400 text-left"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
