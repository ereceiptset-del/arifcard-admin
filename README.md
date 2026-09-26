# Arifcard — Frontend

React + JavaScript + Vite + Tailwind CSS. One application.

| Path                 | What it is                                    |
| -------------------- | --------------------------------------------- |
| `src/`               | The app: marketing, auth, `/customer`, `/admin` |
| `packages/ui/`       | Design tokens, primitives, dashboard shell    |
| `packages/services/` | Auth client and the browser-side demo store   |

`packages/*` are npm workspaces. `vite.config.js` aliases them to their
source so their JSX goes through the React transform.

## Install and run

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

The backend must be running too, for sign-in:

```bash
cd backend
npm run dev            # http://localhost:4000
```

## Build and lint

```bash
npm run build
npm run lint
```

## Deploy

The site is served by Firebase Hosting at **https://addiscard-1a9bc.web.app**.
The backend is on the same URL under `/api`: Hosting forwards `/api/**`
to the backend's Cloud Function. Deploy that from `backend/` with its own
`npm run deploy`, before the site when a change touches both.

Once per machine: `npm install -g firebase-tools`, then `firebase login`.

```bash
npm run deploy     # vite build, then firebase deploy --only hosting
```

The Firebase config (`firebase.json`, `.firebaserc`) is in the parent
workspace folder; the Firebase CLI finds it from here.

Production builds use `.env.production`: `VITE_API_BASE_URL=/api`, the one
setting every API call reads, so the deployed site talks to the deployed
backend on its own origin. Locally, `.env` points at `http://localhost:4000/api`.

## Signed-in areas

`/customer` and `/admin` are both behind `ProtectedRoute`. They are built
from `packages/ui`, which needs its own theme and toast providers — those
are mounted on those two subtrees in `src/routes/AppRoutes.jsx`, not around
the whole app, because the marketing and auth pages do not use them. The
shared theme provider uses the same storage key as the site's own
`ThemeContext`, so light/dark stays consistent across the two.

## Data

Sign-in is real. Everything the dashboards display is demo data generated
in the browser by `packages/services/src/localStore.js` — per-browser, reset
when site data is cleared, and labelled DEMO in the UI.

`.env` points at `http://localhost:4000/api` for local development;
`.env.production` uses the relative `/api`, which Firebase Hosting rewrites
to the Cloud Function.
