# RCC Restaurant · Kitengela

A full-stack, responsive restaurant PWA with a premium poster carousel, translucent cards, imported menu, cart, delivery map pin selection, Google Maps handoff, M-Pesa integration and protected staff studio.

## Run locally

Requires Node 22.13 or newer. Dependencies are locked in `package-lock.json`.

```sh
npm ci
npm test
npm run typecheck
npm run build
```

If Windows blocks `npm.ps1`, use `npm.cmd` or invoke the installed `npm-cli.js` with Node. In this environment the Sites helper's Windows npm shim also failed, so the verified direct build command is `node scripts/run-framework.mjs build`.

Build once, then apply each SQL migration in `drizzle/` exactly once to local D1:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_lonely_microchip.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_hesitant_skin.sql
npm run dev
```

The portable preview runs at the printed loopback URL. `npm start` previews the production Worker locally; it does not publish. Production previews support service-worker testing; development deliberately skips automatic registration.

## Staff and business configuration

The staff studio is `/admin`. All staff APIs enforce the authenticated Sites user ID against the server-side `STAFF_USER_IDS` comma-separated allowlist. An empty allowlist denies everyone. Site ownership or being signed in does not automatically grant staff access. Set verified staff user IDs as runtime secrets. Do not allow user-supplied identity headers through a custom proxy; Sites owns and sanitizes those headers.

For portable local development only, the supplied sign-in helper uses `local_seedy` at `/signin-with-chatgpt?return_to=/admin`. To exercise staff editing locally, put `STAFF_USER_IDS=local_seedy` in an ignored `.dev.vars` file. Never use development identity simulation as production authentication.

Staff can set real contact details, hours, pickup instructions, an exact restaurant map pin, pickup/delivery availability and approved delivery zones/fees. Both fulfillment methods start disabled until configured. Menu editing supports option prices, availability and resolving source-price conflicts. Order status changes require verified payment, except cancellation. Paid cancellations do not issue automatic refunds.

## M-Pesa

Configure the names listed in `.env.example` as server runtime secrets through hosting settings. Never commit or paste real values into chat. Local Worker secrets can use ignored `.dev.vars` files. Required values include Daraja consumer credentials, shortcode, passkey, environment, public HTTPS site URL and a random callback secret of at least 32 characters. Select the transaction type supported by the merchant account.

1. Connect an approved Safaricom Daraja sandbox app securely.
2. Configure verified fulfillment settings and resolve price conflicts.
3. Verify STK initiation, callback delivery, authenticated query reconciliation, cancellation and timeout paths with the provider sandbox.
4. Configure production credentials only after merchant approval and successful provider testing.
5. Publish to the intended public audience and verify Safaricom can reach `/api/mpesa/callback` without an interactive authentication screen. The initial private Sites review deployment is not a live customer-payment launch.

Checkout calculates totals server-side and rejects stale client quotes before charging. Payment initiation uses an atomic order lock; failure callbacks update only their active attempt. Authenticated callback events are persisted before provider querying and retried through bounded authenticated order polling. A timeout of STK initiation stays uncertain to avoid a duplicate charge. A missing callback cannot be replaced by trusting a browser or inventing a receipt: staff must reconcile through the merchant portal. A pending request is never displayed as paid.

M-Pesa configuration is currently absent. No real money has been charged; end-to-end Daraja testing remains a launch dependency. A private deployment will also need a supported externally reachable callback configuration before live payments.

Official API: https://developer.safaricom.co.ke/apis/MpesaExpressSimulate

## Menu and assets

`lib/catalog.json` contains 300 entries imported from all 14 pages of the supplied menu, including 37 categories, pizza sizes and occasional-cake weights. Items retain source page provenance. Nineteen apparent price conflicts are blocked until reviewed by staff. The original menu is available as an image-optimized PDF with content retained. `scripts/import-menu.py` documents extraction; reimporting regenerates source data, so review before replacing an edited catalog.

The RCC logo and food photographs are extracted from supplied PDFs. The main mandi poster is AI-generated illustrative artwork, not a claim about a photographed RCC dish. Food imagery is labeled illustrative on the website. Built-in image generation was used with this prompt: “Cinematic premium food photograph for an RCC website: roasted goat mandi and golden spiced rice on dark ceramic, burgundy stone and crimson linen, warm raking light, right-weighted feast and dark left negative space. No people, interiors, logos, words or watermark.” Master artwork is `artwork/mandi-poster.png`; optimized website asset is `public/assets/mandi-poster.webp`.

The latest approved direction uses posters, minimal copy and no narration or playback controls. No restaurant video footage was supplied.

## Maps

The in-page location picker uses bundled Leaflet 1.9.4 with OpenStreetMap tiles and attribution. Visitors can click a location, drag the pin, explicitly request geolocation or enter coordinates manually. Selected locations open in Google Maps through its universal URLs. No Google Maps API key is needed for the external handoff. Without a verified restaurant pin, the visit link opens a named Google Maps search rather than inventing coordinates.

Official references: https://leafletjs.com/reference and https://developers.google.com/maps/documentation/urls/get-started

## PWA and privacy

Manifest, regular/maskable icons and a versioned service worker support installation on compatible browsers. Android uses the available install prompt; iPhone has Safari Add to Home Screen instructions. Cached public shell, static JS/CSS, images and last fetched catalog support offline browsing. Order APIs, staff routes, payment data, callback URLs and customer records are never cached. Checkout requires connectivity. External map tiles and fonts need connectivity, with manual-coordinate and system-font fallbacks. The original PDF and videos are excluded from automatic caching.

Cart preferences use local storage; order access tokens live only in session storage and permit token-authorized order status lookup. Staff order details remain server-authorized. Starting another order clears the currently displayed tracking session; retain the reference for staff enquiries.

## Verification

Run `npm test` for trusted pricing, input/coordinate validation, allowlist rules, M-Pesa readiness/reconciliation and service-worker cache boundaries. Run `npm run typecheck` and the production build for compilation checks. Browser QA covers desktop/mobile layouts, carousel, cart, checkout, coordinate pin selection and Google Maps links; unconfigured staff/payment endpoints fail closed. Live provider settlement and installation on physical iPhone/Android hardware require launch testing.
