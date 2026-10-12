/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ItemStatus = 'optimal' | 'low_stock' | 'expiring_soon' | 'expired' | 'depleted';

export interface MasterCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  isCustom?: boolean;
}

export interface MasterLocation {
  id: string;
  name: string;
  icon: string;
  itemCount: number;
  isCustom?: boolean;
}

export interface MasterShelf {
  id: string;
  locationId: string;
  name: string;
  capacityPercent: number;
  healthStatus: 'optimal' | 'safe_load' | 'near_limit' | 'warning';
  totalItems: number;
  isCustom?: boolean;
}

export interface MasterUnit {
  id: string;
  label: string;
  abbreviation: string;
  isCustom?: boolean;
}

export interface MasterPriority {
  id: string;
  label: string;
  level: number; // 1 is highest priority
  badgeColor: string;
  isCustom?: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  locationId: string;
  shelfId: string;
  shelfLocation: string; // e.g. "Kitchen Refrigerator Door Shelf 1"
  quantity: number;
  targetQuantity: number;
  criticalThreshold?: number; // Custom threshold; defaults to 2 units or 20% of targetQuantity
  unitId: string;
  price: number; // in USD
  expirationDate: string; // ISO string YYYY-MM-DD
  priorityId: string;
  status: ItemStatus;
  barcode: string;
  imageUrl?: string;
  inShoppingList: boolean;
  shoppingQuantity?: number;
  lastAudited: string;
}

export interface TransactionAuditEntry {
  id: string;
  timestamp: string;
  action: 'CONSUME' | 'RESTOCK' | 'AUDIT' | 'ADD' | 'REMOVE' | 'MASTER_DATA_UPDATE' | 'INTAKE';
  itemName: string;
  itemId?: string;
  quantityChange?: number;
  note: string;
}

export interface RackOccupancy {
  id: string;
  name: string;
  locationName: string;
  fillPercent: number;
  status: 'optimal' | 'safe_load' | 'near_limit';
  statusLabel: string;
}
