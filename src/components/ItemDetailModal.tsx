/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InventoryItem, MasterCategory, MasterLocation, MasterShelf, TransactionAuditEntry } from '../types/inventory';
import { PriceDisplay } from './PriceDisplay';
import { compressAndResizeImage } from '../utils/imageOptimizer';
import {
  getItemCriticalThreshold,
  calculateItemDepletionEstimate,
  calculateAverageConsumptionRate,
} from '../utils/inventoryMetrics';
import { triggerHaptic } from '../utils/nativeAlerts';

interface ItemDetailModalProps {
  item: InventoryItem;
  categories: MasterCategory[];
  locations: MasterLocation[];
  shelves: MasterShelf[];
  currency?: string;
  auditLogs?: TransactionAuditEntry[];
  onSave: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onShowToast: (message: string) => void;
  isDark: boolean;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  categories,
  locations,
  shelves,
  currency = 'AED',
  auditLogs = [],
  onSave,
  onDelete,
  onClose,
  onShowToast,
  isDark,
}) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const [targetQuantity, setTargetQuantity] = useState(item.targetQuantity);
  const [criticalThreshold, setCriticalThreshold] = useState<number | undefined>(item.criticalThreshold);
  const [locationId, setLocationId] = useState(item.locationId);
  const [shelfId, setShelfId] = useState(item.shelfId);
  const [imageUrl, setImageUrl] = useState<string | undefined>(item.imageUrl);
  const [isCompressing, setIsCompressing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const availableShelves = shelves.filter((s) => s.locationId === locationId);
  const category = categories.find((c) => c.id === item.categoryId);

  // Default fallback: 2 units or 20% of target stock
  const fallbackThreshold = Math.max(2, Math.ceil((targetQuantity || 1) * 0.2));
  const effectiveThreshold =
    criticalThreshold !== undefined && !isNaN(criticalThreshold)
      ? criticalThreshold
      : fallbackThreshold;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const res = await compressAndResizeImage(file, 800, 800, 0.8);
      setImageUrl(res.dataUrl);
      triggerHaptic('success');
      onShowToast(`Photo optimized (${res.compressionRatio}% reduction, ${Math.round(res.compressedSize / 1024)} KB)`);
    } catch {
      onShowToast('Failed to optimize image');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSave = () => {
    const loc = locations.find((l) => l.id === locationId);
    const shelf = shelves.find((s) => s.id === shelfId);

    const isCriticallyLow = quantity <= effectiveThreshold;
    const isBelowTarget = quantity < targetQuantity;

    const updated: InventoryItem = {
      ...item,
      quantity,
      targetQuantity,
      criticalThreshold: criticalThreshold !== undefined ? Math.max(0, criticalThreshold) : undefined,
      locationId,
      shelfId,
      shelfLocation: `${loc?.name || 'Pantry'} • ${shelf?.name || 'Shelf'}`,
      imageUrl,
      status: quantity <= 0 ? 'depleted' : (isCriticallyLow || isBelowTarget) ? 'low_stock' : 'optimal',
      inShoppingList: quantity < targetQuantity,
      lastAudited: new Date().toISOString(),
    };

    triggerHaptic(isCriticallyLow ? 'warning' : 'success');
    onSave(updated);
    onShowToast(`Updated "${item.name}"`);
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Remove "${item.name}" from inventory?`)) {
      triggerHaptic('warning');
      onDelete(item.id);
      onShowToast(`Removed "${item.name}"`);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="item-inspector-title"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
    >
      <div
        className={`w-full max-w-lg rounded-2xl border p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto transition-colors ${
          isDark ? 'bg-[#111827] border-slate-700/60 text-[#f8fafc]' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-3 border-slate-700/40">
          <div className="flex items-center gap-3 min-w-0">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[24px]">inventory_2</span>
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                {category?.name || 'General Inventory'}
              </span>
              <h2 id="item-inspector-title" className="text-base sm:text-lg font-bold truncate">
                {item.name}
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {item.shelfLocation}
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

        {/* Stock & Expiration Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`p-2.5 rounded-xl border flex flex-col gap-0.5 ${isDark ? 'bg-[#1e293b] border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[10px] text-slate-400 uppercase">Status</span>
            <span
              className={`font-bold ${
                item.status === 'expired'
                  ? 'text-red-400'
                  : item.status === 'low_stock' || quantity <= effectiveThreshold
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {quantity <= effectiveThreshold ? 'CRITICAL LOW' : item.status.toUpperCase().replace('_', ' ')}
            </span>
          </div>

          <div className={`p-2.5 rounded-xl border flex flex-col gap-0.5 ${isDark ? 'bg-[#1e293b] border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[10px] text-slate-400 uppercase">Unit Price</span>
            <span className="font-bold tabular-nums">
              <PriceDisplay amount={item.price} currency={currency} />
            </span>
          </div>

          <div className={`p-2.5 rounded-xl border flex flex-col gap-0.5 ${isDark ? 'bg-[#1e293b] border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[10px] text-slate-400 uppercase">Expiration Date</span>
            <span className="font-bold tabular-nums">{item.expirationDate}</span>
          </div>

          <div className={`p-2.5 rounded-xl border flex flex-col gap-0.5 ${isDark ? 'bg-[#1e293b] border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[10px] text-slate-400 uppercase">Barcode SKU</span>
            <span className="font-mono text-[11px] text-sky-400 truncate">{item.barcode}</span>
          </div>
        </div>

        {/* Quantity Stepper Adjuster */}
        <div className={`p-3 rounded-xl border flex items-center justify-between ${isDark ? 'bg-[#1e293b] border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex flex-col">
            <span className="text-xs font-bold">Physical Stock Count</span>
            <span className="text-[10px] text-slate-400">Target safe floor: {targetQuantity} units</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#111827] border border-slate-700/60 rounded-lg p-1">
            <button
              onClick={() => {
                triggerHaptic('tap');
                setQuantity(Math.max(0, quantity - 1));
              }}
              aria-label="Decrease quantity"
              className="w-8 h-8 rounded flex items-center justify-center hover:bg-slate-800 text-white transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
            <span className="w-8 text-center font-bold text-sm tabular-nums text-white">
              {quantity}
            </span>
            <button
              onClick={() => {
                triggerHaptic('tap');
                setQuantity(quantity + 1);
              }}
              aria-label="Increase quantity"
              className="w-8 h-8 rounded flex items-center justify-center hover:bg-slate-800 text-white transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>
        </div>

        {/* DEDICATED STOCK BOUNDS SECTION */}
        <section
          aria-labelledby="stock-bounds-title"
          className={`p-3.5 rounded-xl border flex flex-col gap-3 ${
            isDark ? 'bg-[#1e293b]/70 border-slate-700/80' : 'bg-slate-50/80 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-amber-400">tune</span>
              <h3 id="stock-bounds-title" className="text-xs font-bold uppercase tracking-wider">
                Stock Bounds &amp; Critical Alert Floor
              </h3>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                criticalThreshold !== undefined
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : isDark
                  ? 'bg-slate-800 text-slate-400 border border-slate-700'
                  : 'bg-slate-200 text-slate-600 border border-slate-300'
              }`}
            >
              {criticalThreshold !== undefined ? 'Custom Threshold' : 'Default (20% Floor)'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Target Quantity Floor */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">
                Target Safe Stock
              </label>
              <input
                type="number"
                min="1"
                value={targetQuantity}
                onChange={(e) => setTargetQuantity(Math.max(1, Number(e.target.value)))}
                className={`h-9 px-3 rounded-lg border outline-none tabular-nums font-mono font-semibold ${
                  isDark ? 'bg-[#111827] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              <span className="text-[10px] text-slate-400">
                Desired full inventory level
              </span>
            </div>

            {/* Granular Critical Threshold Setting */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-rose-400 uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <span>Critical Alert Trigger</span>
                </label>
                {criticalThreshold !== undefined && (
                  <button
                    type="button"
                    onClick={() => {
                      setCriticalThreshold(undefined);
                      triggerHaptic('tap');
                    }}
                    className="text-[10px] text-sky-400 hover:underline"
                  >
                    Reset to Default
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max={targetQuantity}
                  value={effectiveThreshold}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCriticalThreshold(isNaN(val) ? 0 : Math.max(0, val));
                  }}
                  className={`flex-1 h-9 px-3 rounded-lg border outline-none tabular-nums font-mono font-bold ${
                    isDark
                      ? 'bg-[#111827] border-rose-500/50 text-rose-300 focus:border-rose-400'
                      : 'bg-white border-rose-400 text-rose-700 focus:border-rose-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    setCriticalThreshold(Math.max(0, effectiveThreshold - 1));
                  }}
                  aria-label="Decrease critical threshold"
                  className="w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-slate-700/50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">remove</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    setCriticalThreshold(effectiveThreshold + 1);
                  }}
                  aria-label="Increase critical threshold"
                  className="w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-slate-700/50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
              </div>

              <span className="text-[10px] text-slate-400">
                Pulsing amber-rose alert fires at or below{' '}
                <strong className="text-rose-400 font-bold">{effectiveThreshold} units</strong>
              </span>
            </div>
          </div>
        </section>

        {/* CONSUMPTION VELOCITY & DAYS UNTIL EMPTY FORECAST */}
        {(() => {
          const depletion = calculateItemDepletionEstimate(
            {
              ...item,
              quantity,
              targetQuantity,
              criticalThreshold,
            },
            auditLogs
          );

          return (
            <section
              aria-labelledby="depletion-forecast-title"
              className={`p-3.5 rounded-xl border flex flex-col gap-2.5 transition-colors ${
                depletion.urgency === 'critical'
                  ? isDark
                    ? 'bg-rose-950/25 border-rose-500/40 text-rose-100'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                  : depletion.urgency === 'warning'
                  ? isDark
                    ? 'bg-amber-950/25 border-amber-500/40 text-amber-100'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                  : isDark
                  ? 'bg-[#1e293b]/80 border-slate-700/80'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      depletion.urgency === 'critical'
                        ? 'text-rose-400 animate-pulse'
                        : depletion.urgency === 'warning'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    hourglass_bottom
                  </span>
                  <h3 id="depletion-forecast-title" className="text-xs font-bold uppercase tracking-wider">
                    Days Until Empty Forecast
                  </h3>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                    depletion.urgency === 'critical'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                      : depletion.urgency === 'warning'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {depletion.displayEstimate}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div
                  className={`p-2 rounded-lg border flex flex-col ${
                    isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Avg Consumption Rate
                  </span>
                  <span className="font-mono font-bold text-sm text-sky-400">
                    {depletion.dailyRate} <span className="text-[10px] font-normal text-slate-400">units/day</span>
                  </span>
                </div>

                <div
                  className={`p-2 rounded-lg border flex flex-col ${
                    isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Estimated Runout Date
                  </span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      depletion.urgency === 'critical' ? 'text-rose-400' : 'text-slate-200'
                    }`}
                  >
                    {depletion.estimatedEmptyDate || 'Stocked'}
                  </span>
                </div>
              </div>

              {/* Runway progress bar */}
              <div className="flex flex-col gap-1 mt-0.5">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Stock runway</span>
                  <span>{Math.round((quantity / Math.max(1, targetQuantity)) * 100)}% capacity</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      depletion.urgency === 'critical'
                        ? 'bg-rose-500'
                        : depletion.urgency === 'warning'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(5, (quantity / Math.max(1, targetQuantity)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </section>
          );
        })()}

        {/* In-Browser Photo Compression Pipeline */}
        <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${isDark ? 'bg-[#1e293b] border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex flex-col">
            <span className="text-xs font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-sky-400">add_a_photo</span>
              <span>Asset Photo</span>
            </span>
            <span className="text-[10px] text-slate-400">
              Compressed WebP to save local DB space
            </span>
          </div>

          <div>
            <label
              htmlFor="detail-photo-input"
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold cursor-pointer transition-colors shadow-sm inline-block"
            >
              {isCompressing ? 'Compressing...' : imageUrl ? 'Replace Photo' : 'Upload / Snap'}
            </label>
            <input
              id="detail-photo-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Relocate Shelf Selector */}
        <div className="flex flex-col gap-1.5 text-xs">
          <label className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">
            Relocate to Another Shelf
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={locationId}
              onChange={(e) => {
                setLocationId(e.target.value);
                const firstShelf = shelves.find((s) => s.locationId === e.target.value);
                if (firstShelf) setShelfId(firstShelf.id);
              }}
              className={`h-9 px-2 rounded-lg border outline-none ${
                isDark ? 'bg-[#1e293b] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>

            <select
              value={shelfId}
              onChange={(e) => setShelfId(e.target.value)}
              className={`h-9 px-2 rounded-lg border outline-none ${
                isDark ? 'bg-[#1e293b] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              {availableShelves.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions with Reliable In-Modal Confirmation */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700/40">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-400">Delete permanently?</span>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('warning');
                  onDelete(item.id);
                  onShowToast(`Removed "${item.name}"`);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
              >
                Yes, Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/20 active:scale-95 transition-all flex items-center gap-1.5"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              <span>Delete Item</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              type="button"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
