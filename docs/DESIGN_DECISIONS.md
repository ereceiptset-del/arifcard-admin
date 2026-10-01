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
| C1 | 2026-10-01 | Admin uses the same design system as the customer app, in a wide, denser shell with global search and an issuer environment chip | A separate admin look | One system to maintain; the brief asks for a visibly different operations layout, which the shell options provide |
| C2 | 2026-10-01 | Overview keeps every old figure with the same value and adds the ones the API already returned | A smaller KPI set | Parity is a gate; hidden fields were real data |
| C3 | 2026-10-01 | KYC decision inline in the third pane, with a confirm step | Decision in a modal | The reviewer sees documents, details and the decision together; the confirm protects an irreversible action |
| C4 | 2026-10-01 | Card operations built on the existing provider operations/events endpoints via an admin-side data module | Adding functions to packages/services | packages/services is a frozen zone; the endpoints and their protection already exist |
| C5 | 2026-10-01 | Four separate pills per card order (payment verified, issuer funded, card issued, card active) | One merged status | The brief forbids conflating them; each is derived from its own field |
| C6 | 2026-10-01 | Admin Transactions keeps its empty state | Listing payment claims as transactions | No ledger exists; claims are not accounted money |
