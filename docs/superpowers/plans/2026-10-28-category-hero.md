# Food category hero implementation plan

> Execute inline with superpowers:executing-plans. Existing direct implementation and publication authorization applies.

**Goal:** Expand the homepage into twelve photo-based motion clips, grouped into Breakfast, Lunch, Platters, Drinks, Coffee and Desserts.

**Architecture:** Keep the current full-viewport hero and muted 60fps subpixel camera movement. A shared JSON manifest drives category navigation, clip generation and slide content. Two visually verified photos per group; small glass category buttons jump to the group's first clip. Previous/next wrap over the whole collection. Only current, upcoming and outgoing videos are mounted, limiting network and decoder work. Reduced motion and data-saving mode retain category navigation with still photos.

**Constraints:** No audio, video playback controls or narration. Keep concise text, existing brand styling and ORDER NOW. Preserve one homepage H1, responsive bounds, ordering and SEO. Retain existing checkout/branch to preserve authorized deployment state. Use the supplied Drive photographs; inspect the new folder before choosing assets. Encode photo motion locally; no generative alteration of the food.

- [x] Check folder access and visually match source photos; add shared category manifest and verify wraparound/category selection against a failing test.
- [x] Generate twelve optimized 60fps muted MP4 clips using fractional camera sampling and verify streams and file sizes.
- [x] Integrate category buttons and dynamic clip navigation, bounded video loading and responsive glass styling.
- [x] Run relevant motion/app tests, typecheck/build and browser checks of cycling, categories, reduced motion and mobile layouts.
- [ ] Obtain a final independent review, publish GitHub and verify live clips/navigation.

Ruling: User already opted out of design gates and authorized immediate implementation/publication. Six groups and two clips each are implementation choices derived from the requested breakfast/lunch/platters/drinks grouping and visually verified available photos.

Progress: Four supplied folders are accessible; the first returns 404. The new juice folder supplied IMG_2293.jpg and IMG_2235.jpg, added as rcc-086/rcc-087 with provenance. Twelve 1440x900, 60fps, eight-second silent faststart clips validated (39 MB total). Reused the existing identical table/coffee encodes for those two source photographs. 34 tests, motion tests, typecheck and production build pass. Review fixed mobile populated-cart clearance and atomic encoding output. Browser testing then found rapid switches could retain multiple outgoing videos; explicit previous-slide tracking now bounds mounted videos to three and was independently reviewed. Final browser regression passed on five viewport sizes, including actual populated-cart spacing, reduced-motion stills, all twelve silent inline video sources, and rapid switching with at most three mounted videos. Publication follows.
