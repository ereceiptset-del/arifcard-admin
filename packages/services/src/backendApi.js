import { ApiError } from "./apiClient.js";

/**
 * Client for the real Arifcard backend (backend/src).
 *
 * Accounts, passwords and email verification are handled by the backend on
 * :4000. This is the only client that talks to it.
 *
 * The session token is kept in localStorage under the same key the main web
 * app uses, so the two stay consistent and a sign-in survives a reload.
 */
const DEFAULT_BASE_URL = "http://localhost:4000/api";
const TOKEN_STORAGE_KEY = "addiscard_token";

/**
 * Where the API is.
 *
 * VITE_API_BASE_URL is the one setting for every API call — the sign-in
 * client (src/services/api.js) reads it too, and production sets it to
 * "/api" (Firebase Hosting rewrites that to the backend function).
 * VITE_BACKEND_API_URL still wins if someone sets it deliberately.
 *
 * Before this, production builds had no VITE_BACKEND_API_URL, so every
 * screen after sign-in called http://localhost:4000 — the visitor's own
 * computer — while sign-in itself worked.
 */
function baseUrl() {
  try {
    return import.meta.env?.VITE_BACKEND_API_URL || import.meta.env?.VITE_API_BASE_URL || DEFAULT_BASE_URL;
  } catch {
    return DEFAULT_BASE_URL;
  }
}

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null; // private browsing or blocked storage — session just won't persist
  }
}

export function setStoredToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // ignore — same reasoning as getStoredToken
  }
}

async function request(path, { method = "GET", body, signal, auth = false } = {}) {
  const init = { method, signal, headers: {} };
  if (body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  if (auth) {
    const token = getStoredToken();
    if (token) init.headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${baseUrl()}${path}`, init);
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiError("Can't reach the Arifcard server. Start the backend and try again.", {
      status: 0,
      code: "NETWORK_ERROR",
    });
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // Empty or non-JSON body.
  }

  if (!response.ok) {
    // Carry every detail the server chose to send, not just the headline.
    // Dropping `problems` here turned a precise answer — "you must be at
    // least 18" — into a bare "Some details are still missing.", because
    // the page only lists problems when this field is present.
    throw new ApiError(payload?.error?.message || "Request failed.", {
      status: response.status,
      code: payload?.error?.code,
      problems: payload?.error?.problems,
    });
  }

  return payload;
}

export const backendApi = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
  del: (path, options) => request(path, { ...options, method: "DELETE" }),
};
