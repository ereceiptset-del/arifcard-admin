import { Link, Navigate } from "react-router-dom";
import { ShieldAlert, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/**
 * Keeps non-staff out of the staff area.
 *
 * This is a courtesy, not a control. `isStaff` comes from `/auth/me`,
 * which resolves it from the Firebase claim and the active staff record —
 * but a browser can be told anything. Every staff endpoint re-checks on
 * the server, and that is what actually protects the data.
 *
 * Two things it is careful about:
 *
 * **Nothing private renders while the answer is unknown.** The loading
 * state returns early rather than rendering children optimistically, so
 * there is no moment where admin content is on screen before the check
 * finishes.
 *
 * **A signed-in customer is told they were refused**, rather than being
 * bounced to `/customer` as if they had mistyped. A silent redirect from
 * a link someone was given looks like a broken link; being told the
 * answer is "no" is the truth and is easier to act on.
 */
export default function RequireStaff({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#F8F9FB] dark:bg-[#080C16]">
        <Loader2 className="h-7 w-7 animate-spin text-brand" aria-hidden="true" />
        <p className="text-[13px] text-ink-muted dark:text-ink-muted-dark" role="status">
          Checking your access…
        </p>
      </div>
    );
  }

  // Not signed in at all: that is a sign-in problem, not a permissions
  // one, so send them somewhere they can fix it.
  if (!user) return <Navigate to="/login" replace />;

  if (!user.isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] dark:bg-[#080C16] px-4">
        <div className="w-full max-w-md rounded-panel border border-line dark:border-line-dark bg-panel dark:bg-panel-dark p-8 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-danger/10 text-danger">
            <ShieldAlert size={20} aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-[17px] font-semibold text-ink dark:text-ink-dark">Access denied</h1>
          <p className="mt-2 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
            You are signed in, but this account does not have administrator access. Being signed in is not
            enough on its own.
          </p>
          <p className="mt-3 text-[12.5px] text-ink-faint">
            If you believe this is wrong, ask whoever administers Arifcard. Access is granted from the server
            and cannot be requested from this page.
          </p>
          <div className="mt-6">
            <Link
              to="/customer"
              className="inline-flex items-center justify-center rounded-field bg-brand px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-hover transition-colors"
            >
              Go to your account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
