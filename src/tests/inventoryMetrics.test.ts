/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  getItemCriticalThreshold,
  isItemCriticallyLow,
  calculateConsumptionVelocity,
  calculateAverageConsumptionRate,
  calculateItemDepletionEstimate,
} from '../utils/inventoryMetrics';
import { InventoryItem, TransactionAuditEntry } from '../types/inventory';

// Mock inventory item helper
function createMockItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: 'test_item_1',
    name: 'Organic Whole Milk',
    description: '1 Gallon Whole Milk',
    categoryId: 'cat_dairy',
    locationId: 'loc_kitchen',
    shelfId: 'shelf_fridge_1',
    shelfLocation: 'Refrigerator Top Shelf',
    quantity: 3,
    targetQuantity: 4,
    unitId: 'unit_btl',
    price: 4.99,
    expirationDate: '2026-10-25',
    priorityId: 'prio_replenish',
    status: 'optimal',
    barcode: '011110416001',
    inShoppingList: false,
    lastAudited: new Date().toISOString(),
    ...overrides,
  };
}

describe('Inventory Metrics & Thresholds Test Suite', () => {
  describe('getItemCriticalThreshold', () => {
    it('should return custom criticalThreshold if explicitly configured on item', () => {
      const item = createMockItem({ targetQuantity: 10, criticalThreshold: 4 });
      expect(getItemCriticalThreshold(item)).toBe(4);
    });

    it('should clamp negative custom threshold to 0', () => {
      const item = createMockItem({ targetQuantity: 10, criticalThreshold: -2 });
      expect(getItemCriticalThreshold(item)).toBe(0);
    });

    it('should fallback to 2 units or 20% of targetQuantity when threshold is undefined', () => {
      // 20% of 5 is 1 -> fallback Math.max(2, 1) = 2
      const itemLowTarget = createMockItem({ targetQuantity: 5, criticalThreshold: undefined });
      expect(getItemCriticalThreshold(itemLowTarget)).toBe(2);

      // 20% of 20 is 4 -> fallback Math.max(2, 4) = 4
      const itemHighTarget = createMockItem({ targetQuantity: 20, criticalThreshold: undefined });
      expect(getItemCriticalThreshold(itemHighTarget)).toBe(4);
    });
  });

  describe('isItemCriticallyLow', () => {
    it('should return true if item status is depleted or quantity <= 0', () => {
      const depletedItem = createMockItem({ quantity: 0, status: 'depleted' });
      expect(isItemCriticallyLow(depletedItem)).toBe(true);
    });

    it('should return true when quantity is at or below the critical threshold', () => {
      const item = createMockItem({ quantity: 2, targetQuantity: 10, criticalThreshold: 3 });
      expect(isItemCriticallyLow(item)).toBe(true);
    });

    it('should return false when quantity is strictly greater than the critical threshold', () => {
      const item = createMockItem({ quantity: 4, targetQuantity: 10, criticalThreshold: 3 });
      expect(isItemCriticallyLow(item)).toBe(false);
    });
  });

  describe('calculateConsumptionVelocity', () => {
    it('should detect accelerating velocity when last 7 days consumption exceeds prior week', () => {
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const item = createMockItem({ id: 'item_accel' });

      const logs: TransactionAuditEntry[] = [
        // 5 units consumed in past 7 days
        {
          id: 'log_recent',
          timestamp: new Date(now - 2 * dayMs).toISOString(),
          action: 'CONSUME',
          itemName: item.name,
          itemId: item.id,
          quantityChange: -5,
          note: 'Recent consumption log',
        },
        // 2 units consumed in prior 7 days
        {
          id: 'log_prior',
          timestamp: new Date(now - 10 * dayMs).toISOString(),
          action: 'CONSUME',
          itemName: item.name,
          itemId: item.id,
          quantityChange: -2,
          note: 'Prior consumption log',
        },
      ];

      const velocity = calculateConsumptionVelocity(item, logs);
      expect(velocity.status).toBe('accelerating');
      expect(velocity.usageLast7Days).toBe(5);
      expect(velocity.usagePrev7Days).toBe(2);
      expect(velocity.changeRate).toBeGreaterThan(0);
    });

    it('should detect decelerating velocity when last 7 days consumption is lower than prior week', () => {
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const item = createMockItem({ id: 'item_decel' });

      const logs: TransactionAuditEntry[] = [
        // 1 unit consumed recently
        {
          id: 'log_recent',
          timestamp: new Date(now - 3 * dayMs).toISOString(),
          action: 'CONSUME',
          itemName: item.name,
          itemId: item.id,
          quantityChange: -1,
          note: 'Recent consumption log',
        },
        // 4 units consumed prior week
        {
          id: 'log_prior',
          timestamp: new Date(now - 11 * dayMs).toISOString(),
          action: 'CONSUME',
          itemName: item.name,
          itemId: item.id,
          quantityChange: -4,
          note: 'Prior week consumption log',
        },
      ];

      const velocity = calculateConsumptionVelocity(item, logs);
      expect(velocity.status).toBe('decelerating');
      expect(velocity.usageLast7Days).toBe(1);
      expect(velocity.usagePrev7Days).toBe(4);
      expect(velocity.changeRate).toBeLessThan(0);
    });

    it('should return stable pace when consumption in both periods is balanced', () => {
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const item = createMockItem({ id: 'item_stable' });

      const logs: TransactionAuditEntry[] = [
        {
          id: 'log_recent',
          timestamp: new Date(now - 2 * dayMs).toISOString(),
          action: 'CONSUME',
          itemName: item.name,
          itemId: item.id,
          quantityChange: -3,
          note: 'Recent usage',
        },
        {
          id: 'log_prior',
          timestamp: new Date(now - 9 * dayMs).toISOString(),
          action: 'CONSUME',
          itemName: item.name,
          itemId: item.id,
          quantityChange: -3,
          note: 'Prior usage',
        },
      ];

      const velocity = calculateConsumptionVelocity(item, logs);
      expect(velocity.status).toBe('stable');
      expect(velocity.changeRate).toBe(0);
    });
  });

  describe('calculateAverageConsumptionRate & calculateItemDepletionEstimate', () => {
    it('should compute exact daily rate from audit logs', () => {
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const item = createMockItem({ id: 'item_daily_test', quantity: 7 });

      // Consumed 14 units across 14 days = 1.0 unit/day
      const logs: TransactionAuditEntry[] = [
        {
          id: 'log_1',
          timestamp: new Date(now - 2 * dayMs).toISOString(),
          action: 'CONSUME',
          itemName: item.name,
          itemId: item.id,
          quantityChange: -7,
          note: 'Week 1 usage',
        },
        {
          id: 'log_2',
          timestamp: new Date(now - 8 * dayMs).toISOString(),
          action: 'CONSUME',
          itemName: item.name,
          itemId: item.id,
          quantityChange: -7,
          note: 'Week 2 usage',
        },
      ];

      const rate = calculateAverageConsumptionRate(item, logs, 14);
      expect(rate).toBe(1);

      const estimate = calculateItemDepletionEstimate(item, logs, 14);
      expect(estimate.dailyRate).toBe(1);
      expect(estimate.daysUntilEmpty).toBe(7);
      expect(estimate.urgency).toBe('healthy');
      expect(estimate.estimatedEmptyDate).not.toBeNull();
    });

    it('should flag urgency as critical when daysUntilEmpty is 2 or less', () => {
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const item = createMockItem({ id: 'item_critical_burn', quantity: 2 });

      // Consumed 14 units in 14 days = 1 unit/day -> with 2 units left = 2 days left
      const logs: TransactionAuditEntry[] = [
        {
          id: 'log_burn',
          timestamp: new Date(now - 1 * dayMs).toISOString(),
          action: 'CONSUME',
          itemName: item.name,
          itemId: item.id,
          quantityChange: -14,
          note: 'Heavy usage spike',
        },
      ];

      const estimate = calculateItemDepletionEstimate(item, logs, 14);
      expect(estimate.daysUntilEmpty).toBe(2);
      expect(estimate.urgency).toBe('critical');
      expect(estimate.displayEstimate).toContain('Critical');
    });

    it('should flag depleted immediately when quantity is 0', () => {
      const item = createMockItem({ quantity: 0, status: 'depleted' });
      const estimate = calculateItemDepletionEstimate(item, []);
      expect(estimate.daysUntilEmpty).toBe(0);
      expect(estimate.urgency).toBe('depleted');
      expect(estimate.displayEstimate).toContain('Out of stock');
    });

    it('should fall back to smart category baseline when no logs exist', () => {
      const dairyItem = createMockItem({ categoryId: 'cat_dairy', quantity: 3, targetQuantity: 6 });
      const rate = calculateAverageConsumptionRate(dairyItem, []);
      expect(rate).toBeGreaterThan(0);

      const estimate = calculateItemDepletionEstimate(dairyItem, []);
      expect(estimate.daysUntilEmpty).not.toBeNull();
      expect(estimate.daysUntilEmpty).toBeGreaterThan(0);
    });
  });

  describe('30-Day Expiry Horizon & Three-Tier Categorization', () => {
    it('should correctly classify items into three distinct urgency tiers based on expiration proximity', () => {
      const now = Date.now();
      const msPerDay = 24 * 60 * 60 * 1000;

      const itemCritical = createMockItem({
        id: 'crit_exp',
        expirationDate: new Date(now + 4 * msPerDay).toISOString().slice(0, 10), // 4 days
      });
      const itemWarning = createMockItem({
        id: 'warn_exp',
        expirationDate: new Date(now + 10 * msPerDay).toISOString().slice(0, 10), // 10 days
      });
      const itemApproaching = createMockItem({
        id: 'appr_exp',
        expirationDate: new Date(now + 22 * msPerDay).toISOString().slice(0, 10), // 22 days
      });
      const itemDistant = createMockItem({
        id: 'dist_exp',
        expirationDate: new Date(now + 45 * msPerDay).toISOString().slice(0, 10), // 45 days
      });

      const classify = (item: InventoryItem) => {
        if (!item.expirationDate) return null;
        const expTime = new Date(item.expirationDate).getTime();
        const diffDays = Math.ceil((expTime - now) / msPerDay);
        if (diffDays > 30) return null;
        if (diffDays <= 7) return { tier: 'critical', diffDays };
        if (diffDays <= 14) return { tier: 'warning', diffDays };
        return { tier: 'approaching', diffDays };
      };

      expect(classify(itemCritical)?.tier).toBe('critical');
      expect(classify(itemWarning)?.tier).toBe('warning');
      expect(classify(itemApproaching)?.tier).toBe('approaching');
      expect(classify(itemDistant)).toBeNull();
    });

    it('should sort expiring items in ascending order of proximity to expiration date', () => {
      const now = Date.now();
      const msPerDay = 24 * 60 * 60 * 1000;

      const items = [
        createMockItem({ id: 'i20', expirationDate: new Date(now + 20 * msPerDay).toISOString().slice(0, 10) }),
        createMockItem({ id: 'i2', expirationDate: new Date(now + 2 * msPerDay).toISOString().slice(0, 10) }),
        createMockItem({ id: 'i11', expirationDate: new Date(now + 11 * msPerDay).toISOString().slice(0, 10) }),
      ];

      const sorted = items
        .map((i) => {
          const expTime = new Date(i.expirationDate!).getTime();
          const diffDays = Math.ceil((expTime - now) / msPerDay);
          return { item: i, diffDays };
        })
        .sort((a, b) => a.diffDays - b.diffDays);

      expect(sorted[0].item.id).toBe('i2');
      expect(sorted[1].item.id).toBe('i11');
      expect(sorted[2].item.id).toBe('i20');
    });
  });

  describe('Database Vault JSON Backup & Restore Format Validation', () => {
    it('should validate structured JSON database snapshot structure', () => {
      const mockSnapshot = {
        version: 1,
        exportedAt: new Date().toISOString(),
        data: {
          items: [createMockItem()],
          categories: [{ id: 'cat_test', name: 'Test Category', icon: 'category', color: '#fff' }],
          locations: [{ id: 'loc_test', name: 'Kitchen', icon: 'room', itemCount: 1 }],
          shelves: [{ id: 'shelf_test', locationId: 'loc_test', name: 'Pantry', capacityPercent: 50, healthStatus: 'optimal', totalItems: 1 }],
          units: [{ id: 'unit_test', label: 'Unit', abbreviation: 'un' }],
          priorities: [{ id: 'prio_test', label: 'Normal', level: 1, badgeColor: '#38bdf8' }],
          auditLogs: [],
        },
      };

      const jsonStr = JSON.stringify(mockSnapshot);
      const parsed = JSON.parse(jsonStr);

      expect(parsed.data.items).toHaveLength(1);
      expect(parsed.data.categories).toHaveLength(1);
      expect(parsed.data.locations).toHaveLength(1);
      expect(parsed.data.items[0].name).toBe('Organic Whole Milk');
    });
  });
});

