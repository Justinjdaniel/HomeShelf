/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  MasterCategory,
  MasterLocation,
  MasterShelf,
  MasterUnit,
  MasterPriority,
} from '../types/inventory';
import { dbService } from '../services/db';
import { SUPPORTED_CURRENCIES } from '../utils/currency';
import { DirhamSign } from './DirhamSign';
import { getStorageQuotaEstimate } from '../utils/imageOptimizer';
import { IconPickerModal } from './common/IconPickerModal';

interface SettingsModalProps {
  categories: MasterCategory[];
  locations: MasterLocation[];
  shelves: MasterShelf[];
  units: MasterUnit[];
  priorities: MasterPriority[];
  currency: string;
  onSelectCurrency: (code: string) => void;
  onRefreshMasterData: () => void;
  onClose: () => void;
  onShowToast: (message: string) => void;
  isDark: boolean;
}

type SettingsTab = 'currency' | 'master' | 'vault' | 'about';
type MasterType = 'categories' | 'locations' | 'shelves' | 'units' | 'priorities';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  categories,
  locations,
  shelves,
  units,
  priorities,
  currency,
  onSelectCurrency,
  onRefreshMasterData,
  onClose,
  onShowToast,
  isDark,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('currency');
  const [activeMasterType, setActiveMasterType] = useState<MasterType>('categories');

  // Icon Picker state
  const [iconPickerTarget, setIconPickerTarget] = useState<{
    type: 'categories' | 'locations';
    id: string;
    currentIcon: string;
    title: string;
  } | null>(null);

  // Manual export/import state (Data Sovereignty)
  const [pendingImport, setPendingImport] = useState<{
    rawContent: string;
    itemsCount: number;
    categoriesCount: number;
    locationsCount: number;
    exportedAt: string;
  } | null>(null);
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Clean Mode (Fresh Start) state
  const [showCleanModal, setShowCleanModal] = useState(false);
  const [cleanWipeMaster, setCleanWipeMaster] = useState(false);
  const [isCleaningStorage, setIsCleaningStorage] = useState(false);

  // Input states for adding new master entry
  const [newEntryName, setNewEntryName] = useState('');
  const [newEntryExtra, setNewEntryExtra] = useState('');

  // Storage telemetry
  const [storageStats, setStorageStats] = useState<{
    usageMb: number;
    quotaMb: number;
    percentUsed: number;
  }>({ usageMb: 1.2, quotaMb: 500, percentUsed: 0.2 });

  useEffect(() => {
    getStorageQuotaEstimate().then(setStorageStats);
  }, []);

  const handleAddMasterEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntryName.trim()) return;

    const trimmed = newEntryName.trim();

    if (activeMasterType === 'categories') {
      const newCat: MasterCategory = {
        id: `cat_custom_${Date.now()}`,
        name: trimmed,
        icon: 'category',
        color: '#38bdf8',
        isCustom: true,
      };
      await dbService.saveCategory(newCat);
      onShowToast(`Added category "${trimmed}" to master data`);
    } else if (activeMasterType === 'locations') {
      const newLoc: MasterLocation = {
        id: `loc_custom_${Date.now()}`,
        name: trimmed,
        icon: 'meeting_room',
        itemCount: 0,
        isCustom: true,
      };
      await dbService.saveLocation(newLoc);
      onShowToast(`Added storage location "${trimmed}"`);
    } else if (activeMasterType === 'shelves') {
      const newShelf: MasterShelf = {
        id: `shelf_custom_${Date.now()}`,
        locationId: locations[0]?.id || 'loc_kitchen',
        name: trimmed,
        capacityPercent: 10,
        healthStatus: 'optimal',
        totalItems: 0,
        isCustom: true,
      };
      await dbService.saveShelf(newShelf);
      onShowToast(`Added shelf "${trimmed}"`);
    } else if (activeMasterType === 'units') {
      const newUnit: MasterUnit = {
        id: `unit_custom_${Date.now()}`,
        label: trimmed,
        abbreviation: newEntryExtra.trim() || trimmed.slice(0, 3).toLowerCase(),
        isCustom: true,
      };
      await dbService.saveUnit(newUnit);
      onShowToast(`Added unit "${trimmed}"`);
    } else if (activeMasterType === 'priorities') {
      const newPrio: MasterPriority = {
        id: `prio_custom_${Date.now()}`,
        label: trimmed,
        level: 5,
        badgeColor: '#38bdf8',
        isCustom: true,
      };
      await dbService.savePriority(newPrio);
      onShowToast(`Added priority "${trimmed}"`);
    }

    setNewEntryName('');
    setNewEntryExtra('');
    onRefreshMasterData();
  };

  const handleDeleteMasterEntry = async (type: MasterType, id: string, name: string) => {
    if (type === 'categories') await dbService.deleteCategory(id);
    else if (type === 'locations') await dbService.deleteLocation(id);
    else if (type === 'shelves') await dbService.deleteShelf(id);
    else if (type === 'units') await dbService.deleteUnit(id);
    else if (type === 'priorities') await dbService.deletePriority(id);

    onShowToast(`Removed "${name}" from master data`);
    onRefreshMasterData();
  };

  const handleUpdateIcon = async (newIcon: string) => {
    if (!iconPickerTarget) return;
    const { type, id } = iconPickerTarget;

    try {
      if (type === 'categories') {
        const cat = categories.find((c) => c.id === id);
        if (cat) {
          await dbService.saveCategory({ ...cat, icon: newIcon });
          onShowToast(`Updated icon for "${cat.name}"`);
        }
      } else if (type === 'locations') {
        const loc = locations.find((l) => l.id === id);
        if (loc) {
          await dbService.saveLocation({ ...loc, icon: newIcon });
          onShowToast(`Updated icon for "${loc.name}"`);
        }
      }
      onRefreshMasterData();
    } catch {
      onShowToast('Failed to update icon');
    } finally {
      setIconPickerTarget(null);
    }
  };

  const handleExportBackup = async () => {
    try {
      const json = await dbService.exportDatabase();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `homeshelf-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      onShowToast('Database vault JSON downloaded successfully');
    } catch {
      onShowToast('Error generating vault backup file');
    }
  };

  const handleCopyBackupToClipboard = async () => {
    try {
      const json = await dbService.exportDatabase();
      await navigator.clipboard.writeText(json);
      onShowToast('Vault JSON backup copied to clipboard');
    } catch {
      onShowToast('Clipboard copy failed');
    }
  };

  const parseAndPreviewImport = (rawContent: string) => {
    try {
      const parsed = JSON.parse(rawContent);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('File is not a valid JSON structure');
      }

      const itemsList = parsed.data?.items || parsed.items;
      if (!Array.isArray(itemsList)) {
        throw new Error('Missing items array in JSON file');
      }

      const categoriesList = parsed.data?.categories || parsed.categories || [];
      const locationsList = parsed.data?.locations || parsed.locations || [];

      setPendingImport({
        rawContent,
        itemsCount: itemsList.length,
        categoriesCount: categoriesList.length,
        locationsCount: locationsList.length,
        exportedAt: parsed.exportedAt || new Date().toISOString(),
      });
      onShowToast(`Loaded backup file with ${itemsList.length} items`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid backup JSON file';
      onShowToast(`Import inspection failed: ${msg}`);
    }
  };

  const handleImportFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const rawContent = ev.target?.result as string;
      parseAndPreviewImport(rawContent);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExecuteImport = async (mode: 'replace' | 'merge') => {
    if (!pendingImport) return;
    setIsProcessingImport(true);
    try {
      const res = await dbService.importDatabase(pendingImport.rawContent, mode);
      if (res.success) {
        onRefreshMasterData();
        onShowToast(res.message);
        setPendingImport(null);
      } else {
        onShowToast(`Import failed: ${res.message}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to import database';
      onShowToast(`Import error: ${msg}`);
    } finally {
      setIsProcessingImport(false);
    }
  };

  const handleResetDefaults = async () => {
    await dbService.resetToDemoDefaults();
    onRefreshMasterData();
    setConfirmReset(false);
    onShowToast('Database reset to factory 142 items');
  };

  const handleExecuteClean = async () => {
    setIsCleaningStorage(true);
    try {
      await dbService.cleanStorage(cleanWipeMaster);
      onRefreshMasterData();
      setShowCleanModal(false);
      onShowToast(
        cleanWipeMaster
          ? 'Storage wiped completely (fresh clean slate)'
          : 'All inventory items cleared. Categories ready for new entries.'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Clean storage failed';
      onShowToast(`Error: ${msg}`);
    } finally {
      setIsCleaningStorage(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
    >
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#111827] border-slate-700/60 text-[#f8fafc]'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-slate-700/40 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-500/15 text-[#38bdf8] border border-sky-500/30">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </span>
            <div>
              <h2 id="settings-modal-title" className="text-base font-bold tracking-tight">
                Vault Settings &amp; Configuration
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Currency preferences, master parameters &amp; database backup
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Settings Modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 pt-3 pb-2 border-b border-slate-700/40 overflow-x-auto no-scrollbar flex-shrink-0">
          <button
            onClick={() => setActiveTab('currency')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
              activeTab === 'currency'
                ? 'bg-sky-500 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">payments</span>
            <span>Currency ({currency})</span>
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
              activeTab === 'vault'
                ? 'bg-sky-500 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">folder_zip</span>
            <span>Data Vault Backup</span>
          </button>
          <button
            onClick={() => setActiveTab('master')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
              activeTab === 'master'
                ? 'bg-sky-500 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">database</span>
            <span>Master Data</span>
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
              activeTab === 'about'
                ? 'bg-sky-500 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>Architecture</span>
          </button>
        </div>

        {/* Tab 1: Dynamic Currency Engine */}
        {activeTab === 'currency' && (
          <div className="flex flex-col gap-4 p-4 sm:p-6 overflow-y-auto max-h-[65vh]">
            <div
              className={`p-4 rounded-xl border flex flex-col gap-2 ${
                isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-sky-400">Primary Display Currency</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Real-time Recalculation
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose the currency unit used across the executive dashboard, waste valuations, item unit prices, and shopping list calculations.
              </p>
            </div>

            {/* Currency Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SUPPORTED_CURRENCIES.map((c) => {
                const isSelected = currency === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      onSelectCurrency(c.code);
                      onShowToast(`Display currency switched to ${c.label}`);
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 active:scale-98 ${
                      isSelected
                        ? isDark
                          ? 'bg-gradient-to-r from-sky-500/20 to-teal-500/20 border-sky-400 text-white shadow-md'
                          : 'bg-sky-50 border-sky-500 text-sky-950 shadow-md'
                        : isDark
                        ? 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/60 text-slate-300'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                          isSelected
                            ? 'bg-sky-500 text-white shadow-sm'
                            : isDark
                            ? 'bg-slate-700 text-slate-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.code === 'AED' ? (
                          <DirhamSign className="w-5 h-5" />
                        ) : (
                          <span>{c.symbol.trim()}</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs">{c.label}</span>
                        <span className="text-[11px] text-slate-400">{c.nativeName}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="material-symbols-outlined text-[20px] text-sky-400 font-bold">
                        check_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Official Emirati Dirham Sign Callout */}
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                isDark ? 'bg-sky-950/20 border-sky-800/40 text-slate-300' : 'bg-sky-50 border-sky-200 text-slate-800'
              }`}
            >
              <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 flex-shrink-0">
                <DirhamSign className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <span className="font-bold text-sky-300">Official UAE Dirham Sign Standard</span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Unveiled by the Central Bank of the UAE on March 27, 2025 (U+20C3). Styled with two horizontal lines inspired by the UAE national flag symbolizing economic stability.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Overhauled Data Vault Backup & Export Panel */}
        {activeTab === 'vault' && (
          <div className="flex flex-col gap-4 p-4 sm:p-6 overflow-y-auto max-h-[65vh]">
            {/* Live Telemetry Card */}
            <div
              className={`p-4 rounded-xl border flex flex-col gap-3 ${
                isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  IndexedDB Local Storage Telemetry
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active &amp; Healthy
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px]">Database Name</span>
                  <span className="font-mono font-bold">HomeShelfDB</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px]">Storage Used</span>
                  <span className="font-mono font-bold">{storageStats.usageMb} MB</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px]">Storage Quota</span>
                  <span className="font-mono font-bold">{storageStats.quotaMb} MB</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px]">Total Master Records</span>
                  <span className="font-mono font-bold">
                    {categories.length + locations.length + shelves.length + units.length + priorities.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Export Vault Section */}
            <div
              className={`p-4 rounded-xl border flex flex-col gap-3 ${
                isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-400 text-[20px]">cloud_download</span>
                <span className="text-sm font-bold">Export Vault Data</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Creates a validated JSON snapshot containing all 142+ inventory items, category trees, location racks, units, and custom audit journals.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 active:scale-95 transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Download Backup JSON</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyBackupToClipboard}
                  className="py-2.5 px-4 rounded-xl border border-slate-600 hover:bg-slate-700/40 text-slate-300 font-semibold text-xs flex items-center gap-2 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  <span>Copy JSON to Clipboard</span>
                </button>
              </div>
            </div>

            {/* Restore Vault Section with Drag-and-Drop and Ingestion Strategy */}
            <div
              className={`p-4 rounded-xl border flex flex-col gap-3 ${
                isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-[20px]">file_upload</span>
                  <span className="text-sm font-bold">Import &amp; Restore Vault</span>
                </div>
                <span className="text-[10px] font-bold text-sky-400 bg-sky-500/15 px-2 py-0.5 rounded border border-sky-500/30">
                  Data Sovereignty
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Import an existing database snapshot (.json). You can choose to either cleanly replace all records or merge new items into your existing catalog.
              </p>

              {/* Drag & Drop Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      parseAndPreviewImport(ev.target?.result as string);
                    };
                    reader.readAsText(file);
                  }
                }}
                className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-center transition-all ${
                  isDragOver
                    ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
                    : isDark
                    ? 'border-slate-700 hover:border-slate-600 bg-slate-900/40'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">upload_file</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold">Drop your JSON backup file here</span>
                  <span className="text-[11px] text-slate-400">or browse from local device storage</span>
                </div>
                <label
                  htmlFor="vault-upload-input"
                  className="mt-1 py-1.5 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-sm active:scale-95 transition-all inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">folder_open</span>
                  <span>Browse JSON File</span>
                </label>
                <input
                  id="vault-upload-input"
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportFileInput}
                  className="hidden"
                />
              </div>

              {/* Pending Import Ingestion Strategy Dialog Sheet */}
              {pendingImport && (
                <div
                  className={`p-4 rounded-xl border flex flex-col gap-3 animate-in fade-in zoom-in-95 ${
                    isDark
                      ? 'bg-[#0f172a] border-sky-500/40 shadow-xl'
                      : 'bg-sky-50 border-sky-300 shadow-xl'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sky-400 text-[20px]">inventory_2</span>
                      <div>
                        <span className="text-xs font-bold text-sky-400 block">Backup Snapshot Ready</span>
                        <span className="text-[11px] text-slate-400">
                          {pendingImport.itemsCount} Items • {pendingImport.categoriesCount} Categories • {pendingImport.locationsCount} Rooms
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPendingImport(null)}
                      className="text-slate-400 hover:text-white"
                      aria-label="Cancel Import"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>

                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    How would you like to apply this backup to your local inventory database?
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {/* Option A: Merge Non-Duplicates */}
                    <button
                      type="button"
                      disabled={isProcessingImport}
                      onClick={() => handleExecuteImport('merge')}
                      className="p-3 rounded-xl border flex flex-col text-left transition-all active:scale-95 bg-emerald-600/15 border-emerald-500/40 hover:bg-emerald-600/25 text-emerald-200"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-300">
                        <span className="material-symbols-outlined text-[16px]">call_merge</span>
                        <span>Merge Non-Duplicates</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1">
                        Preserves current items; appends missing catalog records.
                      </span>
                    </button>

                    {/* Option B: Clean Replace */}
                    <button
                      type="button"
                      disabled={isProcessingImport}
                      onClick={() => handleExecuteImport('replace')}
                      className="p-3 rounded-xl border flex flex-col text-left transition-all active:scale-95 bg-rose-600/15 border-rose-500/40 hover:bg-rose-600/25 text-rose-200"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-rose-300">
                        <span className="material-symbols-outlined text-[16px]">sync</span>
                        <span>Replace Entire Database</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1">
                        Wipes current database and loads fresh backup snapshot.
                      </span>
                    </button>
                  </div>

                  {isProcessingImport && (
                    <div className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-sky-400">
                      <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                      <span>Processing IndexedDB transactions...</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Clean Mode (Fresh Start) Card */}
            <div
              className={`p-4 rounded-xl border flex flex-col gap-2 ${
                isDark ? 'bg-amber-950/20 border-amber-900/40 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[20px]">cleaning_services</span>
                <span className="text-xs font-bold text-amber-500 uppercase">Clean Mode • Fresh Start</span>
              </div>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-amber-950/80 font-medium'}`}>
                Clear existing items and start with a clean ledger for your own household inventory.
              </p>
              <button
                type="button"
                onClick={() => setShowCleanModal(true)}
                className="py-2 px-3.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 w-fit active:scale-95 transition-all mt-1"
              >
                <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                <span>Clean Storage Data</span>
              </button>
            </div>

            {/* Clean Mode Confirmation Modal */}
            {showCleanModal && (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="clean-modal-title"
                className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
              >
                <div
                  className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl flex flex-col gap-4 ${
                    isDark ? 'bg-[#0f172a] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700/40">
                    <div className="flex items-center gap-2 text-amber-500">
                      <span className="material-symbols-outlined text-[22px]">cleaning_services</span>
                      <h3 id="clean-modal-title" className="text-sm font-bold">
                        Clean Storage • Choose Scope
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCleanModal(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>

                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Select how you would like to wipe your inventory database:
                  </p>

                  <div className="flex flex-col gap-2.5">
                    {/* Option 1: Items Only */}
                    <label
                      onClick={() => setCleanWipeMaster(false)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                        !cleanWipeMaster
                          ? 'border-sky-500 bg-sky-500/10 ring-1 ring-sky-500/30'
                          : isDark
                          ? 'border-slate-800 bg-slate-900/50 hover:bg-slate-800'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cleanScope"
                        checked={!cleanWipeMaster}
                        onChange={() => setCleanWipeMaster(false)}
                        className="mt-0.5 accent-sky-500"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-sky-400">
                          Wipe Items Only (Recommended)
                        </span>
                        <span className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Empties all inventory assets and audit logs to 0. Preserves standard categories, locations, and units so you can add real groceries immediately.
                        </span>
                      </div>
                    </label>

                    {/* Option 2: Total Wipe */}
                    <label
                      onClick={() => setCleanWipeMaster(true)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                        cleanWipeMaster
                          ? 'border-rose-500 bg-rose-500/10 ring-1 ring-rose-500/30'
                          : isDark
                          ? 'border-slate-800 bg-slate-900/50 hover:bg-slate-800'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cleanScope"
                        checked={cleanWipeMaster}
                        onChange={() => setCleanWipeMaster(true)}
                        className="mt-0.5 accent-rose-500"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-rose-400">
                          Total Clean Slate (Wipe All Stores)
                        </span>
                        <span className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Completely wipes all 7 stores (items, custom categories, rooms, shelves) to zero records.
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700/40">
                    <button
                      type="button"
                      onClick={() => setShowCleanModal(false)}
                      disabled={isCleaningStorage}
                      className="px-3 py-1.5 rounded-lg border border-slate-600 text-xs font-semibold hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteClean}
                      disabled={isCleaningStorage}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-md"
                    >
                      {isCleaningStorage ? (
                        <>
                          <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                          <span>Cleaning Storage...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px]">check</span>
                          <span>Execute Clean</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Emergency Reset Section with Inline Confirmation */}
            <div
              className={`p-4 rounded-xl border flex flex-col gap-2 ${
                isDark ? 'bg-red-950/20 border-red-900/40 text-red-200' : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400 text-[20px]">warning</span>
                <span className="text-xs font-bold text-red-400 uppercase">Emergency Factory Reset</span>
              </div>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-red-950/80 font-medium'}`}>
                Re-seeds the entire database with the clean default 142 items and fresh pantry shelves.
              </p>

              {confirmReset ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-red-400">Permanently reset database?</span>
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs active:scale-95 transition-all shadow-md"
                  >
                    Yes, Reset Factory Data
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="py-1.5 px-2.5 rounded-lg text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="py-2 px-3.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 w-fit active:scale-95 transition-all mt-1"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  <span>Reset to Factory 142 Items</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Master Data Tables Management */}
        {activeTab === 'master' && (
          <div className="flex flex-col gap-4 p-4 sm:p-6 overflow-y-auto max-h-[65vh]">
            {/* Sub-selector for master table type */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {(
                [
                  { id: 'categories', label: 'Categories' },
                  { id: 'locations', label: 'Rooms / Locations' },
                  { id: 'shelves', label: 'Shelves' },
                  { id: 'units', label: 'Units' },
                  { id: 'priorities', label: 'Priorities' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMasterType(m.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    activeMasterType === m.id
                      ? 'bg-[#38bdf8] text-[#00354a]'
                      : isDark
                      ? 'bg-[#1a243b] text-slate-300'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Form to add a new option */}
            <form onSubmit={handleAddMasterEntry} className="flex gap-2 items-center">
              <input
                type="text"
                value={newEntryName}
                onChange={(e) => setNewEntryName(e.target.value)}
                placeholder={`Add new ${activeMasterType.slice(0, -1)} option...`}
                className={`flex-1 h-9 px-3 rounded-lg border text-xs outline-none ${
                  isDark
                    ? 'bg-[#1a243b] border-[#243049] text-white focus:border-sky-400'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-500'
                }`}
              />
              {activeMasterType === 'units' && (
                <input
                  type="text"
                  value={newEntryExtra}
                  onChange={(e) => setNewEntryExtra(e.target.value)}
                  placeholder="Abbr (e.g. kg)"
                  className={`w-24 h-9 px-2 rounded-lg border text-xs outline-none ${
                    isDark
                      ? 'bg-[#1a243b] border-[#243049] text-white focus:border-sky-400'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-500'
                  }`}
                />
              )}
              <button
                type="submit"
                className="h-9 px-3.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1 active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add</span>
              </button>
            </form>

            {/* List of existing master data options */}
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
              {activeMasterType === 'categories' &&
                categories.map((c) => (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                      isDark ? 'bg-[#1a243b] border-[#243049]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={() =>
                          setIconPickerTarget({
                            type: 'categories',
                            id: c.id,
                            currentIcon: c.icon,
                            title: `Change Icon for "${c.name}"`,
                          })
                        }
                        title="Click to change category icon"
                        className="w-7 h-7 rounded-md bg-sky-500/15 hover:bg-sky-500/30 border border-sky-500/30 flex items-center justify-center text-sky-400 active:scale-95 transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">{c.icon || 'category'}</span>
                      </button>
                      <span className="font-semibold truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setIconPickerTarget({
                            type: 'categories',
                            id: c.id,
                            currentIcon: c.icon,
                            title: `Change Icon for "${c.name}"`,
                          })
                        }
                        className="text-sky-400 hover:text-sky-300 text-[11px] font-semibold"
                      >
                        Change Icon
                      </button>
                      {c.isCustom && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMasterEntry('categories', c.id, c.name)}
                          className="text-red-400 hover:text-red-300 text-[11px]"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}

              {activeMasterType === 'locations' &&
                locations.map((l) => (
                  <div
                    key={l.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                      isDark ? 'bg-[#1a243b] border-[#243049]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={() =>
                          setIconPickerTarget({
                            type: 'locations',
                            id: l.id,
                            currentIcon: l.icon || 'room',
                            title: `Change Icon for "${l.name}"`,
                          })
                        }
                        title="Click to change location icon"
                        className="w-7 h-7 rounded-md bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400 active:scale-95 transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">{l.icon || 'room'}</span>
                      </button>
                      <span className="font-semibold truncate">{l.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setIconPickerTarget({
                            type: 'locations',
                            id: l.id,
                            currentIcon: l.icon || 'room',
                            title: `Change Icon for "${l.name}"`,
                          })
                        }
                        className="text-sky-400 hover:text-sky-300 text-[11px] font-semibold"
                      >
                        Change Icon
                      </button>
                      {l.isCustom && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMasterEntry('locations', l.id, l.name)}
                          className="text-red-400 hover:text-red-300 text-[11px]"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}

              {activeMasterType === 'shelves' &&
                shelves.map((s) => (
                  <div
                    key={s.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                      isDark ? 'bg-[#1a243b] border-[#243049]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="font-semibold">{s.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-sky-400">{s.capacityPercent}% Full</span>
                      {s.isCustom && (
                        <button
                          onClick={() => handleDeleteMasterEntry('shelves', s.id, s.name)}
                          className="text-red-400 hover:text-red-300 text-[11px]"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}

              {activeMasterType === 'units' &&
                units.map((u) => (
                  <div
                    key={u.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                      isDark ? 'bg-[#1a243b] border-[#243049]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="font-semibold">
                      {u.label} ({u.abbreviation})
                    </span>
                    {u.isCustom && (
                      <button
                        onClick={() => handleDeleteMasterEntry('units', u.id, u.label)}
                        className="text-red-400 hover:text-red-300 text-[11px]"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}

              {activeMasterType === 'priorities' &&
                priorities.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                      isDark ? 'bg-[#1a243b] border-[#243049]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="font-semibold">{p.label}</span>
                    {p.isCustom && (
                      <button
                        onClick={() => handleDeleteMasterEntry('priorities', p.id, p.label)}
                        className="text-red-400 hover:text-red-300 text-[11px]"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 4: System Architecture */}
        {activeTab === 'about' && (
          <div className="flex flex-col gap-3 p-4 sm:p-6 overflow-y-auto max-h-[65vh] text-xs">
            <div
              className={`p-4 rounded-xl border flex flex-col gap-2 ${
                isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex justify-between py-1 border-b border-slate-700/30">
                <span className="text-slate-400">Architecture:</span>
                <span className="font-semibold">Dual (PWA Web + Native Android Kotlin)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/30">
                <span className="text-slate-400">Database Engine:</span>
                <span className="font-semibold text-emerald-400">IndexedDB / Room SQLite</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/30">
                <span className="text-slate-400">Currency Engine:</span>
                <span className="font-semibold text-sky-400">Official CBUAE AED Standard (U+20C3)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/30">
                <span className="text-slate-400">Image Pipeline:</span>
                <span className="font-semibold text-teal-300">HTML5 Canvas WebP Compressor</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Offline Caching:</span>
                <span className="font-semibold">Cache-First Service Worker</span>
              </div>
            </div>
          </div>
        )}

        {/* Icon Picker Overlay */}
        <IconPickerModal
          isOpen={iconPickerTarget !== null}
          currentIcon={iconPickerTarget?.currentIcon}
          title={iconPickerTarget?.title}
          onSelectIcon={handleUpdateIcon}
          onClose={() => setIconPickerTarget(null)}
          isDark={isDark}
        />
      </div>
    </div>
  );
};

