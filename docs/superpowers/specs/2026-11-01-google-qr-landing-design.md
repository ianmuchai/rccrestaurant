# Google QR landing page

- **Intent:** Give diners who scan RCC’s existing branded Google QR a fast, polished choice between the menu, restaurant directions, and rating/reviewing RCC on Google.
- **Approaches:** Keep the existing QR destination `/google` and replace its redirect with the page (chosen: preserves the printed code); add a new path and regenerate the QR (rejected: conflicts with the instruction to keep the same code).
- **Scope and constraints:** Preserve all QR assets and the encoded URL. Reuse the confirmed Google Maps listing in `lib/business.ts`. Provide a mobile-first, accessible page in the current Next app with clear direct links to `/menu`, directions, and the Google listing/reviews. Keep this route out of search indexing as it is intended as a QR entry point.
- **Non-goals:** No QR regeneration, ordering flow, review collection/storage, or new external service.
- **Implementation choice:** Replace `/google`’s GET/HEAD redirect with a small server-rendered landing page and focused styles consistent with RCC’s existing brand. The review link will use the verified listing URL so Google handles the review flow.
