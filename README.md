# Arifcard Admin

The staff console for Arifcard, served at **https://arifcard-admin-1a9bc.web.app**
(Firebase Hosting site `arifcard-admin-1a9bc`, target `admin`, project
`addiscard-1a9bc`). It is separate from the customer site
(`addiscard-front`, https://addiscard-1a9bc.web.app) and shares one backend
(`addiscard-back`, Cloud Function `api`).

A separate site is **not** the security boundary. Every `/api/admin/*`
request is authorised by the backend: a valid session → the Firebase
account enabled + staff claim + an active `staff/{uid}` record → the role
the action needs. This app only decides what to show.

## Screens

Overview, Customers (with card-issuer onboarding, card orders and funding),
Identity verification (queue and case review with private evidence
previews), Payments, Card orders, Cards, Transactions, Notifications, Audit
logs, Settings. Sign-in, forgot and reset password. There is no sign-up:
staff are provisioned on the server (`backend/scripts/provision-owner.mjs`,
`grant-staff.mjs`).

Old links from the combined site (`/admin/...`) redirect to the same page
here (`/...`).

## Develop

```bash
npm ci
cp .env.example .env       # local API at http://localhost:4000/api
npm run dev                # http://localhost:5174 (needs the backend running)
```

## Test and build

```bash
npm run lint
npm test                   # builds, then checks the bundle and hosting config
```

`npm test` fails if the build contains customer/marketing/sign-up screens,
an inline script (forbidden by the CSP), a localhost API address, or if
`firebase.json` could deploy anything but the admin hosting target.

## Deploy (only with the owner's approval)

```bash
npm run deploy             # build → bundle check → firebase deploy --only hosting:admin
```

`.firebaserc` maps target `admin` to site `arifcard-admin-1a9bc` only.
`firebase.json` contains hosting only — no Functions, no rules: those are
deployed from the backend repository. `/api/**` is rewritten to the shared
function before the SPA fallback, so API calls are same-origin.

Security headers (in `firebase.json`): a strict Content-Security-Policy
(scripts from this site only; styles/fonts from Google Fonts; images from
this site and signed Cloud Storage URLs; no frames), `X-Frame-Options:
DENY`, `Referrer-Policy: no-referrer` (evidence URLs never leak the page),
`noindex`. Pages revalidate on every visit; hashed assets cache for a year.

## Sessions

Sign-in returns a backend session token kept in this site's own
`localStorage` — never shared with the customer site (different origin),
never put in a URL. Signing out removes it and unmounts every screen, so
no admin data stays in memory.

## Shared code

`packages/ui` and `packages/services` are this repository's own copies —
see [docs/shared-code.md](docs/shared-code.md).
