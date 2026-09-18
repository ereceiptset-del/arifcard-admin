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
 */
import { useOutlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import AuthProductPanel from "../components/auth/AuthProductPanel";
import ThemeToggle from "../components/ui/ThemeToggle";

function AuthLayout() {
  const element = useOutlet();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative flex min-h-screen w-full bg-[#FAFAFA] dark:bg-[#070B15] text-[#101217] dark:text-[#F6F7F9] transition-colors duration-200">
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
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {element}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;
