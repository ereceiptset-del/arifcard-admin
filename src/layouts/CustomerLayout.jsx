import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Home, Wallet, CreditCard, ShieldCheck, Settings, Bell } from "lucide-react";
import { AppShell, DemoNotice } from "@addiscard/ui";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { label: "Home", to: "/customer", icon: Home, end: true },
  { label: "Wallet", to: "/customer/wallet", icon: Wallet },
  { label: "Cards", to: "/customer/cards", icon: CreditCard },
  { label: "Verification", to: "/customer/verification", icon: ShieldCheck },
  { label: "Settings", to: "/customer/settings", icon: Settings },
];

/** Signed-in customer chrome, built on the shared AppShell. */
export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <AppShell
      brand="Arifcard"
      brandHref="/"
      navItems={NAV_ITEMS}
      NavLinkComponent={NavLink}
      account={{ name: user?.fullName || "Account", secondary: user?.email }}
      onSignOut={handleSignOut}
      topBarExtras={
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-10 w-10 items-center justify-center rounded-field text-ink-soft dark:text-ink-muted-dark hover:bg-panel-muted dark:hover:bg-white/5 transition-colors"
        >
          <Bell size={18} />
        </button>
      }
      banner={
        <div className="border-b border-line dark:border-line-dark bg-panel-muted dark:bg-panel-dark px-4 sm:px-6 py-3">
          <div className="mx-auto max-w-content">
            <DemoNotice>
              Wallet, cards and transactions are not built yet. Those screens say so rather than
              showing a balance, and no real money moves anywhere in this app.
            </DemoNotice>
          </div>
        </div>
      }
    >
      <Outlet />
    </AppShell>
  );
}
