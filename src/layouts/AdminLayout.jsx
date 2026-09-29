import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CreditCard,
  PackageOpen,
  Banknote,
  ArrowLeftRight,
  Bell,
  ScrollText,
  Settings,
} from "lucide-react";
import { AppShell, DemoNotice, Badge } from "@addiscard/ui";
import { useAuth } from "../context/AuthContext";

/**
 * The admin workspace.
 *
 * Every entry here routes to a real screen. A nav item that led nowhere,
 * or to a page of invented numbers, would be worse than one that is
 * absent — so the sections whose data is not built yet say so plainly on
 * arrival rather than being hidden or faked.
 */
const NAV_ITEMS = [
  { label: "Overview", to: "/", icon: LayoutDashboard, end: true },
  { label: "Customers", to: "/customers", icon: Users },
  { label: "Identity verification", to: "/kyc", icon: ShieldCheck },
  { label: "Payments", to: "/payments", icon: Banknote },
  { label: "Transactions", to: "/transactions", icon: ArrowLeftRight },
  { label: "Card orders", to: "/card-orders", icon: PackageOpen },
  { label: "Cards", to: "/cards", icon: CreditCard },
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Audit logs", to: "/audit", icon: ScrollText },
  { label: "Settings", to: "/settings", icon: Settings },
];

/** The signed-in staff member's role, as the backend reports it. */
const STAFF_ROLE_LABEL = { owner: "Owner", admin: "Administrator", reviewer: "Reviewer" };

/** Signed-in admin chrome. */
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <AppShell
      brand="Arifcard Admin"
      brandHref="/"
      navItems={NAV_ITEMS}
      NavLinkComponent={NavLink}
      account={{ name: user?.fullName || "Admin", secondary: user?.email }}
      onSignOut={handleSignOut}
      topBarExtras={<Badge tone="neutral">{STAFF_ROLE_LABEL[user?.staffRole] || "Staff"}</Badge>}
      banner={
        <div className="border-b border-line dark:border-line-dark bg-panel-muted dark:bg-panel-dark px-4 sm:px-6 py-3">
          <div className="mx-auto max-w-content">
            <DemoNotice>
              Staff only: every request here is checked against your active staff record, and
              customers are refused. Screens whose records do not exist yet (such as card
              transactions) show nothing rather than invented figures.
            </DemoNotice>
          </div>
        </div>
      }
    >
      <Outlet />
    </AppShell>
  );
}
