# RCC Restaurant, Kitengela

A restaurant website and installable PWA with a full-screen video carousel, categorized food menu, shared cart, pickup/delivery checkout, a staff dashboard, and an M-Pesa integration.

Published website: https://rcc.co.ke

The Worker and production D1 database are deployed. GitHub Builds is connected to `main`. The registry now publishes the Cloudflare pair, and the official HTTPS website is live. Configuring staff access and enabling verified M-Pesa remain account setup steps. See [DNS_STATUS.md](DNS_STATUS.md) for the domain check and [docs/SEO.md](docs/SEO.md) for search setup and maintenance.

## Deploy from GitHub to Cloudflare

Connect this repository to **Cloudflare Workers Builds** with:

| Setting | Value |
| --- | --- |
| Worker name | `rcc-restaurant` |
| Production branch | `main` |
| Root directory | Repository root |
| Build command | `npm run build` |
| Deploy command | `npm run deploy` |
| Node version | `24` |

The D1 database is configured in `cloudflare.project.json`. Its IDs are not credentials. Deployment applies pending database migrations, then publishes the Worker; migration failures stop publication. Existing settings and secrets are retained.

See [CLOUDFLARE.md](CLOUDFLARE.md) for domain setup, build-token permissions, secure staff login, payment configuration and updates.

**Live-order launch requirements:** configure Cloudflare Access for staff, restaurant fulfillment settings and verified M-Pesa credentials. Staff APIs deny access until configured. Pickup/delivery start disabled. Missing payment configuration keeps charging disabled.

## Local development

Use Node 24 and the locked dependencies:

```sh
npm ci
npm test
npm run typecheck
npm run build
npm start
```

On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`. Initialize local D1 tables with `npx wrangler d1 migrations apply DB --local --config dist/server/wrangler.json` before the first preview. `npm start` uses local D1 storage; production data is not copied into the checkout.

## Website

- Four public pages: `/`, `/menu`, `/moments`, `/visit`.
- 300 original menu entries under 37 categories; unresolved source-price conflicts remain blocked.
- Meal-specific matching of supplied RCC photographs; unphotographed meals use labeled placeholders.
- Three muted 60 fps MP4 photo-motion clips with continuous subpixel zoom and pan, without narration or playback controls, with overlapping fades. These are animated supplied photographs, not filmed footage. Reduced-motion and data-saving preferences use still images.
- Responsive menu, category picker, cart persistence, delivery pins and downloadable PWA.
- Public-page offline browsing. Staff, personal-order and payment responses are excluded from the service-worker cache.

## Staff and payments

Cloudflare Access tokens are verified for signature, issuer, audience, expiration and an explicit email allowlist. Browser-supplied identity headers are not authentication. Protect both `/admin` and `/api/staff/*` in Access; leave customer pages and the payment callback public.

All order totals are recalculated server-side. Price changes, unavailable items and unresolved-price items are checked before payment. M-Pesa success requires provider reconciliation and matching receipt, amount, phone and active attempt. Unknown payment outcomes must be reconciled before retrying. Paid cancellations do not automatically issue refunds.

Configure runtime values from `.env.example` in Cloudflare. Never commit real credentials, customer data or `.dev.vars` files. Live Daraja testing remains a prerequisite to accepting payments.

## Maps and assets

The location picker uses bundled Leaflet 1.9.4 with OpenStreetMap tiles and attribution. Browser geolocation and manual coordinates are supported. Google Maps handoff uses universal URLs and requires no Google Maps API key.

The menu and logo originate from supplied PDFs. Photo provenance is retained in `lib/photo-provenance.json`; font and library licenses are in `docs/licenses` and vendor files. An older AI-generated illustrative mandi asset remains in the asset collection; the current carousel uses supplied RCC photos.

Original menu reimport and photo preparation scripts are documented in `scripts`; they are not required to build or deploy the website. Browser QA scripts that depend on this workstation's sibling `qa-tools` directory are local review helpers, not deployment prerequisites.

For optional video regeneration, install Pillow and imageio-ffmpeg, supply the original photographs under `work/drive/photos`, and run `python scripts/create-carousel-videos.py`. Run `python tests/test_carousel_motion.py` to verify fractional camera movement and portrait/landscape crop coverage. These Python tools are not needed for the website build.

## Checks

`npm test` verifies catalogue handling, menu grouping, photo assignments, order validation, payment safeguards, offline exclusions, deployment ordering and Cloudflare Access token validation. `npm run typecheck` checks TypeScript. GitHub CI runs both and a production build on pushes and pull requests to `main`.
