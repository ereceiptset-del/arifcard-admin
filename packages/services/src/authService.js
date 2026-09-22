import { backendApi, setStoredToken, getStoredToken } from "./backendApi.js";

/**
 * Sign-in against the real backend.
 *
 * Accounts, passwords and email verification are the backend's job.
 *
 * There are no roles here. The backend has no staff permissions yet, so
 * the reviewer console gates on being signed in and nothing more — see the
 * notice on its settings screen.
 */
export const authService = {
  async login({ email, password }) {
    const data = await backendApi.post("/auth/login", { email, password });
    setStoredToken(data.token);
    return data;
  },

  /**
   * Creates the account. It does not sign anyone in: the backend emails a
   * 6-digit code and the account stays inactive until it is entered.
   */
  register: ({ fullName, email, password }) =>
    backendApi.post("/auth/register", { fullName, email, password }),

  async me(options) {
    return backendApi.get("/auth/me", { ...options, auth: true });
  },

  async logout() {
    setStoredToken(null);
  },

  hasStoredSession: () => Boolean(getStoredToken()),
};
