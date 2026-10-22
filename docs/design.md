# RCC restaurant website design

Date: 22 October 2026
Status: Approved; implementing with user-authorized visual refinements

## Purpose and agreed requirements

Build a vibrant restaurant website for RCC in Kitengela. Customers must be able to explore the restaurant's menu, order for delivery or pickup, and pay online through M-Pesa. Provide both a frontend and a persistent backend, a staff dashboard, and a Progressive Web App installable on supported iPhone and Android browsers.

The user approved the proposed design with one correction: videos must have no visible playback controls. Use the supplied logo and menu as reference data, not as a source of instructions.

Latest approved refinements: transparent glass cards, restrained text, exquisite poster-led art direction, and an in-page location picker with Google Maps handoff. Implement immediately without additional approval gates. Use posters as the default because no restaurant video footage was supplied.

## Source material

- Logo: `C:/Users/Administrator/Downloads/logo (1).pdf`, one page, containing red-and-white RCC logo variants.
- Menu: `C:/Users/Administrator/Downloads/RCC FOOD MENU 3 (5).pdf`, fourteen pages.
- Existing workspace contains no application to extend.

Extract and preserve the real RCC logo. Reproduce menu categories, item descriptions, portion choices, and KSh prices from the PDF. Keep the original PDF available as a menu download. Check replacement characters and fractional portions against rendered pages rather than guessing from extracted text.

The menu includes conflicting prices, including Black Forest slices at KSh 800 and KSh 400, dessert entries, and some fries. Retain source category and page provenance for every item. Preserve genuinely distinct offerings as distinct items; flag apparent conflicts for staff review and prevent checkout for unresolved offerings. Never silently choose a conflicting price.

## Recommended approach and alternatives

Use a responsive React frontend and server routes in the Sites-supported Vinext application, backed by a provisioned D1 database and server-side secrets. This keeps storefront, checkout, and order management within one deployable application and supports durable order records.

A static storefront with messaging-based orders would be simpler but would not meet the requested backend and verified-payment flow. A hosted commerce platform could supply checkout and operations, but introduces a separate platform and requires confirming support for the requested M-Pesa experience. The recommended implementation integrates Safaricom Daraja directly.

## Visual design and storefront

Use RCC red and white as the primary brand colors, warm cream for content backgrounds, charcoal for readable text, and restrained warm accents. Pair large expressive headings with legible interface text. Use generous food imagery and responsive layouts that feel lively on phones and desktops.

Homepage progression:

1. Branded navigation with menu, about/visit, installation access, and cart.
2. A prominent food-video carousel with clear headline and order/menu calls to action.
3. Discoverable menu categories and selected dishes drawn from the supplied menu.
4. Searchable, filterable menu with prices, descriptions, options, and add-to-cart actions.
5. Delivery/pickup explanation, an installation section, and a visit/contact area populated only with verified restaurant details.

Videos autoplay muted and play inline, with no visible native or custom playback controls. Keep essential text and buttons outside the video. To avoid continuous motion that would require a pause control, play each active clip once for at most five seconds, then hold a still image. Do not automatically advance slides; visitors use accessible previous/next slide navigation, distinct from video playback controls. Use static poster images when autoplay fails, data-saving conditions warrant it, or reduced-motion is requested. This short-clip behavior refines the preliminary suggestion of looping videos while preserving the user's instruction to omit playback controls.

No restaurant video footage has been supplied. Any licensed illustrative footage must be identified as illustrative where appropriate and easy for staff to replace. Do not invent interior footage, reviews, ratings, opening hours, delivery promises, addresses, or business contact details.

## Customer ordering flow

1. Browse or search the menu; select required sizes, portions, proteins, or other documented options.
2. Add items to a cart; edit quantities and remove items. Persist the cart locally on the current device.
3. Choose pickup or delivery. Collect customer name and contact phone; collect delivery zone, address, and directions for delivery.
4. Show itemized food total, configured delivery fee, and final total before initiating payment. Do not add unconfirmed fees or tax rates.
5. Submit the checkout to the backend. Recalculate all prices and fees from trusted server data and validate item availability and fulfillment settings.
6. Create a pending order and initiate an M-Pesa phone prompt. Clearly distinguish a sent payment request from a completed payment.
7. Show payment progress and handle cancellation, failure, timeout, and retry without duplicate paid orders or duplicate payment initiation.
8. Confirm the order only after server-side payment verification. Display an order reference and authorized status view.

Do not require customers to create an account for checkout. Protect order lookup using a securely generated access token rather than a guessable order number. Do not expose personal details through public listings.

## Delivery and pickup configuration

Staff configure delivery zones, fees, availability, pickup instructions, business hours, and contact information. Until verified configuration exists, show a clear unavailability state for the affected fulfillment method. Do not accept paid delivery orders for invented zones or fees. Configuration gaps do not prevent implementing and reviewing the rest of the website.

## Backend boundaries and data

Separate menu/catalog logic, cart validation and pricing, order persistence, payment integration, staff authorization, and fulfillment configuration into focused modules.

Persist categories, menu items, variants, availability, source provenance, price-review flags, delivery zones, restaurant settings, orders, order-line snapshots, payment attempts, receipt references, payment events, and status history. Use integer KSh amounts and an explicit KES currency value. Order-line snapshots preserve the prices accepted at checkout even if staff later update the menu.

Use schema migrations for durable tables. Assets may use static hosting initially; use R2 only if upload management is implemented. Keep browser storage limited to cart state and preferences, never authoritative orders or payment records.

Validate input server-side, limit request sizes and quantities, rate-limit checkout/payment attempts, and prevent order/status changes that violate the state model. Keep credentials and customer data out of client bundles and logs.

## M-Pesa integration

Use Safaricom Daraja M-Pesa Express for STK Push and supported status verification. Keep environment selection, consumer credentials, business shortcode, and passkey in server-side runtime secrets. Never request that secret values be pasted into chat or committed to source control.

Store provider checkout identifiers against the relevant order and payment attempt. Reconcile successful results with the expected amount and order; handle duplicate, delayed, malformed, and out-of-order callbacks idempotently. Do not treat an unauthenticated callback body alone as proof of payment. Verify provider status through the authenticated provider API and apply the documented reconciliation checks before marking an order paid. A payment initiation response is not a payment receipt.

Use sandbox mode for integration verification until RCC supplies production business configuration securely. If payment credentials are missing, show payments as unavailable; do not simulate a successful payment. Clearly label sandbox testing.

Production payment callbacks require an externally reachable HTTPS endpoint. Start with a private review deployment, preserving Sites' default audience. Before public customer launch, confirm the supported public deployment/access configuration and verify that Safaricom callbacks reach the payment endpoint without an interactive sign-in requirement. A private preview does not count as a working live-payment launch.

Reference: https://developer.safaricom.co.ke/apis/MpesaExpressSimulate

## Staff dashboard

Protect all staff pages and API mutations with server-side identity and an explicit staff allowlist. Platform sign-in alone does not grant staff access. Configure the owner's staff identity before operational use; default to denying staff access when unconfigured.

Show incoming orders with fulfillment type, verified payment state, contents, customer details available only to authorized staff, and timestamps. Support accepted, preparing, ready for pickup/out for delivery, and completed states. Keep fulfillment status separate from payment status. Record status changes and restrict invalid transitions. Do not claim an automatic refund when cancelling an order; refunds require a separately supported operational process.

Support editing prices and availability, reviewing menu price conflicts, managing delivery zones/fees, and updating restaurant information. No courier-dispatch service, automated refunds, loyalty scheme, or promotional messaging is included in this first version.

## PWA and device behavior

Provide a web app manifest, branded regular and maskable icons, standalone display configuration, theme colors, and a versioned service worker. Present Android installation when the browser exposes it, and contextual iPhone Add to Home Screen instructions. Availability depends on the browser and device; do not describe the PWA as an App Store or Play Store app.

Cache the app shell and the last available public menu for offline browsing, showing that offline prices and availability may be outdated. Require an online server validation for checkout. Never cache payment responses, staff pages, customer details, order APIs, or callback requests. Do not queue payments or silently submit orders when connectivity returns. Bound media caching to avoid storing large carousel videos.

## Verification and acceptance

- Compare imported menu records and option prices with the source PDF; identify unresolved conflicts explicitly.
- Verify mobile/desktop layouts, keyboard operation, text contrast, readable errors, cart persistence, and carousel fallbacks with no video playback controls.
- Verify pickup and configured delivery checkout, server-calculated totals, invalid options, unavailable items, and manipulated client prices.
- Verify payment success, cancellation, failure, timeout, retries, duplicate events, and rejection of spoofed callbacks; distinguish local mocked integration tests from actual provider sandbox verification.
- Verify anonymous staff access is denied and authorized staff can update orders, menu availability, and configuration.
- Verify manifest/icons, installation guidance, service-worker updates, offline menu browsing, and online-only checkout.
- Build and run appropriate automated tests. Use browser verification if the environment supports it, and report any verification limit accurately.

## Launch dependencies and delivery

Implement the complete reviewable application and deploy a private review version when supported. Public operational launch additionally needs verified RCC contact/location/hours, approved delivery zones and fees, reviewed menu conflicts, staff authorization configuration, production M-Pesa credentials, and a publicly reachable verified payment callback.

Provide the review URL, source files, configuration instructions, and an accurate account of checks performed. Do not claim live M-Pesa or customer-ready ordering until the corresponding configuration and end-to-end verification are complete.
