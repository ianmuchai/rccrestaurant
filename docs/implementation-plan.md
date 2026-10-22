# RCC Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task.

**Goal:** Deliver RCC's premium glass-card storefront, menu, cart, delivery location picker, M-Pesa backend, staff dashboard and PWA.
**Architecture:** A Sites Vinext application with server routes and D1 persistence. Menu import and trusted pricing are shared domain modules; payment and staff operations remain server-only.
**Tech Stack:** TypeScript, React, Vinext, Cloudflare D1, Safaricom Daraja, Leaflet/OpenStreetMap and Google Maps URLs.
**Spec:** ../specs/2026-10-22-rcc-restaurant-design.md

## Global Constraints

- User explicitly requests immediate implementation; proceed inline without another planning approval gate.
- Latest visual direction: glass transparent cards, minimal copy, refined expensive-feeling food posters; no video playback controls or narration.
- Keep functional labels, prices, dietary/source descriptions and errors readable. Never invent business information.
- Add an interactive delivery-location picker and Google Maps handoff. Ask for geolocation only on a user's action.
- Keep live payment disabled without credentials; protected staff APIs deny access unless explicitly configured.

## Review Focus

- Tampered prices/quantities must never affect trusted totals.
- Missing provider/configuration must fail clearly without a false paid confirmation.
- Spoofed/duplicate callbacks must never create a paid order.
- Denied geolocation and map-loading failure must preserve manual location entry.
- Private order records and staff APIs must never enter the offline cache.

### Task 1: Catalog and ordering domain
Files: `rcc-restaurant/lib/catalog.json`, `lib/order.ts`, `tests/order.test.ts`, `scripts/import-menu.py`, `public/brand/*`.
Interfaces: export `priceOrder(lines, catalog)` and `normalizePhone(input)`; menu uses stable IDs, category, options, provenance, review flags.
- [ ] Import PDF and inspect ambiguous fractions and prices; preserve source PDF and crop real logo.
- [ ] Write tests for trusted prices, invalid options, quantities, price conflicts, Kenyan phones and coordinate boundaries; run and observe failure.
- [ ] Implement domain functions; run all domain tests and require PASS.

### Task 2: Backend and staff
Files: `db/schema.ts`, `lib/server.ts`, `lib/mpesa.ts`, `app/api/[...path]/route.ts`, `app/admin/*`.
Interfaces: GET catalog/config; POST orders/payment; authenticated token order lookup; protected staff read/write endpoints.
- [ ] Test validation, unconfigured payments, callback reconciliation and staff allowlist failures before implementing.
- [ ] Implement durable orders/payment attempts, idempotency, rate limiting, trusted pricing, auth, provider queries, staff catalog/settings/order updates.
- [ ] Generate schema-only migration, run tests and build. Verify no credential values enter client assets.

### Task 3: Storefront and maps
Files: `app/page.tsx`, `app/components/*`, `app/globals.css`, `public/assets/*`.
Interfaces: consume catalog/config/order APIs; cart lines contain item/option IDs and quantity only.
- [ ] Build responsive poster-led layout, glass cards, menu search/categories, cart and checkout with payment progress.
- [ ] Add Leaflet picker, explicit geolocation button, draggable pin, manual coordinates/address fallback and Google Maps handoff.
- [ ] Verify mobile/desktop, navigation, cart arithmetic, checkout errors and location denial behavior.

### Task 4: PWA, verification and publishing
Files: `public/sw.js`, `public/manifest.webmanifest`, icons, `README.md`, `.env.example`.
- [ ] Add install controls and iPhone instructions, versioned public-only offline caching and online-only checkout.
- [ ] Run domain/integration tests, TypeScript, production build and browser checks if available.
- [ ] Review security/accessibility and source provenance; fix observed issues.
- [ ] Package exact pushed source with Sites helper; publish private review and report real URL or precise blocker.
