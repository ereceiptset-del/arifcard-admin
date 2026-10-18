# Redesign Revision 3 (18 October 2026)

The canonical record — research, audit, navigation maps, status/copy
contract, fixtures, validation and rollback — lives in the customer
repository: `frontend/docs/redesign-rev3.md`. The two apps share one
visual and status language; `packages/ui/src/layout/AppShell.jsx` is kept
identical in both.

Admin changes in this revision: operations-first Overview ("Needs a person
now", from `GET /admin/operations/summary`), Top-up requests as its own
queue (`/top-ups?bucket=`), grouped navigation, card issuer and Sandbox
badge in the header, "Card •••• 0000" instead of an assumed network.
