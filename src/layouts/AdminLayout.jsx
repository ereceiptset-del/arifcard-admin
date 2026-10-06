import { useCallback, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, ShieldCheck, CreditCard, Banknote, ArrowLeftRight, Bell, ScrollText, Settings, Search, BadgeCheck } from "lucide-react";
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
const NAV_ITEMS = [
  { label: "Overview", to: "/", icon: LayoutDashboard, end: true },
  { label: "Customers", to: "/customers", icon: Users },
  { label: "KYC verification", to: "/kyc", icon: ShieldCheck },
  { label: "Payments", to: "/payments", icon: Banknote },
  { label: "Transactions", to: "/transactions", icon: ArrowLeftRight },
  { label: "Card issuance", to: "/card-issuance", icon: BadgeCheck },
  { label: "Card operations", to: "/cards", icon: CreditCard },
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Audit logs", to: "/audit", icon: ScrollText },
  { label: "Settings", to: "/settings", icon: Settings },
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

  const provider = settings.data?.configuration?.cardProvider;
  const environment = issuerEnvironment(provider);
  const issuerChip = settings.data
    ? provider?.status === "configured"
      ? { tone: environment === "sandbox" || environment === "test" ? "warning" : "success", label: `Issuer: Codego${environment ? `, ${environment}` : ""}` }
      : { tone: "neutral", label: "Issuer: not configured" }
    : settings.error
      ? { tone: "neutral", label: "Issuer: unknown" }
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
          <StatusPill tone="accent">{STAFF_ROLE_LABEL[user?.staffRole] || "Staff"}</StatusPill>
        </div>
      }
    >
      <Outlet />
    </AppShell>
  );
}
