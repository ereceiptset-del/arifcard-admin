/**
 * AuthLayout
 *
 * Layout route for authentication screens (login, register, verify,
 * forgot-password). Rendered once by the router and kept mounted across
 * navigation between those routes — only the nested route's element
 * (via <Outlet />) swaps, so the left product panel never re-mounts or
 * flashes when the user moves between auth screens.
 *
 * - Left column: ~45% width on desktop, dark navy (#070B15) background.
 * - Right column: ~55% width on desktop, centered container for auth forms.
 * - Light mode: left panel dark, right side light (#FAFAFA).
 * - Dark mode: the whole canvas unifies to #070B15 — no visible split.
 * - Form target width: max-w-[384px].
 *
 * The form transition is pure CSS (Tailwind's `starting:` variant, i.e.
 * @starting-style), keyed on the pathname so each route mounts a fresh
 * node and replays the enter animation.
 *
 * It deliberately does NOT use framer-motion's AnimatePresence. That
 * combination deadlocked once the routes became lazy(): the incoming
 * route suspends while `mode="wait"` is still holding the outgoing one,
 * and the new screen never mounts at all — the URL changes but the old
 * form stays on screen. Losing the exit animation is a cheap price for
 * navigation that actually works. `prefers-reduced-motion` is handled by
 * the global transition-duration override in styles/index.css.
 */
import { Suspense } from "react";
import { useOutlet, useLocation } from "react-router-dom";
import AuthProductPanel from "../components/auth/AuthProductPanel";
import ThemeToggle from "../components/ui/ThemeToggle";

function AuthLayout() {
  const element = useOutlet();
  const location = useLocation();

  return (
    <div className="relative flex min-h-screen w-full bg-surface-0 text-ink transition-colors duration-200">
      {/* Theme control — available from every auth screen */}
      <div className="absolute top-5 right-5 sm:top-6 sm:right-6 lg:top-8 lg:right-10 z-10">
        <ThemeToggle />
      </div>

      {/* Left panel: ~45% width on desktop, dark navy (#070B15) background — stays mounted */}
      <aside className="hidden lg:flex lg:w-[45%] flex-col bg-[#070B15] text-white">
        <AuthProductPanel />
      </aside>

      {/* Right panel: desktop ~55%, full width on mobile/tablet */}
      <main className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[384px]">
          {/*
            A Suspense boundary here keeps a lazily-loaded auth route from
            tearing down this whole layout (and the left panel with it)
            while its chunk downloads.
          */}
          <Suspense
            fallback={
              <div className="flex justify-center py-10">
                <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              </div>
            }
          >
            <div
              key={location.pathname}
              className="opacity-100 translate-y-0 transition-[opacity,transform] duration-200 ease-out starting:opacity-0 starting:translate-y-1.5"
            >
              {element}
            </div>
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;
