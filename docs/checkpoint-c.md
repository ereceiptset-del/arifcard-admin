# Redesign Checkpoint C — admin application

Scope: the staff console, in the order of the brief: Overview → Customers →
KYC review → Payments → Transactions / Card operations → Notifications →
Audit → Settings. Status vocabulary: PLANNED · IMPLEMENTED · VERIFIED ·
BLOCKED · DEFERRED.

## Screens

| Screen | Status | What changed | Backend truth / limits |
|---|---|---|---|
| Shell | IMPLEMENTED | Design system ported (packages/ui was an identical copy of the customer original; replaced wholesale). Wide fluid layout, persistent collapsible rail, global customer search, issuer environment chip from `GET /admin/settings`, role chip; the brief's nine sections. | The environment is read from the settings `detail` text ("sandbox · host"); unknown formats show "Issuer: Codego". |
| Overview | IMPLEMENTED | Needs attention first; joined strip of key figures; labelled metric lists (identity queue now, decisions this period, verified payments, receipts needing a person, money, cards); three SVG charts; provider split; recent activity. Also shows fields the API returned but the old page hid (total customers, approved/rejected in period, birr per provider, queued emails). | Unavailable metrics show "Unavailable" with the backend's reason, never 0 (principal, fees, refunds, cards). |
| Customers | IMPLEMENTED | Search and KYC filter in the URL; masked emails in the list; detail drawer with tabs: overview, KYC history, payments, card issuer, cards and funding. | No per-customer transactions, notifications or audit in the backend — those tabs aren't offered. |
| KYC queue | IMPLEMENTED | URL filters, submit-to-search, waiting age, keyboard-openable rows. | Whole list, no cursor. |
| KYC review | IMPLEMENTED | Three panes from 1280 px: documents (tabs, zoom, rotate, side by side, reload expired link); submitted details; inline decision (approve / ask for changes / reject, reason code, required customer message for the last two, separate internal note, confirm step) and a timeline from recorded events. Adds a form for the existing internal-notes endpoint. | No automated findings exist, so none are shown. "Review started" time isn't returned, so it's not in the timeline. |
| Payments | IMPLEMENTED | Queue with mismatch-marked amounts; review drawer: field-by-field checks (expected / customer claim / provider receipt) with mismatch rows tinted and labelled, three source panels, related claims, parser diagnostic, re-check and the protected decision. | No "set verified" control; only the existing decision endpoint (enforced by a design-rules test). |
| Card operations (replaces Cards and Card orders) | IMPLEMENTED | Issuer operations (status filters, history, ask the issuer, resolve with an audited reason) and issuer events (field names only, reprocess). Card orders per customer show four separate pills: payment verified, issuer funded, card issued, card active. | Existing endpoints that had no UI; called from `src/data/providerOps.js` (packages/services untouched). No global card-order list, card balances or card transactions exist. |
| Transactions | IMPLEMENTED | Restyled; still states plainly that there is no ledger and links to Payments and Card operations. | No ledger (BLOCKED until one exists). |
| Notifications | IMPLEMENTED | Delivery filters, readable email types, retry with a confirm dialog when a duplicate is possible. | Last 50 jobs; no recipient or body stored by design. |
| Audit | IMPLEMENTED | Every action the backend writes as a filter; detail drawer with the recorded fields (old/new state where recorded). | No request ID is recorded on entries. |
| Settings | IMPLEMENTED | Restyled; status never values; connection test (administrators only). | Nothing editable, by design. |

## Verification

Run on the owner's dev server (the PC is too loaded for long runs from this
session). Commands, from `admin-frontend/`:

```
npm test
npm run dev
```

Then:

- **Analytics parity:** open `/tests/visual/admin.html`, wait for the
  Overview, and run `__parity()` in the browser console. It checks the 21
  figures the previous Overview showed against the same synthetic analytics
  response; expected result `{ passed: 21, total: 21, failures: [] }`.
- **Authorization regression:** `/tests/visual/admin.html?role=customer`
  must show "Access denied" (RequireStaff, unchanged). Every admin route on
  the backend still runs `requireAuth, requireStaff` (backend unchanged;
  `backend/tests/adminAccess.test.mjs`).
- **Accessibility and layout:** `/tests/visual/sweep.html` (axe-core from
  cdnjs, all admin screens plus the customer-refused case, four widths, both
  themes).

| Gate | Result | Status |
|---|---|---|
| Design-rules test (no hex, no `dark:`, no arbitrary radius/shadow, no caps or monospace labels, nothing under 12 px, no button inside a link, no client-set payment status) | 7/7 | VERIFIED |
| Lint | 0 errors | VERIFIED |
| Production build, bundle sizes | not run in this session | Pending (owner) |
| Analytics parity, authorization, sweep, screenshots | tooling in place | Pending (owner) |

## Frozen zones

No changes under `packages/services`, `src/services`,
`src/context/AuthContext.jsx`, `src/components/auth/RequireStaff.jsx` or the
backend. New admin-side calls are in `src/data/providerOps.js` and go
through the existing API client to existing, staff-protected endpoints.
