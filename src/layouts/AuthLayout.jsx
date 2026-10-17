/**
 * AuthLayout
 *
 * Layout route for the staff console sign-in screens (login, forgot/reset
 * password; there is no sign-up). Rendered once and kept mounted while the user
 * moves between them: only the nested route's element swaps, so the
 * product showcase never re-mounts or flashes.
 *
 * Desktop (lg+): two columns.
 *   Left  — Arifcard mark, theme control, the form (max 440px), footer.
 *   Right — AuthHeroPanel, the product showcase, inset in a rounded panel.
 * Phone/tablet: one column. The form comes first; a compact showcase
 * follows it, so nothing stands between a customer and signing in.
 *
 * The form transition is pure CSS (`starting:`, i.e. @starting-style),
 * keyed on the pathname so each route replays the enter animation.
 * framer-motion's AnimatePresence is deliberately not used: with lazy()
 * routes it deadlocked (the incoming route suspends while `mode="wait"`
 * holds the outgoing one, and the new screen never mounts). Reduced
 * motion is handled by the global override in tokens.css.
 */
import { Suspense } from "react";
import { Link, useOutlet, useLocation } from "react-router-dom";
import { BrandMark } from "@addiscard/ui";
import AuthHeroPanel from "../components/auth/AuthHeroPanel";
import ThemeToggle from "../components/ui/ThemeToggle";

function AuthLayout() {
  const element = useOutlet();
  const location = useLocation();

  return (
    <div className="min-h-screen w-full bg-surface-1 text-ink transition-colors duration-200 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]">
      <div className="flex min-h-screen flex-col px-5 sm:px-10 lg:px-14 xl:px-20">
        <header className="flex h-20 shrink-0 items-center justify-between gap-4">
          <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-control text-[18px] font-semibold tracking-tight text-ink">
            <BrandMark size={26} />
            Arifcard
          </Link>
          <ThemeToggle />
        </header>

        <main className="flex flex-1 items-center py-8 sm:py-12">
          <div className="mx-auto w-full max-w-[440px] lg:mx-0">
            {/*
              A Suspense boundary here keeps a lazily-loaded auth route from
              tearing down this whole layout (and the showcase with it)
              while its chunk downloads.
            */}
            <Suspense
              fallback={
                <div className="flex justify-center py-10" role="status" aria-label="Loading">
                  <div className="size-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                </div>
              }
            >
              <div
                key={location.pathname}
                className="translate-y-0 opacity-100 transition-[opacity,transform] duration-200 ease-out starting:translate-y-1.5 starting:opacity-0"
              >
                {element}
              </div>
            </Suspense>
          </div>
        </main>

        <div className="pb-8 lg:hidden">
          <AuthHeroPanel compact />
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-line py-5 text-caption text-ink-muted">
          <span>© {new Date().getFullYear()} Arifcard</span>
          <span>Staff console · access is granted, not requested</span>
        </footer>
      </div>

      <aside className="hidden p-3 lg:block lg:min-h-screen">
        <AuthHeroPanel />
      </aside>
    </div>
  );
}

export default AuthLayout;
