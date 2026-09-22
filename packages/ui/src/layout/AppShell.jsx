import { useEffect, useState } from "react";
import { Menu, X, Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "../theme/ThemeProvider.jsx";

/**
 * Shared dashboard chrome for both apps: a 240px rail from `lg` up, a
 * compact top bar, an optional banner strip, and a centred content column.
 *
 * Each app supplies its own `navItems`, `NavLinkComponent` (so the router
 * stays out of this package), brand label and account block.
 */
export function AppShell({
  brand,
  brandHref = "/",
  navItems = [],
  NavLinkComponent,
  account,
  onSignOut,
  banner,
  topBarExtras,
  children,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { resolvedTheme, toggle } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

  const rail = (
    <div className="flex h-full flex-col bg-panel dark:bg-panel-raised-dark border-r border-line dark:border-line-dark">
      <div className="flex h-[68px] shrink-0 items-center justify-between px-5">
        <NavLinkComponent
          to={brandHref}
          className="text-[16px] font-semibold tracking-tight text-ink dark:text-ink-dark"
        >
          {brand}
        </NavLinkComponent>
        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close menu"
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-field text-ink-muted hover:bg-panel-muted dark:hover:bg-white/5"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2" aria-label="Main">
        {navItems.map(({ label, to, icon: Icon, end }) => (
          <NavLinkComponent
            key={to}
            to={to}
            end={end}
            onClick={() => setDrawerOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-field px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                isActive
                  ? "bg-brand text-white"
                  : "text-ink-soft dark:text-ink-muted-dark hover:bg-panel-muted dark:hover:bg-white/5 hover:text-ink dark:hover:text-ink-dark"
              }`
            }
          >
            {Icon && <Icon size={17} />}
            <span className="truncate">{label}</span>
          </NavLinkComponent>
        ))}
      </nav>

      {account && (
        <div className="shrink-0 border-t border-line dark:border-line-dark px-4 py-4">
          <p className="truncate text-[13px] font-semibold text-ink dark:text-ink-dark">
            {account.name}
          </p>
          {account.secondary && (
            <p className="mt-0.5 truncate font-mono text-[11.5px] text-brand">{account.secondary}</p>
          )}
          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-field border border-line-strong dark:border-line-strong-dark px-3 py-2 text-[13px] font-medium text-ink dark:text-ink-dark hover:bg-panel-muted dark:hover:bg-white/5 transition-colors"
            >
              <LogOut size={15} />
              Sign out
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas-dark">
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30 w-rail">{rail}</aside>

      {drawerOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/45 opacity-100 transition-opacity duration-200 starting:opacity-0"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="lg:hidden fixed inset-y-0 left-0 z-50 w-[260px] max-w-[85vw] translate-x-0 transition-transform duration-200 ease-out starting:-translate-x-full"
          >
            {rail}
          </aside>
        </>
      )}

      <div className="flex min-h-screen flex-col lg:pl-rail">
        <header className="flex h-[68px] shrink-0 items-center justify-between gap-3 border-b border-line dark:border-line-dark bg-panel dark:bg-panel-raised-dark px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            className="lg:hidden flex h-11 w-11 items-center justify-center rounded-field text-ink dark:text-ink-dark hover:bg-panel-muted dark:hover:bg-white/5 transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="ml-auto flex items-center gap-1">
            {topBarExtras}
            <button
              type="button"
              onClick={toggle}
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              className="flex h-10 w-10 items-center justify-center rounded-field text-ink-soft dark:text-ink-muted-dark hover:bg-panel-muted dark:hover:bg-white/5 transition-colors"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {banner}

        <main className="flex-1 px-4 sm:px-6 py-7">
          <div className="mx-auto w-full max-w-content">{children}</div>
        </main>
      </div>
    </div>
  );
}
