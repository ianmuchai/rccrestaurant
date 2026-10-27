# RCC GitHub and Cloudflare deployment plan

> Execution: superpowers:executing-plans, inline, with a final independent review.

**Goal:** Publish the current RCC application to the user's empty GitHub repository and make direct Cloudflare deployment repeatable.

**Architecture:** Retain the existing Vinext Worker and D1 schema. Read the real database ID from build environment variables, apply tracked migrations before deploying, and authenticate staff through verified Cloudflare Access JWTs rather than caller-provided identity headers.

**Constraints:** Preserve the approved design, cart, photos, PWA, prices, and payment safeguards. Never upload credentials, local database contents, or runtime state. Do not enable payments, configure the domain, or provision paid products without the necessary account configuration. Target repository: https://github.com/ianmuchai/rccrestaurant.git. Keep the existing working branch and preserve all authorized uncommitted changes.

- [x] Add deployment configuration validation and tests for missing/invalid/real D1 IDs and migration failure preventing publication.
- [x] Add verified Cloudflare Access staff authentication with tests for forged headers, missing configuration, invalid JWT signature/issuer/audience/expiry, and email allowlisting.
- [x] Add deployment and CI scripts and a concise account setup guide. Preserve local-only preview support.
- [x] Run unit tests, type checks, production build, local preview checks, deployment dry-run, and scan outgoing source/history for secrets.
- [x] Obtain an independent review, fix material findings, commit current app and deployment work, then push to the provided repository without force.
- [x] Verify the remote commit and report exact remaining Cloudflare account actions.

## Review focus

- No authorization from spoofed identity headers on standalone hosting.
- No deployment with a placeholder database or unapplied migrations.
- Cloudflare build token may need D1 edit permission; failures must stop publication.
- No external QA tooling, local credentials, or local state needed to build the repository.
- Preserve private staff/order/payment data exclusions in the PWA.

## Progress and rulings

- Repository has no remote refs; no existing history will be overwritten.
- Wrangler reports no authenticated Cloudflare account. User is creating the D1 database in the dashboard and will supply its non-secret ID.
- Current branch rcc-build already contains the restaurant implementation; preserve the working checkout instead of copying incomplete uncommitted work into a new worktree.

- Cloudflare OAuth succeeded. Created rcc-db (no existing databases) and recorded its non-secret identifiers in cloudflare.project.json.
- 27 tests pass, TypeScript passes, production build and deploy dry-run pass. Independent review found a legacy staff sign-in link; replaced it with /admin for Access session recovery.
- The .ke parent delegation still uses only HostAfrica nameservers; DNS_STATUS.md records the check and required registrar action.
- User explicitly approved publishing source and brand assets to the public repository. GitHub main received 7d4436e; its Check RCC workflow passed.
- Applied both migrations to rcc-db and deployed the Worker at https://rcc-restaurant.rcc-kitengela.workers.dev. HTTPS pages, catalog and configuration returned 200 after initial certificate provisioning.
- Cloudflare zone remains Pending. The OAuth login does not include Workers Builds configuration permission; requested the one-time dashboard GitHub connection from the user. Payments and fulfillment remain disabled pending verified merchant and restaurant settings.
