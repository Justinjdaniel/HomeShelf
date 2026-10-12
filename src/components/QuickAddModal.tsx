/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  InventoryItem,
  MasterCategory,
  MasterLocation,
  MasterShelf,
  MasterUnit,
  MasterPriority,
} from '../types/inventory';
import { dbService } from '../services/db';
import { compressAndResizeImage, OptimizedImageResult } from '../utils/imageOptimizer';
import { triggerHaptic } from '../utils/nativeAlerts';
import { IconPickerModal } from './common/IconPickerModal';

interface QuickAddModalProps {
  categories: MasterCategory[];
  locations: MasterLocation[];
  shelves: MasterShelf[];
  units: MasterUnit[];
  priorities: MasterPriority[];
  currency?: string;
  onSave: (item: InventoryItem) => void;
  onClose: () => void;
  onRefreshMasterData?: () => void;
  onShowToast?: (message: string) => void;
  isDark: boolean;
}

type ManageableSection = 'categories' | 'locations' | 'shelves' | 'units' | 'priorities' | null;

interface QuickFillPreset {
  id: string;
  name: string;
  icon: string;
  color: string;
  categoryKeyword: string;
  locationKeyword: string;
  unitKeyword: string;
  defaultItemName: string;
  description: string;
  quantity: number;
  targetQuantity: number;
  price: number;
  daysToExpiry: number;
  priorityId?: string;
}

const QUICK_FILL_PRESETS: QuickFillPreset[] = [
  {
    id: 'preset_grocery',
    name: 'Weekly Grocery',
    icon: 'shopping_basket',
    color: '#10b981',
    categoryKeyword: 'produce',
    locationKeyword: 'kitchen',
    unitKeyword: 'pack',
    defaultItemName: 'Organic Baby Spinach & Greens',
    description: 'Fresh weekly produce batch',
    quantity: 2,
    targetQuantity: 4,
    price: 18.5,
    daysToExpiry: 7,
    priorityId: 'prio_critical',
  },
  {
    id: 'preset_office',
    name: 'Office Supplies',
    icon: 'desk',
    color: '#6366f1',
    categoryKeyword: 'household',
    locationKeyword: 'office',
    unitKeyword: 'box',
    defaultItemName: 'A4 Printing Paper Ream & Ballpoints',
    description: 'Desk & archive stationary equipment',
    quantity: 3,
    targetQuantity: 6,
    price: 35.0,
    daysToExpiry: 365,
    priorityId: 'prio_normal',
  },
  {
    id: 'preset_medical',
    name: 'Medical & Pharmacy',
    icon: 'medication',
    color: '#f43f5e',
    categoryKeyword: 'medical',
    locationKeyword: 'kitchen',
    unitKeyword: 'box',
    defaultItemName: 'Paracetamol & Antiseptic Bandages',
    description: 'Home first aid and health cabinet',
    quantity: 2,
    targetQuantity: 3,
    price: 24.5,
    daysToExpiry: 180,
    priorityId: 'prio_critical',
  },
  {
    id: 'preset_cleaning',
    name: 'Household Cleaning',
    icon: 'cleaning_services',
    color: '#06b6d4',
    categoryKeyword: 'household',
    locationKeyword: 'kitchen',
    unitKeyword: 'btl',
    defaultItemName: 'Multi-Surface Antibacterial Spray',
    description: 'Household hygiene refill bottle',
    quantity: 1,
    targetQuantity: 3,
    price: 16.0,
    daysToExpiry: 365,
    priorityId: 'prio_household',
  },
  {
    id: 'preset_beverages',
    name: 'Coffee & Beverages',
    icon: 'coffee',
    color: '#f59e0b',
    categoryKeyword: 'beverages',
    locationKeyword: 'kitchen',
    unitKeyword: 'pack',
    defaultItemName: 'Ethiopian Single Origin Coffee Beans',
    description: 'Fresh roast 500g whole bean bag',
    quantity: 1,
    targetQuantity: 3,
    price: 42.0,
    daysToExpiry: 60,
    priorityId: 'prio_replenish',
  },
  {
    id: 'preset_pantry',
    name: 'Pantry Staples',
    icon: 'kitchen',
    color: '#8b5cf6',
    categoryKeyword: 'pantry',
    locationKeyword: 'kitchen',
    unitKeyword: 'kg',
    defaultItemName: 'Extra Virgin Cold Pressed Olive Oil',
    description: '1L pantry cooking reserve',
    quantity: 2,
    targetQuantity: 4,
    price: 26.5,
    daysToExpiry: 365,
    priorityId: 'prio_replenish',
  },
];

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  categories: initialCategories,
  locations: initialLocations,
  shelves: initialShelves,
  units: initialUnits,
  priorities: initialPriorities,
  currency = 'AED',
  onSave,
  onClose,
  onRefreshMasterData,
  onShowToast,
  isDark,
}) => {
  // Local master data lists (synced with parent, but updated locally on edit/remove)
  const [localCategories, setLocalCategories] = useState<MasterCategory[]>(initialCategories);
  const [localLocations, setLocalLocations] = useState<MasterLocation[]>(initialLocations);
  const [localShelves, setLocalShelves] = useState<MasterShelf[]>(initialShelves);
  const [localUnits, setLocalUnits] = useState<MasterUnit[]>(initialUnits);
  const [localPriorities, setLocalPriorities] = useState<MasterPriority[]>(initialPriorities);

  useEffect(() => {
    setLocalCategories(initialCategories);
  }, [initialCategories]);

  useEffect(() => {
    setLocalLocations(initialLocations);
  }, [initialLocations]);

  useEffect(() => {
    setLocalShelves(initialShelves);
  }, [initialShelves]);

  useEffect(() => {
    setLocalUnits(initialUnits);
  }, [initialUnits]);

  useEffect(() => {
    setLocalPriorities(initialPriorities);
  }, [initialPriorities]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(initialCategories[0]?.id || 'cat_pantry');
  const [locationId, setLocationId] = useState(initialLocations[0]?.id || 'loc_kitchen');
  const [shelfId, setShelfId] = useState(initialShelves[0]?.id || 'shelf_pantry_2');
  const [quantity, setQuantity] = useState(1);
  const [targetQuantity, setTargetQuantity] = useState(2);
  const [unitId, setUnitId] = useState(initialUnits[0]?.id || 'unit_un');
  const [price, setPrice] = useState(18.5);
  const [expirationDate, setExpirationDate] = useState('2027-06-30');
  const [priorityId, setPriorityId] = useState(initialPriorities[0]?.id || 'prio_normal');

  // Quick fill preset state
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Manage section modal state
  const [managingSection, setManagingSection] = useState<ManageableSection>(null);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editOptionText, setEditOptionText] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [newOptionInput, setNewOptionInput] = useState('');

  // Image optimization state
  const [optimizedImage, setOptimizedImage] = useState<OptimizedImageResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Icon picker state
  const [iconPickerTarget, setIconPickerTarget] = useState<{
    type: 'categories' | 'locations';
    id: string;
    currentIcon: string;
    title: string;
  } | null>(null);

  // Filter shelves for selected location
  const availableShelves = localShelves.filter((s) => s.locationId === locationId);

  // Apply Quick Fill preset
  const handleApplyPreset = (preset: QuickFillPreset) => {
    triggerHaptic('tap');
    setActivePreset(preset.id);
    setName(preset.defaultItemName);
    setDescription(preset.description);
    setQuantity(preset.quantity);
    setTargetQuantity(preset.targetQuantity);
    setPrice(preset.price);

    // Calculate expiration date
    const expDate = new Date(Date.now() + preset.daysToExpiry * 24 * 60 * 60 * 1000);
    setExpirationDate(expDate.toISOString().slice(0, 10));

    // Match best category
    const matchedCategory =
      localCategories.find(
        (c) =>
          c.id.toLowerCase().includes(preset.categoryKeyword) ||
          c.name.toLowerCase().includes(preset.categoryKeyword)
      ) || localCategories[0];
    if (matchedCategory) setCategoryId(matchedCategory.id);

    // Match best location
    const matchedLocation =
      localLocations.find(
        (l) =>
          l.id.toLowerCase().includes(preset.locationKeyword) ||
          l.name.toLowerCase().includes(preset.locationKeyword)
      ) || localLocations[0];
    if (matchedLocation) {
      setLocationId(matchedLocation.id);
      const locShelves = localShelves.filter((s) => s.locationId === matchedLocation.id);
      if (locShelves.length > 0) {
        setShelfId(locShelves[0].id);
      }
    }

    // Match best unit
    const matchedUnit =
      localUnits.find(
        (u) =>
          u.id.toLowerCase().includes(preset.unitKeyword) ||
          u.abbreviation.toLowerCase().includes(preset.unitKeyword) ||
          u.label.toLowerCase().includes(preset.unitKeyword)
      ) || localUnits[0];
    if (matchedUnit) setUnitId(matchedUnit.id);

    if (preset.priorityId) {
      const matchedPrio = localPriorities.find((p) => p.id === preset.priorityId);
      if (matchedPrio) setPriorityId(matchedPrio.id);
    }

    if (onShowToast) {
      onShowToast(`Quick Fill applied: ${preset.name}`);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const result = await compressAndResizeImage(file, 800, 800, 0.8);
      setOptimizedImage(result);
    } catch (err) {
      console.error('Image compression failed:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  // --- Section Option Management Handlers (Edit, Remove, Add) ---

  const handleStartEdit = (id: string, currentText: string) => {
    setEditingOptionId(id);
    setEditOptionText(currentText);
    setConfirmDeleteId(null);
  };

  const handleSaveEditedOption = async () => {
    if (!editingOptionId || !editOptionText.trim()) return;
    const trimmed = editOptionText.trim();
    triggerHaptic('tap');

    try {
      if (managingSection === 'categories') {
        const cat = localCategories.find((c) => c.id === editingOptionId);
        if (cat) {
          const updated = { ...cat, name: trimmed };
          await dbService.saveCategory(updated);
          setLocalCategories((prev) => prev.map((c) => (c.id === editingOptionId ? updated : c)));
          if (onShowToast) onShowToast(`Category updated to "${trimmed}"`);
        }
      } else if (managingSection === 'locations') {
        const loc = localLocations.find((l) => l.id === editingOptionId);
        if (loc) {
          const updated = { ...loc, name: trimmed };
          await dbService.saveLocation(updated);
          setLocalLocations((prev) => prev.map((l) => (l.id === editingOptionId ? updated : l)));
          if (onShowToast) onShowToast(`Location updated to "${trimmed}"`);
        }
      } else if (managingSection === 'shelves') {
        const shelf = localShelves.find((s) => s.id === editingOptionId);
        if (shelf) {
          const updated = { ...shelf, name: trimmed };
          await dbService.saveShelf(updated);
          setLocalShelves((prev) => prev.map((s) => (s.id === editingOptionId ? updated : s)));
          if (onShowToast) onShowToast(`Shelf updated to "${trimmed}"`);
        }
      } else if (managingSection === 'units') {
        const unit = localUnits.find((u) => u.id === editingOptionId);
        if (unit) {
          const updated = { ...unit, label: trimmed };
          await dbService.saveUnit(updated);
          setLocalUnits((prev) => prev.map((u) => (u.id === editingOptionId ? updated : u)));
          if (onShowToast) onShowToast(`Unit updated to "${trimmed}"`);
        }
      } else if (managingSection === 'priorities') {
        const prio = localPriorities.find((p) => p.id === editingOptionId);
        if (prio) {
          const updated = { ...prio, label: trimmed };
          await dbService.savePriority(updated);
          setLocalPriorities((prev) => prev.map((p) => (p.id === editingOptionId ? updated : p)));
          if (onShowToast) onShowToast(`Priority updated to "${trimmed}"`);
        }
      }

      setEditingOptionId(null);
      setEditOptionText('');
      if (onRefreshMasterData) onRefreshMasterData();
    } catch {
      if (onShowToast) onShowToast('Failed to save option changes');
    }
  };

  const handleUpdateOptionIcon = async (newIcon: string) => {
    if (!iconPickerTarget) return;
    const { type, id } = iconPickerTarget;

    try {
      if (type === 'categories') {
        const cat = localCategories.find((c) => c.id === id);
        if (cat) {
          const updated = { ...cat, icon: newIcon };
          await dbService.saveCategory(updated);
          setLocalCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
          if (onShowToast) onShowToast(`Icon updated for "${cat.name}"`);
        }
      } else if (type === 'locations') {
        const loc = localLocations.find((l) => l.id === id);
        if (loc) {
          const updated = { ...loc, icon: newIcon };
          await dbService.saveLocation(updated);
          setLocalLocations((prev) => prev.map((l) => (l.id === id ? updated : l)));
          if (onShowToast) onShowToast(`Icon updated for "${loc.name}"`);
        }
      }
      if (onRefreshMasterData) onRefreshMasterData();
    } catch {
      if (onShowToast) onShowToast('Failed to update option icon');
    } finally {
      setIconPickerTarget(null);
    }
  };

  const handleDeleteOption = async (id: string, name: string) => {
    triggerHaptic('consume');
    try {
      if (managingSection === 'categories') {
        await dbService.deleteCategory(id);
        const filtered = localCategories.filter((c) => c.id !== id);
        setLocalCategories(filtered);
        if (categoryId === id && filtered.length > 0) setCategoryId(filtered[0].id);
      } else if (managingSection === 'locations') {
        await dbService.deleteLocation(id);
        const filtered = localLocations.filter((l) => l.id !== id);
        setLocalLocations(filtered);
        if (locationId === id && filtered.length > 0) setLocationId(filtered[0].id);
      } else if (managingSection === 'shelves') {
        await dbService.deleteShelf(id);
        const filtered = localShelves.filter((s) => s.id !== id);
        setLocalShelves(filtered);
        if (shelfId === id && filtered.length > 0) setShelfId(filtered[0].id);
      } else if (managingSection === 'units') {
        await dbService.deleteUnit(id);
        const filtered = localUnits.filter((u) => u.id !== id);
        setLocalUnits(filtered);
        if (unitId === id && filtered.length > 0) setUnitId(filtered[0].id);
      } else if (managingSection === 'priorities') {
        await dbService.deletePriority(id);
        const filtered = localPriorities.filter((p) => p.id !== id);
        setLocalPriorities(filtered);
        if (priorityId === id && filtered.length > 0) setPriorityId(filtered[0].id);
      }

      setConfirmDeleteId(null);
      if (onShowToast) onShowToast(`Removed "${name}" from options`);
      if (onRefreshMasterData) onRefreshMasterData();
    } catch {
      if (onShowToast) onShowToast('Failed to remove option');
    }
  };

  const handleAddNewOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionInput.trim() || !managingSection) return;
    const trimmed = newOptionInput.trim();
    triggerHaptic('success');

    try {
      const newId = `${managingSection}_${Date.now()}`;
      if (managingSection === 'categories') {
        const newCat: MasterCategory = {
          id: newId,
          name: trimmed,
          icon: 'category',
          color: '#38bdf8',
          isCustom: true,
        };
        await dbService.saveCategory(newCat);
        setLocalCategories((prev) => [...prev, newCat]);
        setCategoryId(newId);
      } else if (managingSection === 'locations') {
        const newLoc: MasterLocation = {
          id: newId,
          name: trimmed,
          icon: 'meeting_room',
          itemCount: 0,
          isCustom: true,
        };
        await dbService.saveLocation(newLoc);
        setLocalLocations((prev) => [...prev, newLoc]);
        setLocationId(newId);
      } else if (managingSection === 'shelves') {
        const newShelf: MasterShelf = {
          id: newId,
          locationId: locationId || localLocations[0]?.id || 'loc_kitchen',
          name: trimmed,
          capacityPercent: 0,
          healthStatus: 'optimal',
          totalItems: 0,
          isCustom: true,
        };
        await dbService.saveShelf(newShelf);
        setLocalShelves((prev) => [...prev, newShelf]);
        setShelfId(newId);
      } else if (managingSection === 'units') {
        const newUnit: MasterUnit = {
          id: newId,
          label: trimmed,
          abbreviation: trimmed.slice(0, 3).toLowerCase(),
          isCustom: true,
        };
        await dbService.saveUnit(newUnit);
        setLocalUnits((prev) => [...prev, newUnit]);
        setUnitId(newId);
      } else if (managingSection === 'priorities') {
        const newPrio: MasterPriority = {
          id: newId,
          label: trimmed,
          level: 5,
          badgeColor: '#38bdf8',
          isCustom: true,
        };
        await dbService.savePriority(newPrio);
        setLocalPriorities((prev) => [...prev, newPrio]);
        setPriorityId(newId);
      }

      setNewOptionInput('');
      if (onShowToast) onShowToast(`Added new option "${trimmed}"`);
      if (onRefreshMasterData) onRefreshMasterData();
    } catch {
      if (onShowToast) onShowToast('Failed to create new option');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const selectedLoc = localLocations.find((l) => l.id === locationId);
    const selectedShelf = localShelves.find((s) => s.id === shelfId);

    const newItem: InventoryItem = {
      id: `item_custom_${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Custom domestic inventory asset',
      categoryId,
      locationId,
      shelfId: shelfId || availableShelves[0]?.id || 'shelf_default',
      shelfLocation: `${selectedLoc?.name || 'Pantry'} • ${selectedShelf?.name || 'Shelf'}`,
      quantity,
      targetQuantity,
      unitId,
      price: Number(price) || 0,
      expirationDate,
      priorityId,
      status: quantity <= 0 ? 'depleted' : quantity < targetQuantity ? 'low_stock' : 'optimal',
      barcode: `800000${Math.floor(100000 + Math.random() * 900000)}`,
      inShoppingList: quantity < targetQuantity,
      imageUrl: optimizedImage?.dataUrl,
      lastAudited: new Date().toISOString(),
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-add-title"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
    >
      <div
        className={`w-full max-w-lg rounded-2xl border p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto transition-colors ${
          isDark ? 'bg-[#111827] border-slate-700/60 text-[#f8fafc]' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-700/40">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-500/15 text-[#38bdf8] border border-sky-500/30">
              <span className="material-symbols-outlined text-[20px]">add_box</span>
            </span>
            <div>
              <h2 id="quick-add-title" className="text-base font-bold tracking-tight">
                Quick Add Inventory Item
              </h2>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                1-tap presets &amp; customizable master data options
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 1. QUICK FILL FEATURE: Predefined Categories / Templates */}
        <div className="flex flex-col gap-2 p-3 rounded-xl border border-sky-500/30 bg-sky-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span>Quick Fill Templates</span>
            </div>
            {activePreset && (
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Preset Applied
              </span>
            )}
          </div>
          <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Auto-populates common asset fields with typical stock, price, category, and expiration horizons.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {QUICK_FILL_PRESETS.map((preset) => {
              const isSelected = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-sky-500/20 border-sky-400 text-white shadow-sm ring-1 ring-sky-400'
                      : isDark
                      ? 'bg-slate-800/60 border-slate-700 hover:bg-slate-700/60 text-slate-300'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs'
                  }`}
                >
                  <span
                    style={{ color: preset.color }}
                    className="material-symbols-outlined text-[18px] flex-shrink-0"
                  >
                    {preset.icon}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold truncate">{preset.name}</span>
                    <span className="text-[9px] text-slate-400 truncate">
                      {preset.quantity} {preset.unitKeyword} • {preset.daysToExpiry}d
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. INLINE OPTIONS MANAGER OVERLAY (If user clicks Manage on any section) */}
        {managingSection && (
          <div
            className={`p-4 rounded-xl border flex flex-col gap-3 animate-in fade-in zoom-in-95 ${
              isDark ? 'bg-slate-900 border-sky-500/50 shadow-xl' : 'bg-sky-50/90 border-sky-300 shadow-xl'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-2 border-slate-700/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-400 text-[18px]">tune</span>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Manage {managingSection} Options
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setManagingSection(null);
                  setEditingOptionId(null);
                  setConfirmDeleteId(null);
                }}
                className="py-1 px-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1 transition-all"
              >
                <span>Done</span>
                <span className="material-symbols-outlined text-[14px]">check</span>
              </button>
            </div>

            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Edit labels or remove obsolete options. Changes persist directly into your IndexedDB master vault.
            </p>

            {/* Existing Options List with Edit / Remove buttons */}
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
              {(managingSection === 'categories'
                ? localCategories
                : managingSection === 'locations'
                ? localLocations
                : managingSection === 'shelves'
                ? localShelves
                : managingSection === 'units'
                ? localUnits
                : localPriorities
              ).map((opt: any) => {
                const optId = opt.id;
                const optLabel = opt.name || opt.label || optId;
                const isEditing = editingOptionId === optId;
                const isConfirmingDelete = confirmDeleteId === optId;

                if (isEditing) {
                  return (
                    <div
                      key={optId}
                      className="flex items-center gap-2 p-1.5 rounded-lg border border-sky-500/50 bg-slate-800/80"
                    >
                      <input
                        type="text"
                        value={editOptionText}
                        onChange={(e) => setEditOptionText(e.target.value)}
                        className="flex-1 h-8 px-2 rounded border border-slate-600 bg-slate-900 text-xs text-white outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleSaveEditedOption}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingOptionId(null)}
                        className="px-2 py-1 text-slate-400 hover:text-white text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={optId}
                    className={`flex items-center justify-between gap-2 p-2 rounded-lg border text-xs transition-colors ${
                      isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {(managingSection === 'categories' || managingSection === 'locations') && (
                        <button
                          type="button"
                          onClick={() =>
                            setIconPickerTarget({
                              type: managingSection as 'categories' | 'locations',
                              id: optId,
                              currentIcon: opt.icon || (managingSection === 'categories' ? 'category' : 'room'),
                              title: `Change Icon for "${optLabel}"`,
                            })
                          }
                          title="Click to change icon"
                          className="w-6 h-6 rounded bg-sky-500/15 hover:bg-sky-500/30 text-sky-400 border border-sky-500/30 flex items-center justify-center flex-shrink-0 active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {opt.icon || (managingSection === 'categories' ? 'category' : 'room')}
                          </span>
                        </button>
                      )}
                      <span className="font-semibold truncate">{optLabel}</span>
                    </div>

                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[10px] text-rose-400 font-bold">Delete?</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteOption(optId, optLabel)}
                          className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-1.5 py-0.5 text-slate-400 hover:text-white text-[10px]"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(optId, optLabel)}
                          title="Edit name"
                          className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-sky-400 hover:bg-slate-700/50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[15px]">edit</span>
                        </button>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmDeleteId(optId);
                            setEditingOptionId(null);
                          }}
                          title="Remove option"
                          className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add New Option Form */}
            <form onSubmit={handleAddNewOption} className="flex items-center gap-2 pt-1 border-t border-slate-700/40">
              <input
                type="text"
                placeholder={`New ${managingSection?.slice(0, -1)} name...`}
                value={newOptionInput}
                onChange={(e) => setNewOptionInput(e.target.value)}
                className={`flex-1 h-8 px-2.5 rounded-lg border text-xs outline-none ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-sky-400'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500'
                }`}
              />
              <button
                type="submit"
                disabled={!newOptionInput.trim()}
                className="h-8 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 transition-all"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                <span>Add</span>
              </button>
            </form>
          </div>
        )}

        {/* 3. PRIMARY QUICK ADD FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Item Name */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Asset Name *
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Organic Camel Milk, Basmati Rice"
              className={`h-10 px-3 rounded-lg border text-xs outline-none transition-colors ${
                isDark
                  ? 'bg-[#1e293b] border-slate-700 text-white focus:border-sky-400'
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-500'
              }`}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Description / Notes
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 1L Tetra Pak, Cold Pressed Extra Virgin"
              className={`h-10 px-3 rounded-lg border text-xs outline-none transition-colors ${
                isDark
                  ? 'bg-[#1e293b] border-slate-700 text-white focus:border-sky-400'
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-500'
              }`}
            />
          </div>

          {/* Image Capture & In-Browser Optimizer */}
          <div className={`flex flex-col gap-1.5 p-3 rounded-xl border transition-colors ${
            isDark ? 'border-slate-700/50 bg-slate-800/30' : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex items-center justify-between">
              <label className={`text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1 ${
                isDark ? 'text-sky-400' : 'text-sky-700'
              }`}>
                <span className="material-symbols-outlined text-[15px]">photo_camera</span>
                <span>Optimized Item Photo</span>
              </label>
              {optimizedImage && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Compressed {optimizedImage.compressionRatio}% ({Math.round(optimizedImage.compressedSize / 1024)} KB)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {optimizedImage ? (
                <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0">
                  <img
                    src={optimizedImage.thumbnailUrl}
                    alt="Optimized thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setOptimizedImage(null)}
                    aria-label="Remove Photo"
                    className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[12px]">close</span>
                  </button>
                </div>
              ) : (
                <div className={`w-14 h-14 rounded-lg border border-dashed flex items-center justify-center flex-shrink-0 ${
                  isDark ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400 bg-white'
                }`}>
                  <span className="material-symbols-outlined text-[20px]">image</span>
                </div>
              )}

              <div className="flex flex-col gap-1 flex-1">
                <label
                  htmlFor="quick-add-photo-input"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold w-fit cursor-pointer transition-colors active:scale-95 ${
                    isDark
                      ? 'bg-sky-600/30 hover:bg-sky-600/40 text-sky-300 border-sky-500/40'
                      : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-300 shadow-xs'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">upload</span>
                  <span>{isCompressing ? 'Compressing WebP...' : 'Attach / Snap Photo'}</span>
                </label>
                <input
                  id="quick-add-photo-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Auto-downscaled &amp; WebP compressed in-browser to preserve local DB storage.
                </span>
              </div>
            </div>
          </div>

          {/* Category & Unit (Clean Aligned Headers) */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Category */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={`h-10 px-2 rounded-lg border text-xs outline-none ${
                  isDark
                    ? 'bg-[#1e293b] border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                {localCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Measurement Unit */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Measurement Unit
              </label>
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className={`h-10 px-2 rounded-lg border text-xs outline-none ${
                  isDark
                    ? 'bg-[#1e293b] border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                {localUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label} ({u.abbreviation})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location & Shelf Hierarchy (Clean Aligned Headers) */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Location */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Room / Location
              </label>
              <select
                value={locationId}
                onChange={(e) => {
                  setLocationId(e.target.value);
                  const firstShelf = localShelves.find((s) => s.locationId === e.target.value);
                  if (firstShelf) setShelfId(firstShelf.id);
                }}
                className={`h-10 px-2 rounded-lg border text-xs outline-none ${
                  isDark
                    ? 'bg-[#1e293b] border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                {localLocations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Shelf Tier */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Shelf Tier
              </label>
              <select
                value={shelfId}
                onChange={(e) => setShelfId(e.target.value)}
                className={`h-10 px-2 rounded-lg border text-xs outline-none ${
                  isDark
                    ? 'bg-[#1e293b] border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                {availableShelves.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.capacityPercent}%)
                  </option>
                ))}
                {availableShelves.length === 0 && (
                  <option value="shelf_general">General Shelf</option>
                )}
              </select>
            </div>
          </div>

          {/* Stock Counts & Dynamic Price */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Current Stock
              </label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className={`h-10 px-3 rounded-lg border text-xs outline-none tabular-nums ${
                  isDark ? 'bg-[#1e293b] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Target Min
              </label>
              <input
                type="number"
                min="1"
                value={targetQuantity}
                onChange={(e) => setTargetQuantity(Number(e.target.value))}
                className={`h-10 px-3 rounded-lg border text-xs outline-none tabular-nums ${
                  isDark ? 'bg-[#1e293b] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Price ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className={`h-10 px-3 rounded-lg border text-xs outline-none tabular-nums ${
                  isDark ? 'bg-[#1e293b] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>
          </div>

          {/* Expiration Date & Priority */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Expiration Date
              </label>
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className={`h-10 px-2 rounded-lg border text-xs outline-none ${
                  isDark ? 'bg-[#1e293b] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Priority Class
                </label>
                <button
                  type="button"
                  onClick={() => setManagingSection('priorities')}
                  className="text-[10px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-0.5 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[12px]">edit</span>
                  <span>Manage</span>
                </button>
              </div>
              <select
                value={priorityId}
                onChange={(e) => setPriorityId(e.target.value)}
                className={`h-10 px-2 rounded-lg border text-xs outline-none ${
                  isDark ? 'bg-[#1e293b] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              >
                {localPriorities.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-slate-700/40">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white text-xs font-bold active:scale-95 transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              Save to Shelf
            </button>
          </div>
        </form>

        {/* Master Icon Picker Overlay */}
        <IconPickerModal
          isOpen={iconPickerTarget !== null}
          currentIcon={iconPickerTarget?.currentIcon}
          title={iconPickerTarget?.title}
          onSelectIcon={handleUpdateOptionIcon}
          onClose={() => setIconPickerTarget(null)}
          isDark={isDark}
        />
      </div>
    </div>
  );
};
