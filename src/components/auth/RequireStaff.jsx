import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ShieldAlert, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/**
 * The customer site. A fixed destination from build configuration — never
 * taken from a query string, and no session or token is ever handed to it.
 */
const CUSTOMER_SITE_URL = import.meta.env.VITE_CUSTOMER_SITE_URL || "https://addiscard-1a9bc.web.app";

/**
 * Keeps non-staff out of the console.
 *
 * This is a courtesy, not a control. `isStaff` comes from `/auth/me`,
 * which resolves it from the Firebase claim and the active staff record —
 * but a browser can be told anything. Every staff endpoint re-checks on
 * the server, and that is what actually protects the data.
 *
 * **Nothing private renders while the answer is unknown.** The loading
 * state returns early rather than rendering children optimistically.
 *
 * **A signed-in customer is told they were refused**, and can sign out
 * here: their session on this site is useless to them and should not
 * linger. The customer site is linked, not handed a session.
 */
export default function RequireStaff({ children }) {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-surface-0">
        <Loader2 className="h-7 w-7 animate-spin text-link" aria-hidden="true" />
        <p className="text-small text-ink-muted" role="status">
          Checking your access…
        </p>
      </div>
    );
  }

  // Not signed in: send them to sign in, and back here afterwards.
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  if (!user.isStaff) {
    const signOut = () => {
      logout();
      navigate("/login", { replace: true });
    };
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-0 px-4">
        <div className="w-full max-w-md rounded-panel border border-line bg-surface-1 p-8 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-danger/10 text-danger">
            <ShieldAlert size={20} aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-h2 text-ink">Access denied</h1>
          <p className="mt-2 text-small text-ink-muted">
            You are signed in, but this account does not have administrator access. Being signed in is not
            enough on its own.
          </p>
          <p className="mt-3 text-small text-ink-muted">
            If you believe this is wrong, ask whoever administers Arifcard. Access is granted from the server
            and cannot be requested from this page.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center justify-center rounded-field bg-accent px-4 min-h-11 text-small font-semibold text-on-accent hover:bg-accent-hover transition-colors"
            >
              Sign out
            </button>
            <a href={CUSTOMER_SITE_URL} rel="noopener" className="text-small text-link hover:underline">
              Go to the Arifcard customer site
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
