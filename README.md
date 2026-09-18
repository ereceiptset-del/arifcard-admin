# Addiscard — Frontend

Fintech web app: fund a wallet locally, spend with a virtual USD card
internationally.

Stack: React + JavaScript + Vite, React Router. (Framer Motion, React Hook
Form, Zod, and Lucide React are added in the steps that need them, so the
dependency list stays minimal for now.)

## Getting started

```bash
npm install
npm run dev
```

## Structure

```
src/
├── assets/           static images/icons
├── components/
│   ├── auth/         auth-specific UI (built alongside each auth step)
│   ├── cards/         virtual card presentation
│   ├── landing/       landing-page sections
│   ├── layout/        shared chrome (navbar, footer, etc.)
│   └── ui/            generic building blocks (buttons, inputs, ...)
├── context/           React context providers (e.g. theme, auth — later steps)
├── hooks/             shared hooks
├── layouts/           page shells, e.g. AuthLayout
├── lib/               framework-agnostic helpers
├── pages/
│   ├── auth/          /login, /register, /verify, /forgot-password
│   └── landing/       /
├── routes/            route table (AppRoutes)
├── services/          API clients (added once the backend exists)
├── styles/            tokens.css (design tokens) + global.css (reset/base)
├── App.jsx
└── main.jsx
```

## Status

This is Step 1 of the phased build: routing, global styles, design tokens,
font setup, and empty placeholder routes only. No detailed UI, forms,
theming logic, backend, or motion yet — those arrive in later steps.
# addiscard-back
