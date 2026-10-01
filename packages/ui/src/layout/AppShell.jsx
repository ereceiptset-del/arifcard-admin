import { useEffect, useRef, useState } from "react";
import { Menu, X, Moon, Sun, LogOut, PanelLeftClose, PanelLeftOpen, Ellipsis } from "lucide-react";
import { useTheme } from "../theme/ThemeProvider.jsx";
import { useFocusTrap } from "../lib/useFocusTrap.js";

const COLLAPSE_KEY = "arifcard-rail-collapsed";

/**
 * Signed-in chrome.
 *
 * Desktop (lg+): a 248px rail with icon + label that collapses to icons
 * (remembered per browser), and a top bar for status and account.
 * Phones: a top bar and a bottom navigation of up to four `primary` items
 * plus "More", which opens the full menu as a drawer. Primary actions on
 * pages sit above the bottom bar, within thumb reach.
 *
 * The router stays out of this package: each app passes `NavLinkComponent`.
 * `wide` lets the content run to 1600px (the admin's dense tables);
 * `topBarStart` fills the left of the top bar (the admin's global search).
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
  topBarStart,
  wide = false,
  children,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const { resolvedTheme, toggle } = useTheme();
  const isDark = resolvedTheme === "dark";
  const drawerRef = useRef(null);
  useFocusTrap(drawerOpen, () => setDrawerOpen(false), drawerRef);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch {
      /* storage unavailable: the rail still works, it just isn't remembered */
    }
  }, [collapsed]);

  const primaryItems = navItems.filter((item) => item.primary).slice(0, 4);

  const navLink = (item, { compact = false, onNavigate } = {}) => {
    const Icon = item.icon;
    return (
      <NavLinkComponent
        key={item.to}
        to={item.to}
        end={item.end}
        onClick={onNavigate}
        title={compact ? item.label : undefined}
        className={({ isActive }) =>
          `flex min-h-11 items-center gap-3 rounded-control px-3 text-small font-medium transition-colors ${
            compact ? "justify-center" : ""
          } ${isActive ? "bg-accent-soft text-accent-ink" : "text-ink-soft hover:bg-surface-2 hover:text-ink"}`
        }
      >
        {Icon && <Icon size={18} aria-hidden className="shrink-0" />}
        <span className={compact ? "sr-only" : "truncate"}>{item.label}</span>
        {item.badge ? (
          <span className={`${compact ? "sr-only" : "ml-auto"} rounded-full bg-accent px-1.5 text-caption font-semibold text-on-accent tabular-nums`}>
            {item.badge}
          </span>
        ) : null}
      </NavLinkComponent>
    );
  };

  const accountBlock = (compact) =>
    account && (
      <div className={`shrink-0 border-t border-line p-3 ${compact ? "flex flex-col items-center gap-2" : ""}`}>
        <div className={`flex items-center gap-3 ${compact ? "" : "px-1"}`}>
          <Initials name={account.name} />
          {!compact && (
            <div className="min-w-0">
              <p className="truncate text-small font-semibold text-ink">{account.name}</p>
              {account.secondary && <p className="truncate text-caption text-ink-muted">{account.secondary}</p>}
            </div>
          )}
        </div>
        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            title={compact ? "Sign out" : undefined}
            className={`mt-2 flex min-h-11 items-center gap-3 rounded-control px-3 text-small font-medium text-ink-soft hover:bg-surface-2 hover:text-ink ${
              compact ? "justify-center" : "w-full"
            }`}
          >
            <LogOut size={17} aria-hidden />
            <span className={compact ? "sr-only" : ""}>Sign out</span>
          </button>
        )}
      </div>
    );

  return (
    <div className="min-h-screen bg-surface-0 text-ink">
      {/* Desktop rail */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 hidden flex-col border-r border-line bg-surface-1 transition-[width] duration-200 lg:flex ${
          collapsed ? "w-rail-collapsed" : "w-rail"
        }`}
      >
        <div className={`flex h-16 shrink-0 items-center ${collapsed ? "justify-center" : "px-5"}`}>
          <NavLinkComponent to={brandHref} className="flex min-h-11 items-center gap-2.5 text-h3 tracking-tight text-ink">
            <BrandMark />
            <span className={collapsed ? "sr-only" : ""}>{brand}</span>
          </NavLinkComponent>
        </div>
        <nav aria-label="Main" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
          {navItems.map((item) => navLink(item, { compact: collapsed }))}
        </nav>
        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`flex min-h-11 w-full items-center gap-3 rounded-control px-3 text-small text-ink-muted hover:bg-surface-2 hover:text-ink ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {collapsed ? <PanelLeftOpen size={18} aria-hidden /> : <PanelLeftClose size={18} aria-hidden />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
        {accountBlock(collapsed)}
      </aside>

      {/* Phone / tablet drawer with the full menu */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            aria-hidden
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-scrim opacity-100 transition-opacity duration-200 starting:opacity-0"
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col border-r border-line bg-surface-1 shadow-e2 translate-x-0 transition-transform duration-200 starting:-translate-x-full"
          >
            <div className="flex h-16 shrink-0 items-center justify-between px-5">
              <span className="flex items-center gap-2.5 text-h3 tracking-tight">
                <BrandMark />
                {brand}
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-control text-ink-muted hover:bg-surface-2 hover:text-ink"
              >
                <X size={18} aria-hidden />
              </button>
            </div>
            <nav aria-label="Main" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
              {navItems.map((item) => navLink(item, { onNavigate: () => setDrawerOpen(false) }))}
            </nav>
            {accountBlock(false)}
          </div>
        </div>
      )}

      <div className={`flex min-h-screen flex-col transition-[padding] duration-200 ${collapsed ? "lg:pl-rail-collapsed" : "lg:pl-rail"}`}>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-line bg-surface-0/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            className={`-ml-2 h-11 w-11 items-center justify-center rounded-control text-ink hover:bg-surface-2 lg:hidden ${
              primaryItems.length ? "hidden sm:flex" : "flex"
            }`}
          >
            <Menu size={20} aria-hidden />
          </button>
          <NavLinkComponent to={brandHref} className="flex min-h-11 items-center gap-2 text-h3 tracking-tight sm:hidden">
            <BrandMark />
            <span>{brand}</span>
          </NavLinkComponent>

          {topBarStart}
          <div className="ml-auto flex min-w-0 items-center gap-1">
            {topBarExtras}
            <button
              type="button"
              onClick={toggle}
              aria-label={isDark ? "Use light theme" : "Use dark theme"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-control text-ink-soft hover:bg-surface-2 hover:text-ink"
            >
              {isDark ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
            </button>
          </div>
        </header>

        {banner}

        <main id="main" className="flex-1 px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:pb-12">
          <div className={`mx-auto w-full ${wide ? "max-w-[1600px]" : "max-w-content"}`}>{children}</div>
        </main>
      </div>

      {/* Phone bottom navigation */}
      {primaryItems.length > 0 && (
        <nav
          aria-label="Quick navigation"
          className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface-1 pb-[env(safe-area-inset-bottom)] sm:hidden"
        >
          <ul className="grid grid-cols-5">
            {primaryItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLinkComponent
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `relative flex h-16 flex-col items-center justify-center gap-1 text-caption font-medium ${
                        isActive ? "text-accent-ink" : "text-ink-muted"
                      }`
                    }
                  >
                    {Icon && <Icon size={20} aria-hidden />}
                    <span>{item.shortLabel || item.label}</span>
                    {item.badge ? (
                      <span className="absolute right-[calc(50%-18px)] top-2 h-2 w-2 rounded-full bg-accent" aria-label={`${item.badge} new`} />
                    ) : null}
                  </NavLinkComponent>
                </li>
              );
            })}
            <li>
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-expanded={drawerOpen}
                className="flex h-16 w-full flex-col items-center justify-center gap-1 text-caption font-medium text-ink-muted"
              >
                <Ellipsis size={20} aria-hidden />
                <span>More</span>
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

function Initials({ name = "" }) {
  const letters =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "A";
  return (
    <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-small font-semibold text-accent-ink">
      {letters}
    </span>
  );
}

/** The Arifcard mark: a small card silhouette in the accent colour. */
export function BrandMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false" className="shrink-0 text-accent">
      <rect x="2" y="5" width="20" height="14" rx="3.5" fill="currentColor" />
      <rect x="5" y="9" width="5" height="3.5" rx="1" fill="var(--ac-surface-1)" opacity="0.9" />
    </svg>
  );
}
