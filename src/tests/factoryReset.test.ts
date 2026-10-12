/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_LOCATIONS,
  DEFAULT_SHELVES,
  DEFAULT_UNITS,
  DEFAULT_PRIORITIES,
  HomeShelfDatabase,
} from '../services/db';
import { InventoryItem, MasterCategory, MasterLocation } from '../types/inventory';

// In-memory IndexedDB simulator for unit test verification
class MockIndexedDBFactory {
  databases: Map<string, Map<string, Map<string, any>>> = new Map();

  open(name: string, _version?: number) {
    if (!this.databases.has(name)) {
      this.databases.set(name, new Map());
    }
    const dbStores = this.databases.get(name)!;

    const request: any = {
      result: null,
      error: null,
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
    };

    const mockDb: any = {
      objectStoreNames: {
        contains: (storeName: string) => dbStores.has(storeName),
      },
      createObjectStore: (storeName: string) => {
        if (!dbStores.has(storeName)) {
          dbStores.set(storeName, new Map());
        }
        return {
          createIndex: () => {},
        };
      },
      transaction: (storeNames: string | string[], _mode: string) => {
        const names = Array.isArray(storeNames) ? storeNames : [storeNames];
        names.forEach((n) => {
          if (!dbStores.has(n)) dbStores.set(n, new Map());
        });

        const tx: any = {
          oncomplete: null,
          onerror: null,
          objectStore: (storeName: string) => {
            const table = dbStores.get(storeName)!;
            return {
              put: (item: any) => {
                table.set(item.id, item);
                return { onsuccess: null, onerror: null };
              },
              get: (id: string) => {
                const req: any = { result: table.get(id), onsuccess: null, onerror: null };
                setTimeout(() => req.onsuccess && req.onsuccess(), 0);
                return req;
              },
              getAll: () => {
                const req: any = { result: Array.from(table.values()), onsuccess: null, onerror: null };
                setTimeout(() => req.onsuccess && req.onsuccess(), 0);
                return req;
              },
              count: () => {
                const req: any = { result: table.size, onsuccess: null, onerror: null };
                setTimeout(() => req.onsuccess && req.onsuccess(), 0);
                return req;
              },
              delete: (id: string) => {
                table.delete(id);
                return { onsuccess: null, onerror: null };
              },
              clear: () => {
                table.clear();
                return { onsuccess: null, onerror: null };
              },
            };
          },
        };

        setTimeout(() => {
          if (tx.oncomplete) tx.oncomplete();
        }, 0);

        return tx;
      },
    };

    request.result = mockDb;

    setTimeout(() => {
      if (request.onupgradeneeded) {
        request.onupgradeneeded({ target: request });
      }
      if (request.onsuccess) {
        request.onsuccess({ target: request });
      }
    }, 0);

    return request;
  }
}

describe('Factory Reset & Master Data Integrity Tests', () => {
  let mockIDB: MockIndexedDBFactory;

  beforeEach(() => {
    mockIDB = new MockIndexedDBFactory();
    (globalThis as any).indexedDB = mockIDB;
  });

  it('should initialize database with exactly 142 items and default master records', async () => {
    const db = new HomeShelfDatabase();
    const items = await db.getItems();
    const categories = await db.getCategories();
    const locations = await db.getLocations();
    const shelves = await db.getShelves();
    const units = await db.getUnits();
    const priorities = await db.getPriorities();

    expect(items.length).toBe(142);
    expect(categories.length).toBe(DEFAULT_CATEGORIES.length);
    expect(locations.length).toBe(DEFAULT_LOCATIONS.length);
    expect(shelves.length).toBe(DEFAULT_SHELVES.length);
    expect(units.length).toBe(DEFAULT_UNITS.length);
    expect(priorities.length).toBe(DEFAULT_PRIORITIES.length);
  });

  it('should completely purge custom data and restore pristine 142 factory items upon factory reset', async () => {
    const db = new HomeShelfDatabase();
    
    // 1. Initial state
    const initialItems = await db.getItems();
    expect(initialItems.length).toBe(142);

    // 2. Mutate inventory: add custom item, modify items, add custom master category
    const customItem: InventoryItem = {
      id: 'custom_item_9999',
      name: 'Custom Test Product X',
      description: 'Test description',
      categoryId: 'cat_custom_test',
      locationId: 'loc_custom_zone',
      shelfId: 'shelf_custom_1',
      shelfLocation: 'Lab Storage Shelf 9',
      quantity: 50,
      targetQuantity: 100,
      unitId: 'unit_kg',
      price: 199.99,
      expirationDate: '2029-01-01',
      priorityId: 'prio_normal',
      status: 'optimal',
      barcode: '999999999999',
      inShoppingList: false,
      lastAudited: new Date().toISOString(),
    };
    await db.saveItem(customItem);

    const customCategory: MasterCategory = {
      id: 'cat_custom_test',
      name: 'Custom Biotech Category',
      icon: 'science',
      color: '#ff0055',
      isCustom: true,
    };
    await db.saveCategory(customCategory);

    const customLocation: MasterLocation = {
      id: 'loc_custom_zone',
      name: 'Basement Wine Cellar',
      icon: 'wine_bar',
      itemCount: 1,
      isCustom: true,
    };
    await db.saveLocation(customLocation);

    // Verify mutations took effect
    const mutatedItems = await db.getItems();
    expect(mutatedItems.length).toBe(143);
    expect(mutatedItems.some((i) => i.id === 'custom_item_9999')).toBe(true);

    const mutatedCats = await db.getCategories();
    expect(mutatedCats.some((c) => c.id === 'cat_custom_test')).toBe(true);

    // 3. EXECUTE FACTORY RESET
    await db.resetToDemoDefaults();

    // 4. VERIFY RESTORATION
    const resetItems = await db.getItems();
    expect(resetItems.length).toBe(142);
    expect(resetItems.some((i) => i.id === 'custom_item_9999')).toBe(false);

    const resetCats = await db.getCategories();
    expect(resetCats.length).toBe(DEFAULT_CATEGORIES.length);
    expect(resetCats.some((c) => c.id === 'cat_custom_test')).toBe(false);

    const resetLocs = await db.getLocations();
    expect(resetLocs.length).toBe(DEFAULT_LOCATIONS.length);
    expect(resetLocs.some((l) => l.id === 'loc_custom_zone')).toBe(false);

    // Verify critical items are restored with their authentic seed values
    const milk = resetItems.find((i) => i.id === 'item_milk');
    expect(milk).toBeDefined();
    expect(milk?.name).toBe('Organic Whole Milk');
    expect(milk?.quantity).toBe(0); // Featured depleted item in seed
    expect(milk?.targetQuantity).toBe(1);
  });

  it('should support updating master data category icon and persist changes', async () => {
    const db = new HomeShelfDatabase();
    const categories = await db.getCategories();
    const dairyCat = categories.find((c) => c.id === 'cat_dairy')!;
    expect(dairyCat).toBeDefined();

    // Update dairy category icon
    const updatedDairy = { ...dairyCat, icon: 'egg' };
    await db.saveCategory(updatedDairy);

    const refreshedCats = await db.getCategories();
    const found = refreshedCats.find((c) => c.id === 'cat_dairy');
    expect(found?.icon).toBe('egg');
  });

  it('should support updating master data location icon and persist changes', async () => {
    const db = new HomeShelfDatabase();
    const locations = await db.getLocations();
    const kitchenLoc = locations.find((l) => l.id === 'loc_kitchen')!;
    expect(kitchenLoc).toBeDefined();

    // Update kitchen location icon
    const updatedKitchen = { ...kitchenLoc, icon: 'countertops' };
    await db.saveLocation(updatedKitchen);

    const refreshedLocs = await db.getLocations();
    const found = refreshedLocs.find((l) => l.id === 'loc_kitchen');
    expect(found?.icon).toBe('countertops');
  });

  it('should support Clean Mode (Items Only) clearing all assets while preserving master categories', async () => {
    const db = new HomeShelfDatabase();
    const initialItems = await db.getItems();
    expect(initialItems.length).toBeGreaterThan(0);

    // Clean storage with wipeMasterData: false
    await db.cleanStorage(false);

    const clearedItems = await db.getItems();
    expect(clearedItems.length).toBe(0);

    // Master taxonomy is preserved and ready for fresh user entries
    const categories = await db.getCategories();
    expect(categories.length).toBe(DEFAULT_CATEGORIES.length);
    const locations = await db.getLocations();
    expect(locations.length).toBe(DEFAULT_LOCATIONS.length);
  });

  it('should support Clean Mode (Total Wipe) zeroing out all object stores', async () => {
    const db = new HomeShelfDatabase();

    // Clean storage with wipeMasterData: true
    await db.cleanStorage(true);

    const clearedItems = await db.getItems();
    expect(clearedItems.length).toBe(0);

    const categories = await db.getCategories();
    expect(categories.length).toBe(0);

    const locations = await db.getLocations();
    expect(locations.length).toBe(0);
  });
});
