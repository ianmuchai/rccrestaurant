# RCC local search and app access

Goal: Improve discovery for real restaurant/menu searches in Kitengela while preserving the approved design, and add WhatsApp plus prominent PWA installation.

Design: Use https://rcc.co.ke as the canonical origin. Publish unique server-rendered metadata, XML sitemap, robots controls, Restaurant/Menu/Breadcrumb JSON-LD and nine useful menu category pages. Use the confirmed address (Namanga Road, next to Equity Afya), phone (+254 722 862575), and 05:00-midnight hours; daily hours are the interpretation of the owner's stated opening hours. No invented reviews, ratings, credentials, social profiles, coordinates, or ranking guarantees. Keep the existing four public pages and menu interactions. Add a real WhatsApp link and use the existing PWA install flow in the top bar and redesigned footer.

Execution: Continue in the existing authorized RCC checkout and branch so deployment/preview state is preserved. User has explicitly requested direct implementation and ongoing GitHub/Cloudflare publication; no extra worktree or design approval gate. Use the writing-plans and executing-plans skills inline, with one independent review before publication.

- [x] Audit current HTML, domain readiness, Google documentation, menu data and installation behavior.
- [x] Test canonical-host policy, metadata, structured-data safety, category URLs and menu-price handling before implementation.
- [x] Implement confirmed business information, SSR catalogue/config, metadata/schema and category routes with crawlable internal links.
- [x] Add robots, sitemap, noindex for private/preview surfaces, www normalization, cache-safe response headers and a branded share image.
- [x] Add accessible WhatsApp action, header install button, Android/iPhone footer install options and responsive spacing.
- [x] Run tests, types, production build, SSR/browser SEO checks, mobile UI/install/cart checks and performance checks; fix observed issues.
- [ ] Obtain independent review, publish GitHub/Cloudflare, verify deployed HTML and routes, and document remaining Search Console/Business Profile authorization if needed.

Files: lib/business.ts, lib/seo.ts, lib/seo-policy.ts, lib/public-restaurant.ts; app page modules, category route, sitemap/robots routes, StructuredData and AppAccess components; existing Storefront/MenuCatalog/Install/HeroCarousel and refinement styles; worker/index.ts; tests and SEO setup notes.

Rulings: Owner confirmed phone/address/hours. Use the confirmed number for WhatsApp. Keep payment/fulfillment safeguards unchanged. The new Google Maps profile was not found through web search yet; use an accurate Maps search handoff until the exact verified profile URL is available. Preview URLs remain accessible during DNS activation but receive noindex to consolidate indexing on the official domain. Do not redirect workers.dev to a domain that has not activated.

Progress: Found and verified the exact Maps profile by matching name and phone; updated links/schema. Official HTTPS domain now serves successfully and the registry lists only the assigned Cloudflare pair. Independent review found the admin robots disallow would conceal noindex; removed that disallow and retained staff protection. Final build, 32 tests, types and 13-page/20-layout browser checks passed. Optional Lighthouse audit was stopped without a score after an excessive runtime. Google domain-property verification is proceeding through its Cloudflare authorization flow at the owner's explicit request.
