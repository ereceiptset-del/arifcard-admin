import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Keeps non-staff out of the staff area.
 *
 * This is a courtesy, not a control. `isStaff` comes from /auth/me, which
 * resolves it from the Firebase claim and the active staff record — but a
 * browser can be told anything. Every staff endpoint re-checks on the
 * server, and that is what actually protects the data.
 */
export default function RequireStaff({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] dark:bg-[#080C16]">
        <div className="w-8 h-8 rounded-full border-2 border-[#8055FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user?.isStaff) return <Navigate to="/customer" replace />;

  return children;
}
