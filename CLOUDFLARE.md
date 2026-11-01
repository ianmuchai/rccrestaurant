# Publish RCC to your own Cloudflare account

Repository: https://github.com/ianmuchai/rccrestaurant

## One-time dashboard setup

1. The **rcc-db** database is already created and its non-secret ID is saved in `cloudflare.project.json`. No source edits or database build variables are needed for this account.
2. The **rcc-restaurant** Worker is already deployed at https://rcc-restaurant.rcc-kitengela.workers.dev. GitHub is connected to this Worker for automatic updates from `main`. Review its configuration in **Workers & Pages > rcc-restaurant > Settings > Builds**.
3. Use these settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Root directory | Repository root (leave blank) |
| Build command | `npm run build` |
| Deploy command | `npm run deploy` |
| Build variable `NODE_VERSION` | `24` |
| Build variable `RCC_D1_DATABASE_ID` | Optional override when moving to another database |
| Build variable `RCC_D1_DATABASE_NAME` | `rcc-db` (default; optional) |

The deployment command applies outstanding D1 migrations before publishing. It refuses to publish with the local placeholder database or after a migration failure. If the build token lacks D1 access, grant **D1 Edit** for the account in the Workers Builds token settings. Keep API tokens in Cloudflare's secret/build-token settings, never in GitHub source.

4. Deploy and open the returned `workers.dev` address. Check `/`, `/menu`, `/moments`, `/visit`, and `/api/catalog`.
5. **rcc.co.ke** and **www.rcc.co.ke** are attached as Worker Custom Domains. Registrar delegation and HTTPS activation are complete; the official website is live. Public www requests redirect to the apex, and the workers.dev preview sends noindex. See `DNS_STATUS.md` and `docs/SEO.md` for verification details.

This repository does not automatically transfer domain registration, change nameservers, subscribe to paid plans, or turn on real payments. Set any custom build preview deployment command to `npx wrangler versions upload --config dist/server/wrangler.json`; do not apply production migrations from untrusted pull requests. Use a separate database/Worker for staging.

## Secure staff login

The staff portal uses an application-level username and password. Configure these three values as **Worker secrets** in Cloudflare (Worker & Pages → `rcc-restaurant` → Settings → Variables and Secrets):

| Runtime setting | Value |
| --- | --- |
| `STAFF_USERNAME` | A private staff username (3–128 characters) |
| `STAFF_PASSWORD` | A strong password of at least 12 characters |
| `STAFF_SESSION_SECRET` | A randomly generated secret of at least 32 characters |

For CLI setup, run `npx wrangler secret put STAFF_USERNAME`, then repeat for `STAFF_PASSWORD` and `STAFF_SESSION_SECRET`; enter each value at Wrangler's prompt. Generate the session secret with Node.js using `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`. Do not put real credentials in GitHub, source files, or chat.

If an existing Cloudflare Access application protects `/admin` or `/api/staff/*`, remove those paths from that application so the username/password form and its session cookie can reach the Worker. Staff API requests still require a signed, HttpOnly, Secure, SameSite session cookie. Login attempts are rate-limited; sessions expire after eight hours and password rotation invalidates active sessions.

Once authenticated, use `/admin` to configure the restaurant pin, hours, contact details, pickup/delivery, delivery zones/fees, and resolve menu prices awaiting review. Both fulfillment modes start disabled.

## M-Pesa runtime secrets

Add the fields from `.env.example` in **Worker > Settings > Variables and Secrets**. Secret values stay in Cloudflare and survive subsequent deployments.

- `MPESA_ENV`: start with `sandbox`; use `production` only with approved live credentials.
- `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`: from your approved Daraja app.
- `MPESA_TRANSACTION_TYPE`: the merchant's supported `CustomerPayBillOnline` or `CustomerBuyGoodsOnline` type.
- `MPESA_CALLBACK_SECRET`: a cryptographically random secret of at least 32 characters.
- `PUBLIC_SITE_URL`: the final HTTPS origin, e.g. `https://rcc.co.ke`.

The app constructs the callback URL. Test STK initiation, real callback delivery, reconciliation, cancellation, timeout and staff fulfillment before accepting customer orders. Missing configuration keeps payments disabled. Do not put secrets into `RCC_D1_DATABASE_ID` or commit credentials to GitHub.

## Updates

Push approved changes to `main`. Workers Builds builds the app, applies only pending migrations, then deploys it. Existing restaurant settings, orders and credentials are preserved. A failed migration stops the deployment.

For a local terminal deployment after `wrangler login`:

```powershell
$env:RCC_D1_DATABASE_ID = "YOUR-DATABASE-ID"
npm.cmd run build
npm.cmd run deploy
```

To validate the upload bundle without changing the remote database or publishing:

```powershell
npm.cmd run deploy -- --dry-run
```

The project uses the database ID in `cloudflare.project.json` by default. The guarded deploy command refuses placeholder IDs. A local preview still uses local D1 storage, never the live database, unless explicitly run with remote development enabled.

Official references: [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/), [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/), [Custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/), [Access JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/).
