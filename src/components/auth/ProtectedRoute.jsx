import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Guards the customer application.
 *
 * Two separate questions, answered in order.
 *
 * **Are we still finding out?** While the session is being rehydrated
 * nothing renders — returning early rather than optimistically, so no
 * private screen appears before the answer is known.
 *
 * **Is this a customer at all?** Staff are sent to their own workspace.
 * An owner or reviewer is not a customer: they have no wallet, no
 * verification of their own to complete, and the screens here would
 * either be empty or invite them to start a case they are not allowed to
 * review. Sending them to `/admin` keeps each account in one place, and
 * removes the trap of an owner submitting a case only to find that
 * self-review is refused.
 *
 * Authorization still lives on the server. This chooses which workspace
 * to show; it does not decide what anyone may read or do.
 */
export default function ProtectedRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] dark:bg-[#080C16]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#8055FF] border-t-transparent animate-spin" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Accessing Arifcard portal...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.isStaff) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
