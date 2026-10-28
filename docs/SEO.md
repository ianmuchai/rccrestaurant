# RCC search setup and maintenance

Canonical website: https://rcc.co.ke. Both official hostnames point to the Worker; public GET/HEAD requests to www redirect permanently to the apex. Preview hosts remain accessible but send noindex. Staff pages also send noindex and stay crawlable so search engines can read that instruction; staff authentication is separate. Personal APIs are excluded from robots and offline caching.

## Implemented

- Unique server-rendered titles, descriptions, canonical links, Open Graph and large social cards for four main pages and nine useful menu-category pages.
- Crawlable menu items and owner-confirmed contact/location/hours in initial HTML, with live D1 catalogue overrides included before rendering.
- Restaurant, Menu and Breadcrumb JSON-LD. No invented ratings, reviews, geographic pin or active ordering actions. Unavailable and price-review dishes do not advertise offers in structured data.
- Sitemap at `/sitemap.xml` with 13 official canonical URLs and robots at `/robots.txt`.
- Verified exact Maps listing: https://www.google.com/maps?cid=5135303326429331150 (RCC Restaurant, Kitengela, matching 0722 862575).
- Phone and WhatsApp use +254722862575. Address: Namanga Road, next to Equity Afya, Kitengela. Hours: 05:00 to midnight, interpreted as daily from the owner's instructions.
- A shared PWA installation prompt works from header, service strip, content and Android/iPhone footer, with iOS/Android installation help when a browser prompt is unavailable.

## Google account setup

Completed on 28 October 2026: Google verified ownership of the domain property `sc-domain:rcc.co.ke` using its exact TXT record, confirmed on Cloudflare's authoritative DNS. Search Console accepted `https://rcc.co.ke/sitemap.xml` with “Sitemap submitted successfully.” Keep the Google DNS verification record after ownership is verified. Search Console processing/indexing is not immediate; review its reports as data becomes available.

The public Google Maps listing currently offers **Claim this business** and lacks website/hours. The owner should claim and verify it with Google, set the official website and menu URLs, add the confirmed hours/contact details and genuine restaurant photos, and maintain them consistently. Do not create a duplicate listing. Any phone, video or business-proof challenge must be completed by the actual owner.

## Ongoing work

Use Search Console performance, indexing and Core Web Vitals reports to assess real search visibility. Update the menu through the staff dashboard so the rendered menu and schema stay in sync. Keep public business information consistent across Maps and the website. Add real seasonal menu content and request honest customer reviews through the verified Business Profile. Do not buy links, create fake reviews or publish repetitive location pages.

## Verification

32 application tests pass, including canonical/host policy, safe JSON-LD and price safeguards. TypeScript and production build pass. Browser checks verified 13 initial-HTML pages with JavaScript disabled, nine valid category routes, 404 for unknown categories, sitemap, 20 responsive layouts, shared install prompt, platform help, cart and non-overlapping WhatsApp controls. Independent review's robots/noindex issue was corrected and checked in the final build. Optional Lighthouse execution did not produce a completed report; no score or field-performance claim is made.

Reference: Google Search Central documentation on [LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business), [canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable), and [noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing).
