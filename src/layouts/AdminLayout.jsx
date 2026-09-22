import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, CreditCard, Banknote, Settings } from "lucide-react";
import { AppShell, DemoNotice, Badge } from "@addiscard/ui";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Customers", to: "/admin/customers", icon: Users },
  { label: "Cards", to: "/admin/cards", icon: CreditCard },
  { label: "Payments", to: "/admin/payments", icon: Banknote },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

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
      topBarExtras={<Badge tone="warn">No access control</Badge>}
      banner={
        <div className="border-b border-line dark:border-line-dark bg-panel-muted dark:bg-panel-dark px-4 sm:px-6 py-3">
          <div className="mx-auto max-w-content">
            <DemoNotice>
              There is no staff permission check yet: any account that can sign in can open this
              area. The records these screens read do not exist yet, so they show nothing rather
              than invented figures.
            </DemoNotice>
          </div>
        </div>
      }
    >
      <Outlet />
    </AppShell>
  );
}
