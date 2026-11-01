# Google QR landing page Implementation Plan

> **For agentic workers:** Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Let the existing branded Google QR open an RCC page with menu, directions, and Google review actions.

**Architecture:** Replace the existing `/google` GET/HEAD redirect route with a static server-rendered Next page using the current business listing URL. Add scoped mobile-first styles and update the QR guide to describe the landing page. No QR asset or encoded destination changes.

**Tech Stack:** Next.js App Router, React, TypeScript, existing global CSS, Node test suite.

**Spec:** `docs/superpowers/specs/2026-11-01-google-qr-landing-design.md`

## Global Constraints

- Preserve the QR code and its encoded URL `https://rcc.co.ke/google`.
- Use the confirmed Maps listing in `lib/business.ts` for directions and Google reviews.
- Keep `/google` out of search indexing.
- Do not add dependencies or external services.

## Review Focus

- The old redirect-specific test no longer imports a route handler that is removed when `/google` becomes a page.
- All three destination links remain correct and open Google externally with safe link attributes.
- Small mobile viewport keeps all three choices readable and easy to tap.
- QR documents and generated assets retain their original encoded destinations.
- Route metadata remains `noindex`.

### Task 1: Turn `/google` into the QR landing page

**Files:**
- Delete: `app/google/route.ts`
- Create: `app/google/page.tsx`
- Create: `app/google/google-landing.css`
- Modify: `tests/google-profile.test.ts`
- Modify: `docs/GOOGLE-QR.md`

**Interfaces:**
- Next page at `/google` handles GET and HEAD with a normal page response.
- Landing page presents `/menu`, `business.maps` directions, and a review action using the verified listing URL.

- [x] Implement a semantic, server-rendered page with page-specific noindex metadata, RCC identity, short welcoming copy, and three prominent action links.
- [x] Add scoped responsive styles in RCC’s cream/wine palette with large tap targets, clear focus states, and a small-screen single-column layout.
- [x] Update `tests/google-profile.test.ts` to remove the obsolete redirect assertions and cover the new QR entry-page contract.
- [x] Update `docs/GOOGLE-QR.md` to explain `/google` now serves the choice page and the direct backup remains unchanged.
- [x] Run verification from `rcc-restaurant`: all 36 tests pass, typecheck passes, focused ESLint passes, and production build passes. Whole-project ESLint still reports pre-existing errors in unrelated files.
- [x] Confirm no QR asset or QR-generation script was modified.
