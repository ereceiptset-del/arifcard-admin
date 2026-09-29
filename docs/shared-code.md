# Shared code between the customer and admin apps

Both frontends use the same design system and API contracts:

| Package | What | Where it lives |
|---|---|---|
| `@addiscard/ui` | Components, theme, tokens (`packages/ui`) | a copy in **each** repository |
| `@addiscard/services` | API client, labels, status contracts (`packages/services`) | a copy in **each** repository |

**Decision (admin isolation, 2026-09-29):** each repository carries its own
copy as an npm workspace (`"workspaces": ["packages/*"]`, Vite aliases in
`vite.config.js`). There are no imports across repositories, no `file:`
dependencies, no symlinks and no extra package registry — each repository
installs and builds alone from a clean clone.

- Origin of this copy: `addiscard-front` commit `f937b33` (history preserved:
  this repository was cloned from it, then the customer code was removed).
- Admin-only: `packages/services/src/adminService.js` exists only here.
- The customer copy drops `adminService`; everything else started identical.

## Changing shared code

1. Make the change in the repository that needs it.
2. If the other app needs it too, port the same change there in its own
   commit, mentioning the source commit ("ports addiscard-front abc1234").
3. API contracts are defined by the backend (`addiscard-back`,
   `docs/api/openapi.yaml`); both copies follow it, not each other.

Divergence is acceptable where the apps genuinely differ; a shared
package would only be worth it if porting became frequent.
