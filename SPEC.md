# HomeShelf — Technical Architecture & System Specification

## 1. Executive Summary

HomeShelf is an offline-first domestic inventory and pantry ledger designed for high-efficiency asset tracking, zero-waste spoilage prevention, and real-time optical barcode scanning. Engineered under the **Dual Architecture** paradigm, it features a web-native Progressive Web App (PWA) operating entirely in-browser via IndexedDB alongside a production-ready Native Android codebase leveraging Jetpack Compose and Room SQLite.

---

## 2. Dual Architecture Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                        HOMESHELF REPOSITORY                            │
├───────────────────────────────────┬────────────────────────────────────┤
│ 1. WEB PWA RUNTIME                │ 2. NATIVE ANDROID RUNTIME          │
├───────────────────────────────────┼────────────────────────────────────┤
│ • React 19 + TypeScript 5.7+      │ • Kotlin 2.0+ & Jetpack Compose    │
│ • Tailwind CSS v4 (Zero-runtime)  │ • Material 3 Components & Theming  │
│ • Motion v12 GPU transitions      │ • Android Room SQLite Database     │
│ • IndexedDB Transactional Vault   │ • CameraX Barcode Optical Pipeline │
│ • Service Worker Cache-First PWA  │ • Local KeyStore Encryption        │
│ • Deployed via GitHub Pages       │ • Compiled via GitHub Actions APK  │
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## 3. Data Dictionary & Entity Relationship

### 3.1. Master Data Entities
All multi-choice selection parameters are dynamically resolved through Master Data tables stored locally:

- **`MasterCategory`**:
  - `id`: Unique identifier (`cat_*`)
  - `name`: Human-readable label (e.g., "Dairy & Refrigerated", "Pantry & Grains")
  - `icon`: Material Symbols icon name
  - `color`: Hex color string
  - `isCustom`: Boolean indicating user-defined entry

- **`MasterLocation`**:
  - `id`: Unique identifier (`loc_*`)
  - `name`: Room or physical zone (e.g., "Kitchen Pantry", "Basement Utility")
  - `icon`: Material Symbols icon name
  - `itemCount`: Aggregate quantity of stored assets
  - `isCustom`: Boolean indicating user-defined entry

- **`MasterShelf`**:
  - `id`: Shelf identifier (`shelf_*`)
  - `locationId`: Foreign key to `MasterLocation.id`
  - `name`: Shelf tier (e.g., "Shelf 2 (Dry Goods)", "Heavy Shelf A")
  - `capacityPercent`: Integer 0–100 representing volumetric fill
  - `healthStatus`: `'optimal'` | `'safe_load'` | `'near_limit'` | `'warning'`
  - `totalItems`: Aggregate item count
  - `isCustom`: Boolean indicating user-defined entry

- **`MasterUnit`**:
  - `id`: Unit identifier (`unit_*`)
  - `label`: Full unit label (e.g., "Gallon", "Kilograms", "Pods")
  - `abbreviation`: Short code (e.g., "gal", "kg", "pods")
  - `isCustom`: Boolean indicating user-defined entry

- **`MasterPriority`**:
  - `id`: Priority identifier (`prio_*`)
  - `label`: Description (e.g., "Critical • Expired", "Pantry • Depletion Restock")
  - `level`: Integer precedence (1 = highest urgency)
  - `badgeColor`: Hex color for status tagging
  - `isCustom`: Boolean indicating user-defined entry

### 3.2. Inventory Asset Model
- **`InventoryItem`**:
  - `id`: UUID string
  - `name`: Product title (e.g., "Organic Whole Milk")
  - `description`: Package details and grade specifications
  - `categoryId`: Foreign key to `MasterCategory`
  - `locationId`: Foreign key to `MasterLocation`
  - `shelfId`: Foreign key to `MasterShelf`
  - `shelfLocation`: Composite human-readable path
  - `quantity`: Current numeric stock count
  - `targetQuantity`: Safety reorder threshold
  - `unitId`: Foreign key to `MasterUnit`
  - `price`: Unit replacement value in USD
  - `expirationDate`: ISO date string (`YYYY-MM-DD`)
  - `priorityId`: Foreign key to `MasterPriority`
  - `status`: `'optimal'` | `'low_stock'` | `'expiring_soon'` | `'expired'` | `'depleted'`
  - `barcode`: GTIN-12, GTIN-13, or UPC numeric code
  - `imageUrl`: High-resolution photograph asset
  - `inShoppingList`: Boolean flag for active restock queue
  - `shoppingQuantity`: Units designated for replenishment
  - `lastAudited`: ISO date timestamp

---

## 4. Zero-Waste Predictive Spoilage Logic

Perishability risk is calculated deterministically across the local ledger:

$$\text{DaysToExpiry} = \frac{\text{Timestamp}_{\text{exp}} - \text{Timestamp}_{\text{now}}}{86,400,000}$$

- If $\text{DaysToExpiry} < 0$: Status flags as **`expired`** with Priority 1 Critical Escalation.
- If $0 \le \text{DaysToExpiry} \le 2$: Status flags as **`expiring_soon`** with Waste Risk Valuation:
  $$\text{WasteRiskValuation} = \sum (\text{Price}_i \times \max(1, \text{Quantity}_i))$$
- If $\text{Quantity} < \text{TargetQuantity}$: Status flags as **`low_stock`** and automatically surfaces in Restock Readiness metrics.

---

## 5. Security & Offline Sovereignty

- **Zero External Egress**: No application telemetry, telemetry beacons, or external database synchronizers.
- **Client Encryption**: Data persisted in IndexedDB and Android Room SQLite (`homeshelf.db`) resides in sandboxed application storage protected by Android hardware Keystore.
- **Portability**: Complete JSON backup and restore capabilities allow users to migrate data without third-party cloud dependence.
