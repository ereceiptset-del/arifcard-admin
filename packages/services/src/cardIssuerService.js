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

  /** { orders, eligiblePayments } — the customer's card orders, and verified payments not yet used. */
  cardOrders: (options) => backendApi.get("/card-issuer/card-orders", { ...options, auth: true }),
  /** Orders a card paid by one verified payment. Ordering the same payment again returns the same order. */
  orderCard: (paymentIntentId) => backendApi.post("/card-issuer/card-orders", { paymentIntentId }, { auth: true }),
  /** Issues the card for a funded order. The backend decides everything else. */
  issueCard: (orderId) => backendApi.post(`/card-issuer/card-orders/${encodeURIComponent(orderId)}/issue`, undefined, { auth: true }),
  refreshCard: (orderId) => backendApi.post(`/card-issuer/card-orders/${encodeURIComponent(orderId)}/refresh`, undefined, { auth: true }),
};

export const CARD_ORDER_LABEL = {
  AWAITING_FUNDING: "Preparing funds",
  READY_TO_ISSUE: "Ready to issue",
  ISSUING: "Issuing",
  ISSUED: "Issued",
  ISSUE_FAILED: "Could not issue",
  REQUIRES_REVIEW: "Being checked",
  REFUND_REQUIRED: "Refund in progress",
  CANCELED: "Canceled",
};

export const CARD_ORDER_TONE = {
  AWAITING_FUNDING: "info",
  READY_TO_ISSUE: "ok",
  ISSUING: "info",
  ISSUED: "ok",
  ISSUE_FAILED: "danger",
  REQUIRES_REVIEW: "warn",
  REFUND_REQUIRED: "warn",
  CANCELED: "neutral",
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
