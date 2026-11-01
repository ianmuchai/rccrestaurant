# RCC Security Hardening Implementation Plan

> **For agentic workers:** Follow the spec and preserve its public-site access boundary.

**Goal:** Keep RCC's restaurant site public while strengthening staff-only administration and the public Worker deployment.

**Architecture:** Add shared response protections at the Cloudflare Worker edge, close the alternate `workers.dev` request surface, and ensure unexpected API errors reveal no internals. Preserve the established server-side staff session system.

**Tech Stack:** Next-compatible Vinext app, Cloudflare Workers, TypeScript, npm.

**Spec:** `docs/superpowers/specs/2026-11-01-security-hardening-design.md`

## Global Constraints

- Public customer routes remain publicly accessible.
- Staff APIs continue to require authenticated staff sessions.
- Keep changes compatible with Cloudflare Workers and preserve the QR experience.
- Never put credentials or secrets in source control.

## Review Focus

- Public `/admin` shell does not expose private data; staff APIs reject anonymous access.
- Login, logout, API error, and static asset responses receive consistent security headers.
- Production alternate host is disabled without disrupting local development.
- Error handling returns client-safe validation errors and generic unexpected errors.
- Dependency changes remain compatible with Vinext and Cloudflare Workers.

### Task 1: Worker-wide response protections

**Files:** Modify `worker/index.ts`.

- Apply HSTS on HTTPS, `X-Content-Type-Options`, frame protection, `Referrer-Policy`, and a least-privilege `Permissions-Policy` to all Worker responses.
- Preserve `X-Robots-Tag` behavior and do not set an unsafe strict CSP that would break framework hydration.
- Keep this narrowly scoped to response headers.

### Task 2: Production hostname and API errors

**Files:** Modify `worker/index.ts`, `app/api/[...path]/route.ts`.

- Return a generic 404 for `workers.dev` requests while preserving normal local preview and `rcc.co.ke` requests.
- Preserve known `HttpError` status/message pairs. Return a generic 500 response for unexpected errors without forwarding exception text.
- Ensure API responses, including unexpected errors, remain `Cache-Control: no-store`.

### Task 3: Dependency security review

**Files:** `package.json`, lockfile only if a compatible patch is confirmed available.

- Resolve actionable production dependency advisories without taking an unreviewed major upgrade or breaking the Worker bundle.
- If registry access or compatibility evidence is unavailable, document the blocker and leave dependency versions unchanged.

## Current execution record

- Typecheck and production build completed successfully against the checked-in dependency versions.
- npm registry metadata was reachable, but patched package tarballs were unavailable; package manifests and lockfile remain unchanged.
- Cloudflare Wrangler reported that this environment is not logged in and could not reach Cloudflare, so production configuration was not changed or deployed.

## Verification

- Review final diff and `git status` for accidental secret or generated-file changes.
- Run repository typecheck and production build if the local environment supports them; report unavailable checks explicitly.
- Do not claim Cloudflare dashboard protections or production deployment unless verified from account/deployment output.
