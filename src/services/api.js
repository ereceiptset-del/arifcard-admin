/**
 * Thin fetch wrapper for the Addiscard backend (see backend/src/app.js).
 * Every non-2xx response is turned into an ApiError carrying the same
 * `message`/`code` the backend's error middleware sends, so callers can
 * show the message directly or branch on `code` (e.g. EMAIL_NOT_VERIFIED).
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
const TOKEN_STORAGE_KEY = "addiscard_token";

export class ApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null; // private browsing / storage disabled — session just won't persist
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore — same reasoning as getStoredToken
  }
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getStoredToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", {
      status: 0,
      code: "NETWORK_ERROR",
    });
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // No/invalid JSON body (e.g. a 204 or a proxy error page) — data stays null.
  }

  if (!response.ok) {
    const message = data?.error?.message || "Something went wrong. Please try again.";
    throw new ApiError(message, { status: response.status, code: data?.error?.code });
  }

  return data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
};
