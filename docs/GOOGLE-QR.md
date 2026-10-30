# RCC Google profile QR

Print-ready A5 portrait PDFs with vector QR modules, embedded fonts, four-module quiet zones and error correction Q. The code is dark RCC burgundy on white; the logo sits above the code and does not obscure it.

- `public/downloads/RCC-Google-Profile-QR.pdf` encodes `https://rcc.co.ke/google`.
- `public/downloads/RCC-Google-Profile-QR-Direct.pdf` encodes `https://www.google.com/maps?cid=5135303326429331150` directly.
- Matching QR-only PNGs are available beside the PDFs.

These are static QR codes with no subscription, QR-vendor account, tracking service, scan limit or encoded expiry. The domain version requires continued ownership and working hosting for rcc.co.ke. The direct backup does not depend on that domain, but its Google profile destination must continue to exist.

`app/google/route.ts` redirects GET and HEAD requests directly to `business.maps`, with no cached destination or interstitial page. Update that verified address in `lib/business.ts` if RCC's listing changes; the domain QR can remain unchanged.

Regenerate locally with Python:

```powershell
python -m pip install --target work/qr-tools pymupdf qrcode pillow zxing-cpp
python scripts/create-profile-qr.py
```

The script independently decodes each rendered PDF at 100, 200 and 300 dpi and checks its clickable destination. Preserve the white margin when placing the QR in other artwork. Print the PDF at A5 or larger for table/wall display.

The Google listing was checked on 30 October 2026 and matched RCC Restaurant and its confirmed phone number.
