import { useCallback, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, ShieldCheck, CreditCard, Banknote, ArrowLeftRight, Bell, ScrollText, Settings, Search, BadgeCheck, Percent, ArrowUpFromLine } from "lucide-react";
import { AppShell, StatusPill } from "@addiscard/ui";
import { adminService } from "@addiscard/services";
import { useAuth } from "../context/AuthContext";
import { useAsync } from "../hooks/useAsync.js";

/**
 * The admin workspace.
 *
 * Every entry here routes to a real screen. A nav item that led nowhere,
 * or to a page of invented numbers, would be worse than one that is
 * absent — so the sections whose data is not built yet say so plainly on
 * arrival rather than being hidden or faked.
 *
 * The header carries the global customer search and, from the settings
 * endpoint, which card issuer environment this backend talks to — so no
 * one mistakes the sandbox for production.
 */
// Grouped by the work an operator does; each group has a label in the rail.
const NAV_ITEMS = [
  { label: "Overview", to: "/", icon: LayoutDashboard, end: true },
  { section: "Customers & verification", label: "Customers", to: "/customers", icon: Users },
  { section: "Customers & verification", label: "KYC verification", to: "/kyc", icon: ShieldCheck },
  { section: "Money & payments", label: "Payments", to: "/payments", icon: Banknote },
  { section: "Money & payments", label: "Top-up requests", to: "/top-ups", icon: ArrowUpFromLine },
  { section: "Cards", label: "Card issuance", to: "/card-issuance", icon: BadgeCheck },
  { section: "Cards", label: "Card operations", to: "/cards", icon: CreditCard },
  { section: "Cards", label: "Transactions", to: "/transactions", icon: ArrowLeftRight },
  { section: "Operations", label: "Notifications", to: "/notifications", icon: Bell },
  { section: "Operations", label: "Audit logs", to: "/audit", icon: ScrollText },
  { section: "Settings", label: "Pricing", to: "/pricing", icon: Percent },
  { section: "Settings", label: "Settings", to: "/settings", icon: Settings },
];

/** The signed-in staff member's role, as the backend reports it. */
const STAFF_ROLE_LABEL = { owner: "Owner", admin: "Administrator", reviewer: "Reviewer" };

/** "sandbox · host. …" → "sandbox"; anything else → null (shown as just the issuer). */
function issuerEnvironment(item) {
  if (!item || item.status !== "configured") return null;
  const first = String(item.detail || "").split(" · ")[0].trim().toLowerCase();
  return ["sandbox", "live", "production", "test"].includes(first) ? first : null;
}

/** Signed-in admin chrome. */
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const loadSettings = useCallback(() => adminService.settings(), []);
  const settings = useAsync(loadSettings, []);

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // Which card issuer and environment this backend uses, from configuration
  // only. A test environment is always marked, so no one mistakes it for live.
  const provider = settings.data?.configuration?.cardProvider;
  const environment = provider?.environment || issuerEnvironment(provider);
  const isTest = environment === "sandbox" || environment === "test";
  const issuerName = provider?.provider || "card issuer";
  const issuerChip = settings.data
    ? provider?.status === "configured"
      ? { tone: isTest ? "warning" : "success", label: `Card issuer: ${issuerName}${environment ? `, ${environment}` : ""}` }
      : { tone: "neutral", label: `Card issuer: ${issuerName}, not configured` }
    : settings.error
      ? { tone: "neutral", label: "Card issuer: unknown" }
      : null;

  const search = (event) => {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `/customers?q=${encodeURIComponent(q)}` : "/customers");
  };

  return (
    <AppShell
      wide
      brand="Arifcard Admin"
      brandHref="/"
      navItems={NAV_ITEMS}
      NavLinkComponent={NavLink}
      account={{ name: user?.fullName || "Staff member", secondary: user?.email }}
      onSignOut={handleSignOut}
      topBarStart={
        <form role="search" onSubmit={search} className="hidden min-w-0 max-w-md flex-1 md:block">
          <label htmlFor="admin-search" className="sr-only">
            Search customers by name or email
          </label>
          <div className="relative">
            <Search size={16} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              id="admin-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search customers by name or email"
              className="h-11 w-full rounded-control border border-line-strong bg-surface-1 pl-9 pr-3 text-small text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/25"
            />
          </div>
        </form>
      }
      topBarExtras={
        <div className="flex items-center gap-2">
          {issuerChip && (
            <span className="hidden lg:inline-flex">
              <StatusPill tone={issuerChip.tone} icon={null}>
                {issuerChip.label}
              </StatusPill>
            </span>
          )}
          {/* Small screens: the environment alone, never hidden. */}
          {isTest && (
            <span className="inline-flex lg:hidden">
              <StatusPill tone="warning" icon={null}>
                Sandbox
              </StatusPill>
            </span>
          )}
          <StatusPill tone="accent">{STAFF_ROLE_LABEL[user?.staffRole] || "Staff"}</StatusPill>
        </div>
      }
    >
      <Outlet />
    </AppShell>
  );
}
