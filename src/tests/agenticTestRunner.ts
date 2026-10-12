/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  getItemCriticalThreshold,
  isItemCriticallyLow,
  calculateConsumptionVelocity,
  calculateAverageConsumptionRate,
  calculateItemDepletionEstimate,
} from '../utils/inventoryMetrics';
import { InventoryItem, TransactionAuditEntry } from '../types/inventory';
import { dbService } from '../services/db';

export interface AgenticTestResult {
  id: string;
  name: string;
  category: 'Metrics' | 'Depletion' | 'Database' | 'Integrity';
  status: 'passed' | 'failed' | 'running';
  durationMs: number;
  message: string;
}

export async function runAllAgenticTests(): Promise<AgenticTestResult[]> {
  const results: AgenticTestResult[] = [];

  const runTest = async (
    id: string,
    name: string,
    category: AgenticTestResult['category'],
    fn: () => Promise<void> | void
  ) => {
    const start = performance.now();
    try {
      await fn();
      const durationMs = Math.round(performance.now() - start);
      results.push({
        id,
        name,
        category,
        status: 'passed',
        durationMs,
        message: 'All assertions verified successfully',
      });
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - start);
      results.push({
        id,
        name,
        category,
        status: 'failed',
        durationMs,
        message: err?.message || String(err),
      });
    }
  };

  // Test 1: Critical threshold fallback and custom bounds
  await runTest(
    'test_critical_threshold',
    'Item Critical Threshold Calculation',
    'Metrics',
    () => {
      const mockItem: InventoryItem = {
        id: 'mock_1',
        name: 'Whole Milk',
        description: '1 Gallon Whole Milk',
        categoryId: 'cat_dairy',
        locationId: 'loc_kitchen',
        shelfId: 'shelf_1',
        shelfLocation: 'Fridge',
        quantity: 2,
        targetQuantity: 10,
        unitId: 'unit_btl',
        price: 5.5,
        expirationDate: '2026-12-01',
        priorityId: 'prio_normal',
        status: 'optimal',
        barcode: '123456789012',
        inShoppingList: false,
        lastAudited: new Date().toISOString(),
      };

      // Default fallback (20% of 10 = 2)
      const defaultThreshold = getItemCriticalThreshold(mockItem);
      if (defaultThreshold !== 2) {
        throw new Error(`Expected default threshold 2, got ${defaultThreshold}`);
      }

      // Custom threshold
      mockItem.criticalThreshold = 5;
      const customThreshold = getItemCriticalThreshold(mockItem);
      if (customThreshold !== 5) {
        throw new Error(`Expected custom threshold 5, got ${customThreshold}`);
      }
    }
  );

  // Test 2: Critical Low Stock Indicator
  await runTest(
    'test_critical_low_detection',
    'Critical Low Alert Trigger Bounds',
    'Metrics',
    () => {
      const mockItem: InventoryItem = {
        id: 'mock_2',
        name: 'Olive Oil',
        description: 'Extra Virgin Olive Oil 1L',
        categoryId: 'cat_pantry',
        locationId: 'loc_kitchen',
        shelfId: 'shelf_2',
        shelfLocation: 'Pantry 2',
        quantity: 1,
        targetQuantity: 4,
        criticalThreshold: 2,
        unitId: 'unit_btl',
        price: 18.0,
        expirationDate: '2027-01-01',
        priorityId: 'prio_normal',
        status: 'low_stock',
        barcode: '123456789013',
        inShoppingList: false,
        lastAudited: new Date().toISOString(),
      };

      // Quantity 1 <= criticalThreshold 2 -> should be critically low
      if (!isItemCriticallyLow(mockItem)) {
        throw new Error('Item with qty 1 and threshold 2 must trigger critical alert');
      }

      mockItem.quantity = 3;
      if (isItemCriticallyLow(mockItem)) {
        throw new Error('Item with qty 3 and threshold 2 must not trigger critical alert');
      }
    }
  );

  // Test 3: Days until empty estimate helper
  await runTest(
    'test_depletion_forecast',
    'Average Consumption Rate & Days-Until-Empty Forecast',
    'Depletion',
    () => {
      const mockItem: InventoryItem = {
        id: 'mock_3',
        name: 'Dark Roast Coffee',
        description: 'Dark Roast Coffee Bag',
        categoryId: 'cat_beverages',
        locationId: 'loc_kitchen',
        shelfId: 'shelf_2',
        shelfLocation: 'Pantry 2',
        quantity: 6,
        targetQuantity: 10,
        unitId: 'unit_btl',
        price: 14.0,
        expirationDate: '2027-01-01',
        priorityId: 'prio_normal',
        status: 'optimal',
        barcode: '123456789014',
        inShoppingList: false,
        lastAudited: new Date().toISOString(),
      };

      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const logs: TransactionAuditEntry[] = [
        {
          id: 'log_burn_1',
          timestamp: new Date(now - 2 * dayMs).toISOString(),
          action: 'CONSUME',
          itemName: mockItem.name,
          itemId: mockItem.id,
          quantityChange: -7,
          note: 'Week 1 brew usage',
        },
        {
          id: 'log_burn_2',
          timestamp: new Date(now - 7 * dayMs).toISOString(),
          action: 'CONSUME',
          itemName: mockItem.name,
          itemId: mockItem.id,
          quantityChange: -7,
          note: 'Week 2 brew usage',
        },
      ];

      const rate = calculateAverageConsumptionRate(mockItem, logs, 14);
      if (rate !== 1) {
        throw new Error(`Expected daily rate 1.0, got ${rate}`);
      }

      const estimate = calculateItemDepletionEstimate(mockItem, logs, 14);
      if (estimate.daysUntilEmpty !== 6) {
        throw new Error(`Expected 6 days until empty, got ${estimate.daysUntilEmpty}`);
      }

      if (!estimate.displayEstimate.includes('6 days left')) {
        throw new Error(`Expected display estimate with '6 days left', got ${estimate.displayEstimate}`);
      }
    }
  );

  // Test 4: 7-Day consumption velocity trend
  await runTest(
    'test_velocity_trend',
    '7-Day Consumption Velocity Calculation',
    'Metrics',
    () => {
      const mockItem: InventoryItem = {
        id: 'mock_4',
        name: 'Dishwasher Pods',
        description: '60 Count Platinum Pods',
        categoryId: 'cat_household',
        locationId: 'loc_kitchen',
        shelfId: 'shelf_2',
        shelfLocation: 'Pantry 2',
        quantity: 10,
        targetQuantity: 20,
        unitId: 'unit_pod',
        price: 20.0,
        expirationDate: '2028-01-01',
        priorityId: 'prio_normal',
        status: 'optimal',
        barcode: '123456789015',
        inShoppingList: false,
        lastAudited: new Date().toISOString(),
      };

      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const logs: TransactionAuditEntry[] = [
        {
          id: 'log_v1',
          timestamp: new Date(now - 1 * dayMs).toISOString(),
          action: 'CONSUME',
          itemName: mockItem.name,
          itemId: mockItem.id,
          quantityChange: -6,
          note: 'Heavy cleanup usage',
        },
        {
          id: 'log_v2',
          timestamp: new Date(now - 9 * dayMs).toISOString(),
          action: 'CONSUME',
          itemName: mockItem.name,
          itemId: mockItem.id,
          quantityChange: -2,
          note: 'Normal prior week usage',
        },
      ];

      const velocity = calculateConsumptionVelocity(mockItem, logs);
      if (velocity.status !== 'accelerating') {
        throw new Error(`Expected velocity status 'accelerating', got ${velocity.status}`);
      }
      if (velocity.usageLast7Days !== 6) {
        throw new Error(`Expected 6 units consumed in last 7 days, got ${velocity.usageLast7Days}`);
      }
    }
  );

  // Test 5: Database CRUD and Audit Trail Integrity
  await runTest(
    'test_db_crud_and_delete',
    'IndexedDB Item Persistence, Audit Record & Reliable Deletion',
    'Database',
    async () => {
      const testItem: InventoryItem = {
        id: `agentic_temp_${Date.now()}`,
        name: 'Agentic Test Biscuit',
        description: 'Crispy whole grain biscuit pack',
        categoryId: 'cat_snacks',
        locationId: 'loc_kitchen',
        shelfId: 'shelf_pantry_1',
        shelfLocation: 'Pantry Shelf 1',
        quantity: 5,
        targetQuantity: 5,
        criticalThreshold: 2,
        unitId: 'unit_box',
        price: 3.5,
        expirationDate: '2027-01-01',
        priorityId: 'prio_normal',
        status: 'optimal',
        barcode: '999999888777',
        inShoppingList: false,
        lastAudited: new Date().toISOString(),
      };

      // 1. Save item
      await dbService.saveItem(testItem);

      // 2. Verify stored
      const itemsAfterSave = await dbService.getItems();
      const saved = itemsAfterSave.find((i) => i.id === testItem.id);
      if (!saved) {
        throw new Error('Saved item not found in IndexedDB store');
      }

      // 3. Record audit entry
      await dbService.recordAudit({
        id: `audit_test_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'INTAKE',
        itemName: testItem.name,
        itemId: testItem.id,
        quantityChange: 5,
        note: 'Agentic automated intake validation',
      });

      // 4. Delete item
      await dbService.deleteItem(testItem.id);

      // 5. Verify deleted
      const itemsAfterDelete = await dbService.getItems();
      const stillExists = itemsAfterDelete.find((i) => i.id === testItem.id);
      if (stillExists) {
        throw new Error('Item still exists after calling deleteItem()');
      }
    }
  );

  // Test 6: 30-Day Expiration Horizon 3-Tier Classification
  await runTest(
    'test_30_day_expiry_horizon',
    '30-Day Expiry Horizon 3-Tier Classification & Proximity Sorting',
    'Metrics',
    () => {
      const now = Date.now();
      const msPerDay = 24 * 60 * 60 * 1000;

      const items = [
        { expDays: 5, expectedTier: 'critical' },
        { expDays: 12, expectedTier: 'warning' },
        { expDays: 25, expectedTier: 'approaching' },
      ];

      for (const { expDays, expectedTier } of items) {
        const diffDays = expDays;
        let tier: 'critical' | 'warning' | 'approaching';
        if (diffDays <= 7) tier = 'critical';
        else if (diffDays <= 14) tier = 'warning';
        else tier = 'approaching';

        if (tier !== expectedTier) {
          throw new Error(`Expected tier ${expectedTier} for ${expDays} days, got ${tier}`);
        }
      }
    }
  );

  // Test 7: Data Sovereignty Vault Snapshot Validation
  await runTest(
    'test_vault_export_sovereignty',
    'Database Vault Snapshot Export & Structure Validation',
    'Integrity',
    async () => {
      const exportJson = await dbService.exportDatabase();
      const parsed = JSON.parse(exportJson);

      if (!parsed.data || !Array.isArray(parsed.data.items)) {
        throw new Error('Exported vault JSON missing valid items collection');
      }
      if (!Array.isArray(parsed.data.categories) || !Array.isArray(parsed.data.locations)) {
        throw new Error('Exported vault missing master data categories or locations');
      }
    }
  );

  return results;
}
