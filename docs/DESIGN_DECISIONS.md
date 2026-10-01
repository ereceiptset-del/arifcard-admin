# Design decisions

One row per decision: what was chosen, the main alternative, and why. Newest
last. Plan: `docs/design-plan.md` (shared with the customer app). Inventory: `docs/UI_INVENTORY.md`.

| # | Date | Decision | Alternative rejected | Reason |
|---|---|---|---|---|
| D1 | 2026-10-01 | Keep `#8055FF` as violet-500 and build the 50–900 scale around it | A new violet | Continuity with the existing identity; the scale gives AA-passing steps (600 on light, 400 on dark) |
| D2 | 2026-10-01 | Theme tokens as CSS variables switched by `.dark`, read through `@theme inline` | Keep separate `*-dark` tokens and `dark:` on every component | Halves class noise, makes light and dark separately designed values; the earlier problem with hand-written `.dark` selectors is avoided by keeping variables outside `@theme` and verifying both themes in the browser |
| D3 | 2026-10-01 | Geist with tabular figures (pending in-browser `tnum` check) | Inter | Narrower, calmer numerals keep ETB totals on one line at 360 px; less generic. Fallback to Inter if the check fails |
| D4 | 2026-10-01 | Balance renders "Unavailable" with reason and "Checked N min ago" | Hide the balance, or show verified payments as a balance | No balance endpoint exists; a hidden balance fails the three-second test, a payments total would mislead |
| D5 | 2026-10-01 | Freeze, top-up and card-detail reveal shown disabled with one shared reason; status BLOCKED | Build UI for them | No backend actions exist; the brief forbids inventing a reveal |
| D6 | 2026-10-01 | No realtime listener registry; a small per-app request cache with focus refresh | Firestore listeners in the browser | No browser Firebase SDK; rules are deny-all; listeners would need relaxed rules or a backend change |
| D7 | 2026-10-01 | Hand-built SVG charts in the design system | Add a chart library | No chart library is installed; three daily series do not justify a dependency |
| D8 | 2026-10-01 | Card artwork: original SVG guilloche on a violet-to-ink gradient | Photographic or third-party-inspired card art | Original, tiny, theme-independent, reads as "financial instrument"; no copied marks |
| D9 | 2026-10-01 | Cardholder line shows the account name from the profile | Leave the name off | The issuer view has no name; the account name is real data and labelled as such |
| D10 | 2026-10-01 | Brief's "Updated" freshness wording changed to "Checked" | "Updated N min ago" | We know when we fetched, not when the issuer changed the value |
| D11 | 2026-10-01 | Unavailable card actions grouped with one reason, hidden when there is no card | Four equal buttons with three disabled | A row of disabled buttons reads as broken (critique #4) |
