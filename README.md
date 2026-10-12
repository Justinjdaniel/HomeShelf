# 📦 HomeShelf — Intelligent Home Inventory & Shelf Ledger

[![CI Workflow](https://github.com/Justinjdaniel/HomeShelf/actions/workflows/ci.yml/badge.svg)](https://github.com/Justinjdaniel/HomeShelf/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/Justinjdaniel/HomeShelf/actions/workflows/deploy-web.yml/badge.svg)](https://github.com/Justinjdaniel/HomeShelf/actions/workflows/deploy-web.yml)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-38bdf8?logo=pwa&logoColor=white)](https://vite-pwa-org.netlify.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Built with React 19](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Package Manager](https://img.shields.io/badge/pnpm-12-orange?logo=pnpm&logoColor=white)](https://pnpm.io/)

**HomeShelf** is an autonomous, privacy-preserving, offline-first home pantry and inventory ERP designed to eliminate household waste, prevent duplicate purchases, and keep track of expiration dates and stock levels across every storage shelf and room.

Built as a lightweight Progressive Web App (PWA), HomeShelf operates entirely in your browser without requiring external database servers, subscriptions, or intrusive telemetry.

---

## 🌟 Why HomeShelf?

The average household discards hundreds of dollars in expired food, duplicate pantry items, and forgotten supplies every year. Existing inventory apps either lock your data into proprietary cloud silos, require tedious manual entry, or fail to work when you have no signal in a pantry, basement, or garage.

**HomeShelf solves this with:**
1. **Local-First & Offline Resilience**: Instant read/write access powered by browser IndexedDB. Works on airplanes, in deep pantries, and without internet.
2. **Real-Time Barcode & Camera Scanner**: Quickly log barcodes, UPCs, and product batch numbers directly from your camera.
3. **Smart Expiry Tracking & Waste Prevention**: Visual indicators, amber warnings (expiring within 7 days), and red alerts for expired items with a dedicated Restock and Expiry Dashboard banner.
4. **Complete Master Data Management**: Manage, edit, and assign custom icons and colors to categories, storage locations, shelves, and measurement units via a visual icon picker.
5. **Full Data Sovereignty**: One-click JSON backup export and import, with guaranteed clean factory reset functionality.
6. **Mobile-Native PWA**: Installable on iOS, Android, macOS, and Windows with standalone window experience, offline caching, and native app styling.

---

## 🚀 Key Features

| Feature | Description |
|---|---|
| 📊 **Real-time KPI Dashboard** | High-level overview of total asset valuation, active SKUs, critically low stock, and expiring items with quick-action restock suggestions. |
| 🏷️ **Dynamic Master Data & Icon Picker** | Customize categories and locations with visual icon badges, colors, and descriptions. Modify icons anytime with live preview. |
| ⏰ **Expiration Tracking** | Dedicated badge warnings for perishable items, visual indicators for items expiring within 7 days, and shelf prioritization. |
| 🗄️ **Visual Shelf Navigation** | Browse items by room and shelf hierarchy (Pantry, Refrigerator, Medicine Cabinet, Garage, Cellar). |
| 🛒 **Smart Shopping List** | Automatically surfaces low-stock items and allows manual batch additions to an interactive checklist. |
| 💾 **Data Portability & Backup** | Export complete inventory snapshots to JSON and restore or factory-reset with full transaction integrity. |
| 🌓 **Modern Web & Responsive Design** | Dark mode by default, high-contrast accessible typography, responsive fluid layouts, and zero bloat. |

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8 with Rolldown / esbuild
- **Styling**: Tailwind CSS v4 with modern CSS color-scheme
- **PWA & Offline**: `vite-plugin-pwa` with Workbox runtime caching
- **Storage**: Browser IndexedDB (`src/services/db.ts`) with zero cloud dependencies
- **Charts**: Recharts
- **Testing**: Vitest with unit tests for ledger metrics and factory reset
- **Package Manager**: `pnpm` (Corepack-ready)

---

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ or v22 LTS recommended)
- [pnpm](https://pnpm.io/) (v10+ or v12+) — Corepack is supported:
  ```bash
  corepack enable
  ```

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Justinjdaniel/HomeShelf.git
cd HomeShelf
pnpm install --frozen-lockfile
```

### Development Server

Start the local development server on `http://localhost:3000`:

```bash
pnpm dev
```

### Running Tests

Execute the unit test suites (factory reset, metrics, storage):

```bash
pnpm test
```

### Type Checking & Linting

```bash
pnpm lint
```

`pnpm lint` runs the TypeScript compiler without emitting files. A formatter is not currently configured.

### Production Build

Create an optimized, static production build with PWA service worker and precached assets:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

---

## 🌐 Deploying to GitHub Pages

HomeShelf includes ready-to-use GitHub Actions workflows for continuous integration and automated GitHub Pages deployment:

1. **Automated CI (`.github/workflows/ci.yml`)**:
   Runs on every pull request and push to `main`:
   - Verifies TypeScript types (`pnpm lint`)
   - Runs unit test suites (`pnpm test`)
   - Verifies static build (`pnpm build`)

2. **Automated Deployment (`.github/workflows/deploy-web.yml`)**:
   Runs on push to `main` or when manually started, builds the site, and deploys the static `dist/` directory using GitHub Pages Actions.

### Enabling GitHub Pages in your repository:
1. Navigate to your repository's **Settings** > **Pages**.
2. Under **Build and deployment**, set the Source to **GitHub Actions**.
3. Your PWA will be live at `https://<username>.github.io/<repository-name>/`!

> **Note on Base Path**: The Vite configuration uses relative asset paths for GitHub Pages, so the PWA manifest, icons, and service worker resolve from the deployed project subdirectory.

The Android release workflow is documented separately in [BUILD_ANDROID.md](./BUILD_ANDROID.md). The Android project is currently incomplete, so the APK workflow stops until its Gradle wrapper and launcher activity are present and the app's manifest resources can build.

---

## 🔒 Privacy & Architecture

HomeShelf operates under a strict **Zero-Telemetry, Local-First** policy:
- No tracking cookies, third-party analytics, or data harvesting.
- All product records, barcodes, and master data remain stored on your local device.
- Backups are stored as human-readable standard JSON files that you control.

---

## 📄 License

Licensed under the [MIT](LICENSE).
