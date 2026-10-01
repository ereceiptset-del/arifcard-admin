# Admin app — UI inventory

Status: inventory taken 2026-10-01 from `develop` @ `a0bc3a4`, before the
fintech redesign. Every redesigned screen maps onto a row here. The customer app
has its own inventory in `addiscard-front` (`docs/UI_INVENTORY.md`).

Stack: React 19, react-router-dom 7, Vite 8, Tailwind 4.3.3, zod 4,
lucide-react, framer-motion 13. **No chart library** — the three charts are a
hand-built `BarChart` (`src/components/admin/Metric.jsx:60`). No Firebase SDK
in the browser; the backend admin router is mounted at `/api/admin` and every
route runs `requireAuth, requireStaff` (backend `routes/admin.routes.js:22`).

## 1. Routes (`src/routes/AppRoutes.jsx`)

| Path | Page | Guard / layout |
|---|---|---|
| `/login`, `/forgot-password`, `/reset-password` | LoginPage, ForgotPasswordPage | AuthLayout |
| `/` | OverviewPage | RequireStaff › UiThemeProvider › ToastProvider › AdminLayout |
| `/customers` | CustomersPage | same |
| `/kyc`, `/kyc/:caseId` | KycQueuePage, KycCasePage | same |
| `/payments` | PaymentsPage | same |
| `/transactions` | TransactionsPage (static empty state) | same |
| `/card-orders` | CardOrdersPage (static empty state) | same |
| `/cards` | CardsPage (`adminService.cards` is an `unavailable()` stub) | same |
| `/notifications` | NotificationsPage | same |
| `/audit` | AuditLogPage | same |
| `/settings` | SettingsPage | same |
| `/admin/*` | LegacyAdminPath (drops `/admin`, keeps query) | — |
| `*` | redirect to `/` | — |

RequireStaff: "Checking your access…" while loading; no user → `/login`;
non-staff → "Access denied" with Sign out and a link to the customer site.

## 2. Pages and backend truth

No list is paginated. The backend caps instead: KYC cases unbounded, payment
claims 300, audit 100, notification jobs 50, customers 50 (from
`listUsers(1000)`), one customer's payments 100 (UI shows 15). Every list page
handles loading (Skeleton), error (ErrorState + retry) and empty (EmptyState)
via `useAsync`. No realtime, no polling.

| Page | Data | Actions |
|---|---|---|
| Overview | `GET /admin/analytics?period&from&to&provider` (period `today\|7d\|30d\|custom`, provider `all\|CBE\|TELEBIRR`) | filters only |
| KYC queue | `GET /admin/kyc/cases?status&q` | open case |
| KYC case | `GET /admin/kyc/cases/:id`; `GET …/evidence/:slot` → `{url (GCS V4 signed read, 300 s), expiresInSeconds, contentType, size}` | Start review (`PENDING` only) → `POST …/claim`; Approve / Ask for changes / Reject → `POST …/decision {decision, reasonCode, customerReason, internalNote}` |
| Payments | `GET /admin/payments/claims?status`, `GET …/claims/:id` | Re-check → `POST …/recheck`; Record decision → `POST …/decision {action, reason, customerMessage, canonicalTransactionId}` |
| Customers | `GET /admin/customers?q&kycStatus`, `GET /admin/customers/:uid`; issuer onboarding, funding and card orders per customer | Check with issuer; card-order resolve; funding create/sync/resolve |
| Notifications | `GET /admin/notification-jobs` (backend also accepts `?status`) | Retry (failed only; confirms first when `ambiguous`) → `POST …/:id/retry {acknowledgeDuplicateRisk}` |
| Audit | `GET /admin/audit?action` | read-only |
| Settings | `GET /admin/settings`; `POST /admin/provider/connection-check` (admin role only) | Test connection |
| Transactions | none — "There is no ledger yet" | — |
| Card orders | none — no global list endpoint (only per customer) | — |
| Cards | none — stub | — |

### Status vocabularies (exact strings)

| Domain | Values |
|---|---|
| KYC case | `NOT_SUBMITTED`, `PENDING`, `UNDER_REVIEW`, `CHANGES_REQUESTED`, `APPROVED`, `REJECTED`; decidable: `PENDING`, `UNDER_REVIEW` |
| KYC decision | `approve` (`APPROVED`), `request_changes` (`DOCUMENT_UNREADABLE`, `DOCUMENT_INCOMPLETE`, `DETAILS_MISMATCH`, `OTHER`), `reject` (`DOCUMENT_EXPIRED`, `SUSPECTED_ALTERATION`, `DETAILS_MISMATCH`, `OTHER`); customer reason 10–1000 chars required for the last two; internal note ≤1000 |
| Payment claim | `VERIFYING`, `VERIFIED`, `REQUIRES_REVIEW`, `REJECTED_EVIDENCE`; staff actions `VERIFY`, `REJECT`, `REQUEST_CLARIFICATION` when `REQUIRES_REVIEW`/`VERIFYING` |
| Payment comparison | rows `{key,label,expected,claimed,provider,result}`, result `match\|mismatch\|unknown\|info`; keys `amount`, `currency`, `status`, `receiverAccount`, `receiverName`, `transactionId`, `transactionTime`, `orderReference`, `payerName`, `payerAccount`, payer id |
| Card order | `AWAITING_FUNDING`, `READY_TO_ISSUE`, `ISSUING`, `ISSUED`, `ISSUE_FAILED`, `REQUIRES_REVIEW`, `REFUND_REQUIRED`, `CANCELED`; resolve `RETRY\|REFUND_REQUIRED\|CANCEL` |
| Funding | `AWAITING_DEPOSIT`, `PROCESSING`, `PARTIALLY_FUNDED`, `CONFIRMED`, `DISCREPANCY`, `DEPOSIT_FAILED`, `CANCELED` |
| Issuer onboarding | `NOT_STARTED`, `STARTING`, `SESSION_OPEN`, `SUBMITTED`, `ACTION_REQUIRED`, `APPROVED`, `DENIED`, `LOCKED`, `EXPIRED`, `CANCELED`, `UNKNOWN_STATE` |
| Notification job | `pending`, `processing`, `sent`, `failed` (+ `ambiguous` flag) |
| Staff role | `owner`, `admin`, `reviewer` |

## 3. Overview metrics (`GET /admin/analytics`, backend `analytics.service.js:388-431`)

Each metric is `{available:true,value}` or `{available:false,reason}`; all
computed per request (Africa/Addis_Ababa window).

| Group | Fields | Shown today |
|---|---|---|
| customers | `total`, `active`, `newInPeriod`, `registrationsByDay`, `truncated` | `newInPeriod`, chart |
| kyc | `queue{pending,underReview,approved,rejected,changesRequested}`, `decidedInPeriod`, `approvedInPeriod`, `rejectedInPeriod`, `approvalRate`, `medianReviewMinutes`, `decisionsByDay`, `byDocument`, `oldestWaiting`, `truncated` | queue, decided, rate, median, chart |
| payments | `verifiedCount`, `verifiedMinor`, `verifiedBirr`, `byProvider{CBE,TELEBIRR}{count,minor}`, `needsReview`, `verifying`, `duplicateRejected`, `providerFailures`, `volumeByDay`; always unavailable: `principalMinor`, `feesMinor`, `refundsMinor` | most; chart |
| operations | `failedNotifications`, `pendingNotifications`, `recentActivity[8]` | failed, activity |
| cards | `{available:false, reason:"Card provider integration not available"}` | unavailable |

Returned but not shown: `customers.total`, `customers.active`,
`approvedInPeriod`, `rejectedInPeriod`, `byDocument`, `pendingNotifications`,
`verifiedBirr`, `byProvider.*.minor`. `GET /admin/overview` exists but is unused.

## 4. KYC review and payment review details

- KYC case detail fields: document type, `givenNames`, `surname`, `documentNumber`/`faydaNumber`, `dateOfBirth`, `placeOfBirth`, address (`addressLine, city, region, country`), `phone`, `occupation`, `employmentStatus`, `cardPurpose`, `annualIncome`, `monthlyIncome`, method (`MANUAL_FAYDA`, `MANUAL_PASSPORT`), `consentAcceptedAt`, version. Evidence slots `faydaFront`, `faydaBack`, `passportBiodata`, `selfie`; PDF opens in a new tab. `submissionHistory` returned but not rendered. Internal notes `[{id, body, authorName, createdAt}]`; `POST …/notes` exists without UI. Backend refuses self-review (403), decided cases (409). **No AI or OCR findings exist.**
- Payment claim detail: `expected{…}`, `claimed{…}` (masked phone/account), `provider` (stored receipt: transaction id, status `SUCCESS|PENDING|FAILED`, amount, currency, payer, receiver, time, reference, narrative, parser version), `comparison[]`, `allocation`, `relatedClaims[]`, `actions`, `needsTransactionId`, `decidedBy`, `staffReason`, `customerMessage`.

## 5. Endpoints with no UI today

`GET /admin/overview`, `GET /admin/staff`, `POST /admin/kyc/cases/:id/notes`,
`GET /admin/provider/operations` (+ reconcile, resolve), `GET /admin/provider/events`
(+ reprocess), `GET /admin/provider/customers` (list).

## 6. Components

- `src/components/admin`: `Metric` (available vs unavailable + reason), `BarChart` (divs), `IssuerCardOrders`, `IssuerFunding`.
- `src/components/auth`: LoginForm, ForgotPasswordForm, OtpInput, RequireStaff, AuthProductPanel; `cards/VirtualCard` (auth panel only); `ui/*` auth form controls and ThemeToggle.
- `packages/ui` (admin copy): AppShell, Button, Panel, Badge, Spinner, Skeleton, EmptyState, ErrorState, DemoNotice, Toast, Dialog, Table (`columns{key,header,render,align}`, `onRowClick`), form fields; unused here: SkeletonText, Checkbox, FileField, SearchableSelect, Stepper, Tabs, `lib/image.js`.
- AdminLayout: rail 240px with Overview, Customers, Identity verification, Payments, Transactions, Card orders, Cards, Notifications, Audit logs, Settings; brand "Arifcard Admin"; account block with Sign out; header with role badge and theme toggle; a "Staff only" DemoNotice strip on every page; content max 960px.

## 7. Data layer and contexts

- `adminService` (`packages/services/src/adminService.js`) — all endpoints above; unused: `overview`, `staff`, `addNote`; stubs: `cards`, `transactions`.
- Auth: `/auth/login`, `/auth/me`, `/auth/forgot-password`, `/auth/reset-password`.
- **Realtime listeners: none. Polling: none.** Data refreshes on mount, filter change, retry or after a mutation.
- Contexts: AuthContext, site ThemeContext and `packages/ui` ThemeProvider (both on `localStorage["addiscard-theme"]`), ToastProvider.

## 8. Placeholder content in runtime code

| Where | What |
|---|---|
| `VirtualCard.jsx:14-16` | default `last4="4921"`, "CARD HOLDER", "VIRTUAL USD CARD" on the login panel |
| `CardsPage` | table definition (`balanceUsd`, …) that can never receive rows |
| AdminLayout, CardsPage | DemoNotice strips |
| `IssuerFunding.jsx:252` | "This is the sandbox: send nothing real." (hard-coded regardless of environment) |
| `KycCasePage.jsx:81`, `AppRoutes`, `ThemeToggle`, `AuthProductPanel` | raw hex colours |
