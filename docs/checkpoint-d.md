# Redesign Checkpoint D — final quality

Applies to both apps (`addiscard-front` and `arifcard-admin`; the same file
is in both repositories). Status vocabulary: PLANNED · IMPLEMENTED ·
VERIFIED · BLOCKED · DEFERRED.

Long runs (production builds, browser sweeps, screenshots) are run by the
owner on their own dev server; this PC's load made them unreliable from the
working session. Static and unit checks below were run here.

## Results

| Item | Status | Evidence |
|---|---|---|
| Obsolete UI code removed | VERIFIED | Import-graph check from each app's entry points (plus the visual harnesses): every import resolves; files reachable from nothing were removed — customer: `about/Pillars`, `cards/VirtualCard` (old), `landing/FAQ`, `landing/FAQAccordion`, `landing/Security`, `ServiceHoldNotice`, `ui/Button`, `ui/FormField`, `ui/Input`, `ui/PasswordInput`; admin: `cards/VirtualCard` (old), `ui/Button`, `ui/FormField`, `ui/Input`, `ui/PasswordInput`. Earlier in C: admin `Metric`, `CardsPage`, `CardOrdersPage` (replaced). |
| Request ("listener") audit | VERIFIED | `tests/requestAudit.test.mjs` (customer): one request per resource however many screens use it; refresh forces exactly one; sign-out clears everything and a late response can't repopulate; keys scoped by user; no `setInterval`, `onSnapshot`, WebSocket or EventSource in the data path; the only global listeners are focus and visibility. There are no realtime listeners in either app (design-plan §9). The admin app loads per screen through `useAsync` with no polling. |
| Security regression | VERIFIED | `tests/security.test.mjs` (both): CSP still `default-src 'self'`, `script-src 'self'`, `object-src 'none'`, no inline styles or scripts allowed; `X-Frame-Options: DENY`; `nosniff`; the font stylesheet host is allowed by `style-src`; no `dangerouslySetInnerHTML`, `innerHTML =`, `eval` or `new Function`; browser storage holds only the session token, theme and sidebar preference; the card component has no full-number, CVC or PIN prop; customer: the issuer iframe keeps its origin, source and no-referrer checks; admin: every admin screen is inside `RequireStaff`, card-issuer calls go only to `/admin/provider/*`; test tooling never enters the production build. `firebase.json` is byte-for-byte unchanged since before the redesign in both repos. |
| Theme consistency | VERIFIED (app) / DEFERRED (marketing) | Sign-in, register, email code, password reset, staff notices and access screens moved to design tokens in both apps (hard-coded colours and `dark:` twins gone; inputs follow the theme; buttons use `on-accent`, which keeps contrast in dark mode; controls 44 px). They are now covered by `tests/designRules.test.mjs`. Exceptions by design: the fixed dark brand panel on sign-in screens, the card artwork. Marketing pages are unchanged (owner decision pending), so the old token aliases stay until they are redesigned. |
| State coverage | VERIFIED (by construction) | Every redesigned screen has loading (skeleton or `aria-busy`), empty (`EmptyState`), error (`ErrorState`, offline for network errors) and success states; checked per screen in Checkpoints A–C with the harness scenarios. |
| Unit and rule tests | VERIFIED | Customer 38/38 earlier plus `requestAudit` 6/6, `security` 7/7, design rules (now incl. sign-in) — see the run table below. Admin: design rules + security 15/15. Lint: 0 errors in both. |
| Production builds, bundle sizes | Owner to run | `npm test` in each app (builds, runs the bundle check and all tests). |
| Accessibility and layout sweeps | Owner to run | Customer `/tests/visual/sweep.html` (32 states × 4 widths × 2 themes); admin `/tests/visual/sweep.html` (11 screens incl. the refused customer). Earlier full customer dashboard run: 112 cases, 0 violations. |
| Analytics parity, authorization | Owner to run | Admin `/tests/visual/admin.html`, then `__parity()` (expect 21/21); `?role=customer` must show "Access denied". |
| Lighthouse performance | BLOCKED (environment) | Varies 26–70 for the same build on this PC; layout shift and render-blocking fixed. Needs a quiet machine or a preview channel (owner approval). |

## Final walkthrough (owner, ~20 minutes)

From each app folder: `npm test`, then `npm run dev`, then open:

- Customer, http://localhost:5173:
  `/tests/visual/dashboard.html?scenario=card-active`, the same with
  `&path=/customer/verification`, `/customer/wallet`, `/customer/cards`,
  `/customer/transactions`, `/customer/notifications`,
  `/customer/settings`, `/customer/support`; then `/login` and `/register`
  in both themes (theme toggle on the sign-in screen).
- Admin, http://localhost:5174: `/tests/visual/admin.html` and
  `&path=` `/customers`, `/kyc`, `/kyc/visual-case-1`, `/payments`, `/cards`,
  `/notifications`, `/audit`, `/settings`; `?role=customer`; `/login`.
- Each app's `/tests/visual/sweep.html` for the numbers.

## Not changed, by design

Backend, services, auth context, hosting configuration and security rules
are untouched across all four checkpoints. Nothing was deployed.

## Release (2026-10-01)

Deployed by the owner from `develop` after the gate passed (customer
`npm test` 38/38; admin 17/17 once its bundle markers followed the renamed
"KYC verification" section, `12d12c2`). Live entry files match the local
builds: customer `index-DMYbpr98.js`, admin `index-Bq530pyf.js`.

Read-only live checks after propagation, all passing:

| Check | Result |
|---|---|
| Redesign: new screens in the shipped JS, Geist loaded without blocking, no dev page, harness or synthetic data published | 29/29 |
| Customer: headers (CSP report-only, X-Frame-Options, nosniff, Permissions-Policy), deep links, staff notices, `/api` reachable, admin API refuses without a session | 21/21 |
| Admin: enforced CSP, no-referrer, noindex, immutable assets, deep links, `/api` JSON, 401 without a session or with a forged token | 19/19 |

First-load JS (raw entry): customer 259.4 KB, admin 258.0 KB (customer was
276.4 KB before the redesign). Backend, security rules and hosting
configuration were not part of this release.
