# RCC security hardening

## Goal

Keep the restaurant storefront public while making staff administration and private APIs accessible only to authenticated staff and reducing common web attack paths.

## Approved access boundary

- Public customer pages, menu, directions, and public order creation remain available without staff credentials.
- `/admin` may render a public sign-in shell, but no administrative data or actions are available until staff login succeeds.
- All `/api/staff/*` data and mutation routes require a valid staff session.
- Non-staff customer APIs remain public only where required by the ordering flow and retain validation, ownership tokens, and rate limits.

## Design

1. Apply security headers to every response at the Worker boundary. Use HSTS, MIME sniffing protection, frame restrictions, a restrictive permissions policy, and a referrer policy. Avoid a strict script CSP until the app can supply nonces to its framework-generated inline scripts.
2. Return a generic 404 for requests to the public `workers.dev` hostname, preserving `rcc.co.ke` as the public entry point and keeping local development functional.
3. Ensure unexpected server errors return a generic message rather than exception text. Keep known client-safe `HttpError` messages and prevent cache storage of API responses.
4. Keep staff authentication on the server, enforce origin checks on state-changing requests, preserve bounded request bodies, secure cookies, short-lived signed sessions, and login throttling. Do not store staff credentials in repository files.
5. Review and update vulnerable production dependencies only when a compatible patched version is available; validate against the framework and Worker runtime.

## Out of scope

- Hiding or password-protecting the public restaurant website.
- Claiming that any site is impossible to hack.
- Changing the existing QR code, customer flows, menu, or payment behavior.
- Cloudflare account changes that cannot be confirmed through the available deployment configuration or authenticated account access.

## Operational requirements

- Do not expose, print, or commit staff or payment secrets.
- Do not weaken the existing customer experience or QR destination.
- Apply production configuration only after the resulting deployment artifact is reviewed.
- Record any Cloudflare dashboard controls that need an account owner separately from code-level changes.
