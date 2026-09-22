import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as authService from "../services/authService";
import { getStoredToken } from "../services/api";
import { setCurrentUser } from "@addiscard/services";

const AuthContext = createContext(null);

/**
 * Holds the signed-in user (if any) for the whole app. On mount, if a
 * session token is already in storage, it's validated against
 * GET /api/auth/me — a stale/expired/tampered token is cleared silently
 * rather than surfaced as an error, since "not signed in" is the correct
 * fallback state either way.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function rehydrate() {
      if (!getStoredToken()) {
        setIsLoading(false);
        return;
      }
      try {
        const { user: me } = await authService.getMe();
        if (!cancelled) {
          setUser(me);
          // The dashboards' demo store keys its data by account.
          setCurrentUser(me);
        }
      } catch {
        authService.logout();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    rehydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await authService.login(credentials);
    setUser(result.user);
    setCurrentUser(result.user);
    return result;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: Boolean(user), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
