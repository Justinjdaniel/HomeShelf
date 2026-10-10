# HomeShelf — Agentic Orchestration & Development Protocols

## 1. Role & Identity

This document prescribes operational directives for autonomous software agents, engineers, and maintainers interacting with the HomeShelf codebase.

---

## 2. Agentic Directives & Invariants

1. **Local Data Invariant**:
   - Under no circumstances may code be modified to transmit user inventory, barcodes, or locations to remote third-party servers. All persistence must remain 100% client-side (IndexedDB for Web, Room SQLite for Android).
2. **Master Data Dependency**:
   - Never hardcode multi-choice selection values (categories, locations, units) in component logic. Form selectors must always query the reactive Master Data repository.
3. **Tabular Numerals Compliance**:
   - All financial figures, quantities, and dates must enforce tabular figures (`tabular-nums`) to prevent layout shifts during reactive updates.
4. **Touch Target Constraint**:
   - All interactive controls on both Android Native (Compose) and Web (React) must guarantee a minimum touch hitbox of 44×44px (48×48px for primary CTAs).

---

## 3. Subsystem Verification & CI/CD Checklist

Before committing changes to `main`:

- [ ] **Type Safety**: Execute `npm run lint` (`tsc --noEmit`) with zero errors.
- [ ] **PWA Offline Integrity**: Confirm `manifest.json` and `sw.js` precache static assets.
- [ ] **Android Compilation**: Verify `./gradlew assembleDebug` builds without deprecation warnings.
- [ ] **GitHub Actions Automation**:
  - Ensure `.github/workflows/ci.yml` passes all checks.
  - Confirm `.github/workflows/release-apk.yml` correctly attaches pre-signed APK binaries.
  - Confirm `.github/workflows/deploy-web.yml` publishes dist to GitHub Pages.

---

## 4. Troubleshooting & Self-Healing

| Symptom | Root Cause | Remediation Protocol |
| :--- | :--- | :--- |
| **IndexedDB blocked** | Multiple browser tabs holding older schema version | Call `indexedDB.deleteDatabase()` or trigger `dbService.resetToDemoDefaults()` |
| **Camera feed black** | Permission denied or unsupported facingMode | Fallback automatically to simulated GTIN preset buttons |
| **Layout overflow** | Text wrapping on small screens | Enforce single-line controls with `truncate` or `whitespace-nowrap` |
