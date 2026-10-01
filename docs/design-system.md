# Arifcard design system

Status: **IMPLEMENTED** in both apps (customer: Checkpoints A–B; admin:
Checkpoint C; sign-in screens: Checkpoint D). `packages/ui` is identical in
both repositories — change it in both (`docs/shared-code.md`). Plan and rationale:
`design-plan.md`; decisions: `DESIGN_DECISIONS.md`.

The catalogue runs in development only: `npm run dev`, then open
`/design-system`. Every component is shown twice, pinned to light and to dark.

## 1. Tokens (`packages/ui/src/tokens.css`)

Colours are CSS variables defined for light (`:root`, `.light`) and dark
(`.dark`), exposed to Tailwind through `@theme inline`. A utility such as
`bg-surface-1` follows the theme on its own, so **new code never uses `dark:`**.

| Group | Utilities |
|---|---|
| Surfaces | `bg-surface-0` (page), `bg-surface-1` (panel), `bg-surface-2` (inset, hover), `bg-surface-3` (popover) |
| Lines | `border-line` (panels, decorative), `border-line-strong` (controls, ≥ 3:1) |
| Text | `text-ink`, `text-ink-soft`, `text-ink-muted` |
| Accent | `bg-accent` + `text-on-accent`, `bg-accent-soft` + `text-accent-ink`, `text-link` |
| Semantic | `success`, `warning`, `danger`, `neutral`, `info`, each with `-tint` |
| Violet scale | `violet-50` … `violet-900` (`500` = brand `#8055FF`) |
| Elevation | `shadow-e1` (menus, tooltips), `shadow-e2` (dialogs, drawers), `shadow-e3` (card artwork only) |
| Radius | `rounded-panel` 20, `rounded-control` 10, `rounded-tag` 6, `rounded-full` pills |
| Type | `text-money` / `text-money-sm`, `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-small`, `text-caption` |
| Motion | `animate-card-in` (the dashboard card only), `ease-[var(--ease-standard)]`; durations 120 / 200 / 320 / 480 ms |
| Layout | `w-rail` 248, `w-rail-collapsed` 76, `max-w-content` 1120 |

Spacing uses Tailwind's 4 px scale; the design uses 1, 2, 3, 4, 6, 8, 12, 16
(4–64 px). Z-index: sticky header 10, rail and bottom nav 20, menus 30,
drawer 40, dialog 50, toast 60, tooltip 70.

The older names (`canvas`, `panel`, `brand`, `ok`, `warn`, `*-dark`) remain as
aliases only because the customer marketing pages still use them (their
redesign awaits an owner decision). Nothing in the signed-in apps or the
sign-in screens uses them; `tests/designRules.test.mjs` enforces that.

Contrast for every text/background pair is in `design-plan.md` §1.5
(0 failures).

## 2. Rules

1. Pages compose components; a page never sets its own colour, radius or
   shadow (no hex values, no `rounded-[…]`, no `shadow-[…]`). Enforced for
   redesigned files by `tests/designRules.test.mjs`.
2. Every state is icon + word + colour (`StatusPill`), never colour alone.
3. Money uses `MoneyValue` or `formatMoney` with `tabular-nums`, right-aligned
   in lists. Money is the largest text on its screen. Unknown is
   "Unavailable" with a reason — never `0`.
4. A disabled action says why (`disabledReason`); several sharing one visible
   reason pass `reasonId`.
5. Links that look like buttons use `buttonClasses()` on the link — never a
   `<button>` inside an `<a>`.
6. Touch targets are at least 44 px; inputs are 16 px text on phones (no iOS
   zoom).
7. Copy: sentence case, plain verbs, no backend words (design-plan §7).

## 3. Components (`@addiscard/ui`)

| Component | Use |
|---|---|
| `AppShell` | Signed-in chrome: collapsible rail (lg+), top bar, phone bottom nav (`primary` items, max four + More), drawer |
| `Button`, `buttonClasses` | `primary`, `secondary`, `ghost`, `destructive`; `sm` / `md` (44) / `lg`; `loading`; `disabledReason`, `reasonId` |
| `StatusPill` (`Badge`) | Tones `success`, `warning`, `attention`, `danger`, `neutral`, `info`, `accent`; default icon per tone |
| `Panel` | Flat bordered surface with optional title, description, action |
| `StatCard` | One metric, or "Unavailable" + reason |
| `PageHeader` | Title, description, actions |
| `MoneyValue` | Amount + currency + "Checked N min ago" + refresh; `aria-live` |
| `VirtualCard` | States `active`, `inactive`, `pending`, `frozen`, `issue`, `showcase` |
| `StepIndicator` | Checklist: `done`, `current`, `todo`, `blocked`; vertical or horizontal |
| `Timeline` | Recorded events: `done`, `current`, `todo`, `failed` |
| `Table` | Table from `sm`, stacked cards below; `align: "right"` numerals; `hideBelow` |
| `Pagination` | Cursor Previous/Next or "Show more" |
| `Dialog`, `Drawer` | Focus trapped and restored (`useFocusTrap`); Escape closes |
| `Dropdown` | Menu button; arrow keys; disabled items show their reason |
| `Tooltip` | Hover and focus; described-by, never the only copy |
| `Toast` | `success`, `error`, `info`; polite live region |
| `Skeleton`, `EmptyState`, `ErrorState`, `OfflineState` | Loading, empty, failed, offline (network errors render offline automatically) |
| `TextInput`, `SelectInput`, `TextArea`, `Checkbox`, `Switch`, `FileField`, `SearchableSelect` | Form controls with label, hint, error wiring |
| `Tabs`, `Stepper` | Tabs; wizard progress |
| `BarChart`, `LineChart` | SVG, no library; data also as a hidden table |

Helpers: `formatMoney`, `timeAgo`, `formatDate`, `formatDateTime`, `useFocusTrap`.

## 4. Theme

One provider (`ThemeProvider` from `@addiscard/ui`, also re-exported by
`src/context/ThemeContext.jsx`), one key (`localStorage["addiscard-theme"]`:
`light | dark | system`), applied before first paint by `public/theme-init.js`.
First load follows `prefers-color-scheme`.

## 5. Data on signed-in screens

`src/data/resources.js` is a small request cache: one shared request per
resource, refreshed on window focus when older than 30 s and on Refresh, no
polling, cleared on sign-out, keys scoped by user id. `src/data/customerData.js`
maps names to the existing service calls. There are no realtime listeners
(design-plan §9).

## 6. Verifying a screen

- `npm test` builds, runs the bundle checks and the unit tests (including the
  dashboard logic in `tests/cardJourney.test.mjs`).
- Visual harness (dev server only): `/tests/visual/dashboard.html?scenario=…`
  renders the real app with synthetic records for each backend state. It is
  test tooling and is never built into the site.
