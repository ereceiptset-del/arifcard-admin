import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * ProtectedRoute
 * 
 * Guards private routes. If the user authentication state is still loading
 * from session rehydration, shows an understated branded spinner.
 * If unauthenticated, navigates to /login with the intended destination
 * saved in route state.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
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

  return children;
}
