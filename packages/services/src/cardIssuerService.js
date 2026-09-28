import { backendApi } from "./backendApi.js";

/**
 * Onboarding with the card issuer (Codego), customer side.
 *
 * Separate from Arifcard's own identity review: that one must be approved
 * first, and this one is done inside the issuer's hosted page. Nothing
 * here decides anything — the state always comes from the backend, which
 * learns it from the issuer (webhook or lookup), never from this browser.
 */
export const cardIssuerService = {
  onboarding: (options) => backendApi.get("/card-issuer/onboarding", { ...options, auth: true }),
  /** Returns { iframeUrl, kycOrigin, pending, onboarding }. The URL is one-time: keep it in memory only. */
  startSession: () => backendApi.post("/card-issuer/onboarding/session", undefined, { auth: true }),
  refresh: () => backendApi.post("/card-issuer/onboarding/refresh", undefined, { auth: true }),
};

/**
 * The only origins the hosted verification page may be embedded from or
 * send messages from. The backend checks the URL too; this is the second
 * lock, in the browser.
 */
export const ISSUER_KYC_ORIGINS = ["https://kyc-sandbox.codegotech.com", "https://kyc-live.codegotech.com"];

export const ISSUER_ONBOARDING_LABEL = {
  NOT_STARTED: "Not started",
  STARTING: "Preparing",
  SESSION_OPEN: "In progress",
  SUBMITTED: "With the issuer",
  ACTION_REQUIRED: "Action needed",
  APPROVED: "Verified",
  DENIED: "Not verified",
  LOCKED: "On hold",
  EXPIRED: "Link expired",
  CANCELED: "Withdrawn",
  UNKNOWN_STATE: "Checking",
};

export const ISSUER_ONBOARDING_TONE = {
  NOT_STARTED: "neutral",
  STARTING: "info",
  SESSION_OPEN: "info",
  SUBMITTED: "info",
  ACTION_REQUIRED: "warn",
  APPROVED: "ok",
  DENIED: "danger",
  LOCKED: "danger",
  EXPIRED: "warn",
  CANCELED: "neutral",
  UNKNOWN_STATE: "neutral",
};
