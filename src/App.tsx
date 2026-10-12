/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  InventoryItem,
  MasterCategory,
  MasterLocation,
  MasterShelf,
  MasterUnit,
  MasterPriority,
  TransactionAuditEntry,
} from './types/inventory';
import { dbService } from './services/db';
import { Header } from './components/Header';
import { BottomNavDock } from './components/BottomNavDock';
import { NavTab } from './components/BottomNav';
import { DiagnosticsScreen } from './components/DiagnosticsScreen';
import { DashboardView } from './components/DashboardView';
import { ShelvesView } from './components/ShelvesView';
import { ShoppingView } from './components/ShoppingView';
import { ScannerView } from './components/ScannerView';
import { QuickAddModal } from './components/QuickAddModal';
import { SettingsModal } from './components/SettingsModal';
import { ItemDetailModal } from './components/ItemDetailModal';
import { SearchModal } from './components/SearchModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NativeSystemHUD } from './components/NativeSystemHUD';
import {
  triggerHaptic,
  triggerNativeAlert,
  requestNotificationPermission,
} from './utils/nativeAlerts';
import { getItemCriticalThreshold } from './utils/inventoryMetrics';

export default function App() {
  // Theme state: defaults to dark (Nocturne Cellar), auto-detects system
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('homeshelf_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : true;
  });

  // Currency preference: defaults to UAE Dirham (AED), user selectable
  const [currency, setCurrencyState] = useState<string>(() => {
    return localStorage.getItem('homeshelf_currency') || 'AED';
  });

  const handleSelectCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('homeshelf_currency', newCurrency);
    triggerHaptic('success');
  };

  // Diagnostics warmup screen
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);

  // Active Navigation Tab with View Transitions API
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  const handleTabChange = useCallback((newTab: NavTab) => {
    if (newTab === currentTab) return;
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
        setCurrentTab(newTab);
      });
    } else {
      setCurrentTab(newTab);
    }
  }, [currentTab]);

  // Modals state
  const [showQuickAdd, setShowQuickAdd] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Database reactive collections
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [locations, setLocations] = useState<MasterLocation[]>([]);
  const [shelves, setShelves] = useState<MasterShelf[]>([]);
  const [units, setUnits] = useState<MasterUnit[]>([]);
  const [priorities, setPriorities] = useState<MasterPriority[]>([]);
  const [auditLogs, setAuditLogs] = useState<TransactionAuditEntry[]>([]);

  // Auto Executive Cache Sync state
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'idle'>('synced');
  const [lastSyncedTime, setLastSyncedTime] = useState<Date>(new Date());
  const [lastSyncedText, setLastSyncedText] = useState<string>('Synced just now');
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 2800);
  };

  // Pull-to-refresh gesture state on root container
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const touchStartYRef = useRef<number>(0);
  const isPullingRef = useRef<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY <= 0 && !isRefreshing) {
      touchStartYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPullingRef.current || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartYRef.current;
    if (diff > 0 && window.scrollY <= 0) {
      const distance = Math.min(90, Math.pow(diff, 0.85));
      setPullDistance(distance);
      if (distance >= 60 && pullDistance < 60) {
        triggerHaptic('tap');
      }
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPullingRef.current) return;
    isPullingRef.current = false;
    if (pullDistance >= 60 && !isRefreshing) {
      setIsRefreshing(true);
      triggerHaptic('success');
      showToast('Syncing inventory with database...');
      try {
        await refreshData();
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 350);
      }
    } else {
      setPullDistance(0);
    }
  };

  // Sync theme with document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('homeshelf_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('homeshelf_theme', 'light');
    }
  }, [isDark]);

  // Request notification permissions gracefully on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        // Non-intrusively request permission so native alerts feel system-integrated
        requestNotificationPermission().catch(() => {});
      }
    }
  }, []);

  // Load database state
  const refreshData = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      const [
        loadedItems,
        loadedCats,
        loadedLocs,
        loadedShelves,
        loadedUnits,
        loadedPrios,
        loadedLogs,
      ] = await Promise.all([
        dbService.getItems(),
        dbService.getCategories(),
        dbService.getLocations(),
        dbService.getShelves(),
        dbService.getUnits(),
        dbService.getPriorities(),
        dbService.getAuditLog(),
      ]);

      setItems(loadedItems);
      setCategories(loadedCats);
      setLocations(loadedLocs);
      setShelves(loadedShelves);
      setUnits(loadedUnits);
      setPriorities(loadedPrios);
      setAuditLogs(loadedLogs);
      setLastSyncedTime(new Date());
      setLastSyncedText('Synced just now');
    } catch (err) {
      console.error('Failed to load local data:', err);
    } finally {
      setSyncStatus('synced');
    }
  }, []);

  // Auto executive cache sync relative time updater
  useEffect(() => {
    const timer = setInterval(() => {
      const diffSec = Math.floor((Date.now() - lastSyncedTime.getTime()) / 1000);
      if (diffSec < 30) {
        setLastSyncedText('Synced just now');
      } else if (diffSec < 120) {
        setLastSyncedText('Synced 1m ago');
      } else {
        const mins = Math.floor(diffSec / 60);
        setLastSyncedText(`Synced ${mins}m ago`);
      }
    }, 15000);

    return () => clearInterval(timer);
  }, [lastSyncedTime]);

  // Initial load and window visibility sync listener
  useEffect(() => {
    refreshData();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Register service worker if supported
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [refreshData]);

  // Handlers for inventory items
  const handleConsumeItem = async (item: InventoryItem) => {
    const newQty = Math.max(0, item.quantity - 1);
    const threshold = getItemCriticalThreshold(item);
    const isCritical = newQty <= threshold;

    const updated: InventoryItem = {
      ...item,
      quantity: newQty,
      status: newQty <= 0 ? 'depleted' : isCritical ? 'low_stock' : item.status,
      lastAudited: new Date().toISOString(),
    };

    await dbService.saveItem(updated);
    await dbService.recordAudit({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'CONSUME',
      itemName: item.name,
      itemId: item.id,
      quantityChange: -1,
      note: 'Item logged as consumed via Quick Feed',
    });

    if (isCritical) {
      triggerNativeAlert({
        title: `Low Stock: ${item.name}`,
        body: `Physical stock dropped to ${newQty} units (Critical floor: ${threshold}). Restock queued.`,
        type: 'warning',
        icon: 'warning',
      });
    } else {
      triggerHaptic('consume');
    }

    refreshData();
  };

  const handleAddToCart = async (item: InventoryItem) => {
    triggerHaptic('restock');
    const updated: InventoryItem = {
      ...item,
      inShoppingList: true,
      shoppingQuantity: (item.shoppingQuantity || 0) + 1,
    };
    await dbService.saveItem(updated);
    refreshData();
  };

  const handleBulkAddCritical = async () => {
    triggerHaptic('restock');
    const criticalItems = items.filter(
      (i) =>
        i.status === 'expired' ||
        i.status === 'expiring_soon' ||
        i.status === 'low_stock' ||
        i.quantity <= getItemCriticalThreshold(i)
    );
    for (const item of criticalItems) {
      await dbService.saveItem({
        ...item,
        inShoppingList: true,
        shoppingQuantity: Math.max(1, item.targetQuantity - item.quantity),
      });
    }
    refreshData();
  };

  const handleCommitRestock = async (itemIds: string[]) => {
    triggerHaptic('success');
    for (const id of itemIds) {
      const item = items.find((i) => i.id === id);
      if (item) {
        const added = item.shoppingQuantity || item.targetQuantity || 1;
        await dbService.saveItem({
          ...item,
          quantity: item.quantity + added,
          status: 'optimal',
          inShoppingList: false,
          shoppingQuantity: 0,
          lastAudited: new Date().toISOString(),
        });
        await dbService.recordAudit({
          id: `audit_${Date.now()}_${id}`,
          timestamp: new Date().toISOString(),
          action: 'RESTOCK',
          itemName: item.name,
          itemId: item.id,
          quantityChange: added,
          note: 'Restocked to shelf from shopping queue',
        });
      }
    }
    triggerNativeAlert({
      title: 'Restock Complete',
      body: `Successfully restocked ${itemIds.length} items back to optimal safety floors.`,
      type: 'success',
      icon: 'check_circle',
    });
    refreshData();
  };

  const handleUpdateShoppingQuantity = async (id: string, delta: number) => {
    triggerHaptic('tap');
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const currentQty = item.shoppingQuantity || item.targetQuantity || 1;
    const newQty = Math.max(1, currentQty + delta);

    await dbService.saveItem({
      ...item,
      shoppingQuantity: newQty,
    });
    refreshData();
  };

  const handleScanIntake = async (item: InventoryItem, action: 'intake' | 'consume') => {
    const delta = action === 'intake' ? 1 : -1;
    const newQty = Math.max(0, item.quantity + delta);
    const threshold = getItemCriticalThreshold(item);

    await dbService.saveItem({
      ...item,
      quantity: newQty,
      status: newQty <= 0 ? 'depleted' : newQty <= threshold ? 'low_stock' : 'optimal',
      inShoppingList: newQty < item.targetQuantity,
      lastAudited: new Date().toISOString(),
    });

    await dbService.recordAudit({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: action === 'intake' ? 'INTAKE' : 'CONSUME',
      itemName: item.name,
      itemId: item.id,
      quantityChange: delta,
      note: `Adjusted via Optical Barcode Sensor: ${action.toUpperCase()}`,
    });

    triggerHaptic(action === 'intake' ? 'success' : 'consume');
    triggerNativeAlert({
      title: `Barcode Sensor: ${item.name}`,
      body: `Recorded ${action.toUpperCase()} (${delta > 0 ? '+1' : '-1'}). New count: ${newQty} units.`,
      type: 'info',
      icon: 'qr_code_scanner',
    });

    refreshData();
  };

  const handleSaveItem = async (item: InventoryItem) => {
    await dbService.saveItem(item);
    refreshData();
    showToast(`Saved "${item.name}"`);
  };

  const handleDeleteItem = async (id: string) => {
    const targetItem = items.find((i) => i.id === id);
    await dbService.deleteItem(id);
    if (targetItem) {
      await dbService.recordAudit({
        id: `audit_${Date.now()}_del`,
        timestamp: new Date().toISOString(),
        action: 'CONSUME',
        itemName: targetItem.name,
        itemId: id,
        quantityChange: -targetItem.quantity,
        note: `Item permanently removed from catalog: ${targetItem.name}`,
      });
    }
    setSelectedItem(null);
    showToast(`Removed "${targetItem?.name || 'Item'}"`);
    refreshData();
  };

  const handleKpiDrillDown = (filterType: 'all' | 'valuation' | 'waste' | 'restock') => {
    if (filterType === 'restock') {
      handleTabChange('shopping');
    } else {
      handleTabChange('shelves');
    }
  };

  const activeShoppingCount = items.filter((i) => i.inShoppingList).length;

  return (
    <ErrorBoundary isDark={isDark}>
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`min-h-screen flex flex-col transition-colors duration-200 antialiased ${
          isDark ? 'bg-[#0b1326] text-[#f8fafc]' : 'bg-[#faf8ff] text-[#131b2e]'
        }`}
      >
        {/* Pull-to-Refresh Gesture Visual Status Indicator */}
        <div
          style={{
            transform: `translateY(${isRefreshing ? 68 : Math.max(0, pullDistance - 8)}px)`,
            opacity: pullDistance > 12 || isRefreshing ? 1 : 0,
            pointerEvents: 'none',
          }}
          className="fixed top-0 inset-x-0 z-50 flex items-center justify-center transition-all duration-150"
        >
          <div
            className={`px-4 py-2 rounded-full border shadow-2xl backdrop-blur-xl flex items-center gap-2 text-xs font-semibold ${
              isDark
                ? 'bg-[#0f172a]/95 border-sky-500/40 text-sky-200 shadow-[0_8px_30px_rgba(0,0,0,0.6)]'
                : 'bg-white/95 border-sky-300 text-sky-900 shadow-[0_8px_30px_rgba(0,0,0,0.1)]'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${
                isRefreshing
                  ? 'animate-spin text-sky-400'
                  : pullDistance >= 60
                  ? 'text-emerald-400 rotate-180'
                  : 'text-sky-400'
              }`}
            >
              {isRefreshing ? 'sync' : 'arrow_downward'}
            </span>
            <span>
              {isRefreshing
                ? 'Syncing local inventory...'
                : pullDistance >= 60
                ? 'Release to sync database'
                : 'Pull down to refresh'}
            </span>
          </div>
        </div>

        {/* Native Mobile System HUD Banner */}
        <NativeSystemHUD isDark={isDark} />

        {/* Universal Top Application Header (Without hamburger, diagnostics on right) */}
        <Header
          currentTab={currentTab}
          onTabChange={handleTabChange}
          shoppingCount={activeShoppingCount}
          isDark={isDark}
          syncStatus={syncStatus}
          lastSyncedText={lastSyncedText}
          onToggleTheme={() => setIsDark(!isDark)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenSearch={() => setShowSearch(true)}
          onOpenDiagnostics={() => setShowDiagnostics(true)}
          subtitle={
            currentTab === 'dashboard'
              ? 'Dashboard Inventory'
              : currentTab === 'shelves'
              ? 'Physical Hierarchy'
              : currentTab === 'shopping'
              ? 'Restock Queue'
              : 'Optical Sensor'
          }
        />

        {/* System Diagnostics Warmup Console Modal */}
        {showDiagnostics && (
          <DiagnosticsScreen
            itemsCount={items.length}
            onClose={() => setShowDiagnostics(false)}
            onDirectScan={() => {
              setShowDiagnostics(false);
              handleTabChange('scanner');
            }}
            isDark={isDark}
          />
        )}

        {/* Primary Main Content Area */}
        <main id="main-content" className="flex-1 w-full pt-16" tabIndex={-1}>
          {currentTab === 'dashboard' && (
            <DashboardView
              items={items}
              currency={currency}
              syncStatus={syncStatus}
              lastSyncedText={lastSyncedText}
              auditLogs={auditLogs}
              categories={categories}
              locations={locations}
              onConsumeItem={handleConsumeItem}
              onAddToCart={handleAddToCart}
              onBulkAddCritical={handleBulkAddCritical}
              onNavigateToTab={handleTabChange}
              onOpenQuickAdd={() => setShowQuickAdd(true)}
              onKpiDrillDown={handleKpiDrillDown}
              onSelectItem={(item) => setSelectedItem(item)}
              onShowToast={showToast}
              onForceSync={refreshData}
              isDark={isDark}
            />
          )}

          {currentTab === 'shelves' && (
            <ShelvesView
              items={items}
              locations={locations}
              shelves={shelves}
              currency={currency}
              onSelectItem={(item) => setSelectedItem(item)}
              onOpenQuickAdd={() => setShowQuickAdd(true)}
              isDark={isDark}
            />
          )}

          {currentTab === 'shopping' && (
            <ShoppingView
              items={items}
              currency={currency}
              onCommitRestock={handleCommitRestock}
              onUpdateQuantity={handleUpdateShoppingQuantity}
              onShowToast={showToast}
              isDark={isDark}
            />
          )}

          {currentTab === 'scanner' && (
            <ScannerView
              items={items}
              onItemScanned={handleScanIntake}
              onShowToast={showToast}
              isDark={isDark}
            />
          )}
        </main>

        {/* Primary Bottom Navigation Dock */}
        <BottomNavDock
          currentTab={currentTab}
          onTabChange={handleTabChange}
          shoppingCount={activeShoppingCount}
          isDark={isDark}
          onOpenQuickAdd={() => setShowQuickAdd(true)}
        />

        {/* Quick Add Modal */}
        {showQuickAdd && (
          <QuickAddModal
            categories={categories}
            locations={locations}
            shelves={shelves}
            units={units}
            priorities={priorities}
            currency={currency}
            onSave={handleSaveItem}
            onClose={() => setShowQuickAdd(false)}
            onRefreshMasterData={refreshData}
            onShowToast={showToast}
            isDark={isDark}
          />
        )}

        {/* Settings & Master Data Modal with Data Vault and Currency Switcher */}
        {showSettings && (
          <SettingsModal
            categories={categories}
            locations={locations}
            shelves={shelves}
            units={units}
            priorities={priorities}
            currency={currency}
            onSelectCurrency={handleSelectCurrency}
            onRefreshMasterData={refreshData}
            onClose={() => setShowSettings(false)}
            onShowToast={showToast}
            isDark={isDark}
          />
        )}

        {/* Item Detail Inspector Modal */}
        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            categories={categories}
            locations={locations}
            shelves={shelves}
            currency={currency}
            auditLogs={auditLogs}
            onSave={handleSaveItem}
            onDelete={handleDeleteItem}
            onClose={() => setSelectedItem(null)}
            onShowToast={showToast}
            isDark={isDark}
          />
        )}

        {/* Fast Global Search Modal */}
        {showSearch && (
          <SearchModal
            items={items}
            onSelectItem={(item) => setSelectedItem(item)}
            onClose={() => setShowSearch(false)}
            isDark={isDark}
          />
        )}

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1a243b] text-[#f8fafc] border border-[#243049] text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px] text-[#34d399]">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
