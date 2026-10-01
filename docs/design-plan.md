# Arifcard design plan (redesign v2)

Status: **PLANNED** — Checkpoint A, step 2. Written before any component code.
Owner: frontend. The same file lives in both frontend repositories
(`addiscard-front`, `arifcard-admin`), like `packages/ui` (see `shared-code.md`).
Inventories: `docs/UI_INVENTORY.md` in each repository.

Reference design: no file, link, screenshot or mention of a design called
"Cracker" exists in `frontend`, `admin-frontend` or `backend` (searched by name
and content, excluding `node_modules`). This plan therefore works from the
principles in the brief only.

---

## 0. What the backend can and cannot show (constraints that shape the design)

The redesign renders backend truth. The inventory found these gaps against the brief:

| Brief asks for | Backend truth | Design response |
|---|---|---|
| Available balance with freshness | No balance or funds endpoint exists | MoneyValue renders **"Unavailable"** with a one-line reason and the time we last checked. No figure is ever invented. |
| Top up, Freeze/Unfreeze, View details | Not implemented (no endpoints; `customerService.toggleFreeze` is a stub; no secure reveal) | Rendered **disabled with a reason**; listed as BLOCKED. "Add money" (payment intents) exists and is the live primary action. |
| Cardholder name, network on the card | `cardView` has `last4`, `expiry`, `type`, `status`, `ready`, `limitUsd` only | Name comes from the signed-in account (`user.fullName`), labelled as the account holder. Network shown only if `card.type` carries one; otherwise omitted. |
| Transactions ledger | None (admin: "There is no ledger yet") | Recent activity = real payment intents and card orders. A Transactions screen is Checkpoint B and will be built on those two sources only. |
| Realtime Firestore listeners (§9) | **No Firestore SDK in the browser; no listeners exist anywhere.** Rules are written deny-all. | See §9 below: no listener registry is built, because adding one needs relaxed rules (forbidden) or a backend change. Freshness is shown honestly as "Checked N min ago" with refresh on focus and on demand. |
| Payment verification step lines | Backend returns one `reasonCode`; no per-check results | A single "Verifying your payment" state. No invented step list. |
| AI-assisted KYC findings | None exist | No findings panel. |
| Charts from the existing library | No chart library installed (admin uses hand-built bars) | Hand-built SVG chart components inside the design system. No dependency. |
| Receipt upload / SMS paste on payments | Not in the claim API | Not shown. |

---

## 1. Palette

Tokens are CSS variables switched by the `.dark` class; Tailwind reads them through
`@theme inline`. Light is designed separately, not inverted from dark.

### 1.1 Dark — cool charcoal with a faint violet undertone

| Token | Hex | Use |
|---|---|---|
| surface-0 | `#0C0C11` | page canvas |
| surface-1 | `#15151C` | panels |
| surface-2 | `#1D1D26` | inset rows, hover, inputs |
| surface-3 | `#262631` | popovers, dialogs |
| line | `#2C2C38` | panel borders (decorative) |
| line-strong | `#6E6E80` | input and control borders |
| ink / ink-soft / ink-muted | `#F3F3F7` / `#C6C6D0` / `#9A9AA8` | text |

### 1.2 Light — cool neutral

| Token | Hex | Use |
|---|---|---|
| surface-0 | `#F5F5F8` | page canvas |
| surface-1 | `#FFFFFF` | panels |
| surface-2 | `#EEEEF3` | inset rows, hover |
| surface-3 | `#E5E5EC` | pressed, selected rows |
| line | `#E2E2EA` | panel borders (decorative) |
| line-strong | `#8A8A98` | input and control borders |
| ink / ink-soft / ink-muted | `#121218` / `#45454F` / `#62626E` | text |

### 1.3 Accents

Primary — violet, built around the existing brand `#8055FF` (kept as 500 so the
identity is continuous):

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|
| `#F4F0FF` | `#EAE2FF` | `#D6C7FF` | `#BAA1FF` | `#9C7BFF` | `#8055FF` | `#6B3EF0` | `#5A2FD2` | `#4A27A8` | `#3C2283` |

- Light theme accent = 600 `#6B3EF0` (white text on it 5.88:1). Dark theme accent = 400 `#9C7BFF` with `#0C0C11` text (6.22:1).
- Secondary — blue, links and informational only: light `#1E63C8`, dark `#6FAAFF`.

### 1.4 Semantic (always icon + text + colour)

| State | Light text / tint | Dark text / tint | Icon (lucide) |
|---|---|---|---|
| success / verified | `#0B7A4B` / `#E6F5EC` | `#4CD69A` / `#10261C` | `CircleCheck` |
| warning / review | `#8F5300` / `#FFF3DC` | `#F2B54A` / `#2A2111` | `Clock` (review) or `TriangleAlert` (needs action) |
| danger / rejected | `#C0282B` / `#FDECEC` | `#FF7B7B` / `#2C1416` | `CircleX` |
| neutral / pending, inactive | `#5A5A66` / `#EEEEF3` | `#A6A6B3` / `#1D1D26` | `CircleDashed` |

Hue count on any screen: neutrals + violet + at most two semantic hues in practice; blue only for links. Six is the hard ceiling.

### 1.5 Contrast (WCAG 2.x, computed — 0 failures)

| Pair | Light | Dark | Needs |
|---|---|---|---|
| ink on surface-0 / surface-1 / surface-3 | 17.15 / 18.66 / 14.88 | 17.63 / 16.41 / 13.51 | 4.5 |
| ink-soft on surface-1 / surface-2 | 9.47 / 8.19 | 10.72 / 9.86 | 4.5 |
| ink-muted on surface-0 / surface-1 / surface-2 | 5.53 / 6.01 / 5.20 | 7.03 / 6.54 / 6.02 | 4.5 |
| text on accent | 5.88 | 6.22 | 4.5 |
| accent text on surface-1 / surface-0 | 5.88 / 5.40 | 5.79 / 6.22 | 4.5 |
| link on surface-1 / surface-0 | 5.72 / 5.25 | 7.67 / 8.24 | 4.5 |
| success on tint / surface-1 | 4.78 / 5.39 | 8.66 / 9.86 | 4.5 |
| warning on tint / surface-1 | 5.61 / 6.17 | 8.67 / 9.93 | 4.5 |
| danger on tint / surface-1 | 5.14 / 5.87 | 6.87 / 7.24 | 4.5 |
| neutral on tint / surface-1 | 5.88 / 6.80 | 6.95 / 7.55 | 4.5 |
| line-strong (control boundary) on surface-1 / surface-0 | 3.40 / 3.13 | 3.64 / 3.91 | 3.0 |
| focus ring (accent) on surface-1 | 5.88 | 5.79 | 3.0 |
| line (panel border) on surface-1 | 1.29 | 1.32 | decorative, exempt (WCAG 1.4.11 applies to controls, which use line-strong) |

Card artwork text is checked separately in Checkpoint A against the darkest and
lightest pixels of the artwork behind it.

---

## 2. Typography

Candidates (both free, OFL, served by Google Fonts which both CSPs already allow,
so **no npm dependency**; both have true tabular figures):

| | Geist | Inter (current) |
|---|---|---|
| Character | Precise, slightly condensed, Swiss; numerals are narrow and calm at large sizes | Neutral workhorse; the default face of most SaaS products |
| Money at 40 px | Compact, so balances and totals stay on one line at 360 px | Wider figures; long ETB totals wrap sooner |
| Distinctiveness | Less common in banking UIs | Recognisably "generic dashboard" |
| Risk | Newer; must verify `tnum` and weights in the browser | None |

**Pick: Geist** (400/500/600/700), with `font-variant-numeric: tabular-nums` on
every MoneyValue and numeric table column. Ethiopic names fall back to the
system face (`Noto Sans Ethiopic`, `Nyala`) — listed in the stack, never
downloaded. Verification in Checkpoint A: render "1111.11" and "0000.00" and
assert equal widths; if Geist fails, fall back to Inter and record it.

Scale (customer; admin uses the same scale one step denser for body):

| Role | Size / line | Weight | Tracking | Use |
|---|---|---|---|---|
| money-hero | 40 / 44 (32 / 36 under 640 px) | 600 | -0.02em | balance and totals — always the largest text on its screen |
| h1 | 26 / 32 | 600 | -0.015em | page title |
| h2 | 19 / 26 | 600 | -0.01em | panel title |
| h3 | 16 / 22 | 600 | 0 | sub-section, card titles |
| body | 15 / 24 (admin 14 / 20) | 400 | 0 | text |
| small | 13 / 18 | 500 | 0 | labels, table text, helper |
| caption | 12 / 16 | 500 | 0.005em | timestamps; smallest permitted size |

Rules: sentence case everywhere; no all-caps eyebrows; no coloured or italic
single words in headlines; body measure ≤ 72ch.

---

## 3. Layout, shape, elevation

- **Spacing**: 4, 8, 12, 16, 24, 32, 48, 64. Panels pad 24 (16 under 640 px); sections separate by 32; related controls by 8–12.
- **Radius encodes hierarchy**: page panels 20; the card artwork 20 (its own frame); inner controls (buttons, inputs, selects, table rows on hover) 10; chips and pills full; small tags 6. Nothing nested uses a larger radius than its parent.
- **Borders**: 1 px `line` on panels; `line-strong` on controls.
- **Elevation** (three levels, documented and nothing else): `e1` dropdowns/tooltips; `e2` dialogs/drawers; `e3` the card artwork only. Panels are flat with a border — no default shadow.
- **Gradients**: only on the card artwork. No hero wash anywhere else.
- **Alignment**: content left-aligned; numerals right-aligned in tables; amounts in lists right-aligned on their own column.
- **Content widths**: customer main column max 1120 px; admin fluid up to 1600 px.
- **Z-index**: base 0, sticky header 10, side nav 20, drawer 40, dialog 50, toast 60, tooltip 70.
- **Breakpoints**: Tailwind defaults (640, 768, 1024, 1280, 1536). Verification widths 360, 768, 1440, 1920.

### 3.1 Customer dashboard — desktop (1440)

```
┌──────────────┬────────────────────────────────────────────────────────────────┐
│ ◆ Arifcard   │ Good afternoon, Abebe        (✓ Identity verified)  (🔔 2) (AK) │
│              ├────────────────────────────────────────────────────────────────┤
│ ▣ Home       │ ┌───────────────────────────────┐  Available balance            │
│ ▢ Payments   │ │                               │  Unavailable                  │
│ ▢ Cards      │ │     [ VIRTUAL CARD ARTWORK ]  │  Your card issuer does not    │
│ ▢ Verify     │ │                               │  report a balance yet.        │
│ ▢ Settings   │ │  •••• 4821            09/28   │  Checked 2 min ago  [Refresh] │
│              │ │  Abebe Kebede       ✓ Active  │                               │
│              │ └───────────────────────────────┘  [Add money]  [Payments]      │
│              │ [Top up card] [Freeze card] [Card details]   (disabled, small)│
│              │ "Top-ups, freezing and card details aren't available yet."    │
│              │                                                                │
│              │ Needs attention                       (shown only when real)   │
│              │ ┌────────────────────────────────────────────────────────────┐ │
│              │ │ ⚠ Payment needs review    CBE    ETB 5,500    [View]       │ │
│              │ └────────────────────────────────────────────────────────────┘ │
│              │ Recent activity                      │ Status                  │
│              │ ┌──────────────────────────────────┐ │ Identity    ✓ Verified  │
│              │ │ ▤ CBE payment     ETB 5,500  ✓   │ │ Payment     ✓ Verified  │
│              │ │ ▤ Card order      Issuing    ◷   │ │ Card        ◷ Issuing   │
│ (AK) Abebe   │ │ ▤ Telebirr pay.   ETB 1,200  ✕   │ │ Notices     2 unread    │
│ Sign out     │ └──────────────────────────────────┘ │                         │
└──────────────┴────────────────────────────────────────────────────────────────┘
```

### 3.2 Customer dashboard — mobile (360)

```
┌────────────────────────────────┐
│ ◆ Arifcard          (🔔 2) (AK)│
├────────────────────────────────┤
│ Good afternoon, Abebe          │
│ (✓ Identity verified)          │
│ ┌────────────────────────────┐ │
│ │  [ VIRTUAL CARD ARTWORK ]  │ │
│ │  •••• 4821         09/28   │ │
│ └────────────────────────────┘ │
│ Available balance              │
│ Unavailable                    │
│ Checked 2 min ago   [Refresh]  │
│ ┌─────────────┐┌─────────────┐ │
│ │ Add money   ││ Payments    │ │  ← 48 px targets, thumb zone
│ └─────────────┘└─────────────┘ │
│ Needs attention …              │
│ Recent activity …              │
├────────────────────────────────┤
│ Home  Payments  Cards  Verify ≡│  ← bottom nav, 5 items; ≡ opens drawer
└────────────────────────────────┘
```

### 3.3 No-card state (replaces the card artwork, same footprint)

```
┌───────────────────────────────┐
│ Get your virtual card         │
│ ① Identity verification  ✓    │
│ ② Card issuer check      ◷    │  ← the first unmet step is highlighted
│ ③ Payment                ○    │
│ ④ Card issued            ○    │
│ Card issuer verification in   │
│ progress.          [Continue] │
└───────────────────────────────┘
```

### 3.4 Admin overview (1440)

```
┌──────────────┬────────────────────────────────────────────────────────────────────┐
│ Arifcard     │ [ Search customers, cases… ]  (Environment: Sandbox) (Issuer: Codego) (RS)│
│ Admin        ├────────────────────────────────────────────────────────────────────┤
│ Overview     │ Overview                     [Today][7 days][30 days][Custom] [All]│
│ Customers    │ Needs attention                                                    │
│ KYC          │  ● 4 KYC cases waiting (oldest 2 h)   ● 1 payment needs a person   │
│ Payments     │  ● 2 notifications failed                                          │
│ Transactions │ ┌───────────┬───────────┬───────────┬───────────┐                  │
│ Card ops     │ │ Customers │ KYC queue │ Verified  │ Volume ETB│  primary row     │
│ Notifications│ │ 1,204     │ 4 waiting │ 37        │ 182,400   │                  │
│ Audit        │ └───────────┴───────────┴───────────┴───────────┘                  │
│ Settings     │ Secondary metrics (inline list, not cards): approval rate, median │
│              │ review time, rejected, duplicates, provider failures, cards: n/a  │
│              │ ┌ Registrations ─────────┐ ┌ KYC decisions ─────┐ ┌ Volume ─────┐ │
│              │ └────────────────────────┘ └────────────────────┘ └─────────────┘ │
└──────────────┴────────────────────────────────────────────────────────────────────┘
```

The header indicator reads environment and provider from `GET /admin/settings`; if unknown it says "Environment unknown".

### 3.5 Admin KYC review (1440, three panes)

```
┌──────────────────────────────┬──────────────────────────┬────────────────────────┐
│ Documents                    │ Submitted details   v3   │ Decision               │
│ [Front][Back][Selfie]        │ Document  Fayda ID       │ (◷ Under review)       │
│ ┌──────────────────────────┐ │ Name      Abebe Kebede   │ ( ) Approve            │
│ │                          │ │ FAN       •••• 1234      │ ( ) Ask for changes    │
│ │   document image         │ │ Born      1990-01-01     │ ( ) Reject             │
│ │                          │ │ Address   …              │ Reason code [▾]        │
│ └──────────────────────────┘ │ Occupation …             │ Message to customer    │
│ [−][+][⟲ rotate][Side by side]│ Income    …              │ [                    ] │
│ Link expires in 4:12 [Reload]│ Purpose   …              │ Internal note          │
│                              │ Consent   2026-09-28     │ [                    ] │
│                              │                          │ [Record decision]      │
│                              │                          │ Timeline               │
│                              │                          │ Submitted → Opened →   │
└──────────────────────────────┴──────────────────────────┴────────────────────────┘
```

Under 1280 px the panes stack: documents, details, decision (decision panel sticky at the bottom on mobile).

### 3.6 Admin payment review (1440)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ Payment PAY-7Q2K                                       (⚠ Needs a person)     │
│ Provider CBE        Submitted 10:42        Attempt 2 of 3                      │
├─────────────────────┬─────────────────────┬───────────────────────┬───────────┤
│ Check               │ Expected            │ Customer claim        │ Receipt   │
├─────────────────────┼─────────────────────┼───────────────────────┼───────────┤
│ Amount              │       ETB 5,500.00  │        ETB 5,500.00   │ ETB 5,000 ✕│
│ Receiver account    │ •••• 4410           │ —                     │ •••• 4410 ✓│
│ Transaction time    │ by 12:00            │ 10:31                 │ 10:30    ✓│
│ Transaction ID      │ —                   │ FT2627…               │ FT2627…  ✓│
├─────────────────────┴─────────────────────┴───────────────────────┴───────────┤
│ Related claims (1)    Decision: [Verify] [Reject] [Ask for clarification]     │
└───────────────────────────────────────────────────────────────────────────────┘
```

Rows come from the backend `comparison[]` (`match | mismatch | unknown | info`); mismatches get a danger tint on the whole row plus an icon and the word "Mismatch".

---

## 4. Motion

- One orchestrated moment: on dashboard load, the card artwork settles in (opacity + 8 px rise, 480 ms, standard easing) once the card state is known. Nothing else animates on load. No counting-up money.
- Everything else responds to the user: dialogs and drawers (200 ms), disclosure expand (200 ms), toast in/out (200 ms), button pressed state (120 ms), freeze confirmation (state change on the card, 320 ms).
- Durations: fast 120, base 200, slow 320, card 480 ms; easing `cubic-bezier(0.2, 0, 0, 1)`.
- `prefers-reduced-motion: reduce` removes all of it (existing global override kept).

---

## 5. The memorable element: VirtualCard

All boldness goes here; the surroundings stay quiet.

- **Artwork**: an original guilloche — fine, interlaced sine rosettes generated as an inline SVG (the line-work of banknotes and cheques), drawn in violet 300–700 over a deep violet-to-ink gradient. Deterministic, ~2 KB, no image assets, no third-party marks. Arifcard wordmark top-left, a drawn chip, a contactless glyph.
- **Proportions**: ISO/IEC 7810 ID-1 ratio (85.6 × 53.98 mm, 1.586:1); width fluid from 296 px (360 viewport) to 400 px.
- **Content**: `•••• 4821` (tabular), expiry `MM/YY` if present, account holder name, status pill. Network mark only if `card.type` names one; drawn as text, never a copied logo.
- **States** (each designed, none looks broken):

| State | Backend condition | Treatment |
|---|---|---|
| No card | no order | The card footprint shows the four-step "Get your virtual card" checklist (§3.3) with the exact blocker copy (§6). Artwork appears as a faint outline only behind the checklist. |
| Issuance pending | order `AWAITING_FUNDING`, `READY_TO_ISSUE`, `ISSUING` | Full artwork, desaturated 40 %, no digits, pill "◷ Being issued" and the order message. |
| Active | order `ISSUED` and `card.ready` | Full artwork, last four, expiry, ✓ Active. |
| Not activated | `card.status === "notActivated"` | Full artwork, pill "◷ Not activated yet", action "Check card" (existing refresh). |
| Frozen | issuer `card.status` reports frozen/blocked | Artwork cooled behind a frosted layer with a lock icon and "Frozen"; digits stay legible. Display only — no freeze action exists. |
| Provider issue | order `ISSUE_FAILED`, `REQUIRES_REVIEW`, `REFUND_REQUIRED`, or issuer unreachable | Artwork muted, pill "⚠ Needs attention" and the backend customer message. |
| Top-up pending | no top-up exists in the backend | **DEFERRED** — not rendered. |

---

## 6. Dashboard blocker logic (pure function, unit-tested)

`deriveCardJourney({ kyc, onboarding, intents, orders })` returns the first
unmet step; precedence top to bottom:

| # | Condition (backend fields) | Headline (brief copy) | Supporting line | Action |
|---|---|---|---|---|
| 1 | `kycStatus` ≠ `APPROVED` | Complete identity verification first. | By status: not started → "It takes about 5 minutes."; `PENDING`/`UNDER_REVIEW` → "Your documents are with our review team."; `CHANGES_REQUESTED`/`REJECTED` → reviewer `customerReason` | Verify identity / View feedback |
| 2 | onboarding `DENIED`, `LOCKED`, `UNKNOWN_STATE`, or onboarding request fails with a provider error | Card service temporarily unavailable. | `blocked.message` or onboarding `message` | none / Contact support |
| 3 | onboarding not `APPROVED` (`NOT_STARTED` … `ACTION_REQUIRED`, `EXPIRED`, `CANCELED`) | Card issuer verification in progress. (`NOT_STARTED`, `EXPIRED`, `CANCELED`, `ACTION_REQUIRED` → "Finish your card issuer check.") | onboarding `message` | Continue (opens Cards) |
| 4 | an intent `AWAITING_PAYMENT`, `VERIFYING` or `REQUIRES_REVIEW` and no verified, unused payment | Payment verification in progress. (`AWAITING_PAYMENT` → "Finish your payment.") | intent `nextAction` | View payment |
| 5 | no verified payment and no order | Add money to order your card. | — | Add money |
| 6 | verified payment, no order | Your payment is verified. | — | Order card |
| 7 | order `AWAITING_FUNDING`, `READY_TO_ISSUE`, `ISSUING` | Your card is being issued. | order `message` | Issue card (when `canIssue`) |
| 8 | order `ISSUE_FAILED`, `REQUIRES_REVIEW`, `REFUND_REQUIRED` | Card service temporarily unavailable. | order `message` | View card |
| 9 | order `ISSUED` | — card shown — | | |

Gating confirmed in the backend: payments need approved KYC only; a card order
needs approved KYC (`requireApprovedKyc`), issuer onboarding `APPROVED` with a
provider user (`ISSUER_ONBOARDING_REQUIRED`), and an unused `VERIFIED`
add-funds payment (`codego/cardOrders.js:209-239`). Issuer check and payment can
happen in either order; the table shows the issuer check first because its
failure is the one the customer cannot fix by paying.

Data for the dashboard (all existing endpoints, no backend change):
`GET /kyc/case`, `GET /card-issuer/onboarding`, `GET /payments/intents`,
`GET /card-issuer/card-orders`, `GET /kyc/notifications`.

---

## 7. Copy rules (applied to every string touched)

- Buttons say what happens: "Add money", "Order card", "Issue card", "Submit for review", "Record decision". Toasts reuse the verb: "Money request created", "Card ordered".
- Errors: what happened + what to do. "We couldn't reach the card issuer. Try again in a few minutes." Never "Oops", never "Something went wrong" alone.
- Disabled reasons are one line: "Freezing isn't available yet." "Card details can't be shown in the app yet."
- No backend words in customer copy (webhook, provider ID, Firestore, intent, claim).
- Freshness: "Checked 2 min ago" (when we fetched), never "Updated" (we do not know when the issuer changed it).

---

## 8. Design system (Checkpoint A build list)

Tokens: colour (§1), type (§2), spacing, radius, elevation, z-index, motion,
breakpoints — CSS variables in `packages/ui/src/tokens.css`, consumed via
`@theme inline`; one ThemeProvider (the two existing providers merge into the
`packages/ui` one, same `addiscard-theme` key and `theme-init.js`, so no flash).

Components, each on one demo route (`/customer/design-system`, dev-only, not
linked, excluded from production builds): Button, Input, Select, Textarea,
Checkbox/Switch, Tabs, StatusPill, Panel, StatCard, PageHeader, Table (collapses
to cards under 640 px), Pagination, Dialog (focus trap + restore — existing),
Drawer, Dropdown, Tooltip, Toast, Skeleton, EmptyState, ErrorState,
OfflineState, Timeline, StepIndicator, VirtualCard, BarChart/LineChart (SVG),
FileUpload with preview, MoneyValue (tabular, currency-aware, freshness slot,
`aria-live="polite"`).

Pages compose these; no page defines colours, radii or shadows inline (enforced
by a lint-style test that greps pages for hex values and arbitrary radius/shadow
classes).

---

## 9. Realtime and data layer

- The brief assumes Firestore realtime reads. **None exist**: the browser has no
  Firebase SDK, every read is a backend API call, and the security rules are
  deny-all. Adding browser listeners would require relaxing rules (forbidden by
  the admin-isolation brief) or a backend push channel (a backend change).
- Therefore: no listener registry. Instead one small `useResource` cache per app
  (key → in-flight promise + data + `fetchedAt`), so a resource used by the
  header and the page is fetched once, re-fetched on window focus (at most once
  per 30 s) and on explicit Refresh, and discarded on logout. No polling loops.
- Checkpoint D's "listener audit" becomes a request audit: count of requests per
  navigation before/after, and no request after logout.

---

## 10. Quality gates — tooling

| Gate | Tool | Status |
|---|---|---|
| Screenshots at 360/768/1440/1920, both themes | built-in browser pane (resize + screenshot) | available |
| No horizontal overflow | script in the page: `scrollWidth <= clientWidth` per width | available |
| Tabular figures | width comparison script (§2) | available |
| axe-core | `axe-core` (MPL-2.0, ~0.5 MB script) injected into the preview page | **needs approval** (dev tooling, not added to `package.json`) |
| Lighthouse | `lighthouse` CLI (Apache-2.0, large) via `npx`, outside the repo | **needs approval** |
| Bundle size | build + gzip script; baseline measured before any change | available |

---

## 11. Critique (plan reviewed against the brief's "generic tells")

The first draft of this plan was checked line by line against §3.4 of the brief
and against the inventory. What matched a tell, and what changed:

| # | First draft | Tell / problem | Revision |
|---|---|---|---|
| 1 | Admin overview: eleven equal StatCards in a grid | identical rounded cards everywhere | "Needs attention" first; four primary KPIs in one joined strip; the rest as a labelled inline list; charts last |
| 2 | Admin header "Sandbox · Codego" | middle-dot meta string | two labelled chips: "Environment: Sandbox", "Issuer: Codego" |
| 3 | Payment review header ran id, status, provider, time, attempt on one line | meta string, no hierarchy | id + status on line one; labelled facts on line two |
| 4 | Dashboard row of four actions, three of them disabled | a row of greyed buttons reads as broken | live actions (Add money, Payments) are full-size beside the card; the three unavailable card actions form one small disabled group with **one** shared reason; hidden entirely when there is no card (the checklist is the action then) |
| 5 | "Unavailable" rendered at money-hero size | the largest thing on the screen would be a non-value | 40 px is reserved for real figures; "Unavailable" renders at h2 weight in muted ink with its reason |
| 6 | Right-hand "Status" panel on every width | duplicates the header pill and the attention list | shown only at ≥ 1280 px; on smaller widths the header pill and "Needs attention" carry it |
| 7 | Skeleton shimmer and section fade-ins on load | fade-and-slide on every section | static skeletons (no shimmer under reduced motion, subtle pulse otherwise); only the card has an entrance |
| 8 | Clickable rows and panels lift on hover | hover lift on every card | no lift anywhere; clickable rows get a `surface-2` background and a chevron |
| 9 | References and receipt tokens in a monospace face | monospace for small labels | tabular figures in Geist; monospace nowhere |
| 10 | Frozen card as a heavy blurred glass sheet | glassmorphism | a single frosted layer on one component in one state; nowhere else |
| 11 | Violet used for links, active nav, focus, pills and charts | accent overload, > 6 hues | violet = primary action, active nav, focus, card art; links blue; status semantic only; charts violet + neutral |
| 12 | Panels with shadow + border + radius 24 everywhere | same grey shadow everywhere | panels flat with a 1 px border; elevation only for e1/e2/e3 |
| 13 | Admin tables at 13 px with every column equal weight | dense tables with no hierarchy | 48 px rows; first column ink 500 with a muted second line; numerals right-aligned; status as pill; secondary columns hidden under 1024 px |
| 14 | "Updated 2 min ago" under the balance | implies the issuer pushed an update | "Checked 2 min ago" — the truth is when we fetched |
| 15 | Payment "Verifying" with four animated check lines | fake progress | one honest state: the backend reports a single result |
| 16 | Captions at 11 px for timestamps | tiny text | 12 px minimum everywhere |
| 17 | "View all →" links | "→" appended to text | plain verb links ("View all payments"); chevrons only as row affordances |

## 12. Owner questions (not blocking the plan; needed before the related step)

1. Approve running `axe-core` and `lighthouse` via `npx` from outside the repos (no `package.json` change)? Without them the axe/Lighthouse numbers will be reported as BLOCKED.
2. Marketing pages: comments say several sections are an "exact match" of a third-party site, and the landing/about pages show invented statistics ("1K+ Happy Users") and testimonials. The brief forbids both. Remove them in Checkpoint B, or leave marketing out of scope?
3. Font: approve switching from Inter to Geist (Google Fonts, no dependency)?
