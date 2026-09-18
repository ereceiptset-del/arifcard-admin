import { api, getStoredToken, setStoredToken } from "./api";

/** Maps 1:1 to the backend's POST /api/auth/register (backend/src/routes/auth.routes.js). */
export function register({ fullName, email, password }) {
  return api.post("/auth/register", { fullName, email, password });
}

/** POST /api/auth/verify-email */
export function verifyEmail({ email, code }) {
  return api.post("/auth/verify-email", { email, code });
}

/** POST /api/auth/login — persists the returned session token on success. */
export async function login({ email, password }) {
  const result = await api.post("/auth/login", { email, password });
  setStoredToken(result.token);
  return result;
}

/** POST /api/auth/forgot-password — always resolves the same way, existing account or not. */
export function forgotPassword({ email }) {
  return api.post("/auth/forgot-password", { email });
}

/** POST /api/auth/reset-password */
export function resetPassword({ email, code, newPassword }) {
  return api.post("/auth/reset-password", { email, code, newPassword });
}

/** GET /api/auth/me — requires a stored session token. */
export function getMe() {
  return api.get("/auth/me", { auth: true });
}

export function logout() {
  setStoredToken(null);
}

export function isAuthenticated() {
  return Boolean(getStoredToken());
}
