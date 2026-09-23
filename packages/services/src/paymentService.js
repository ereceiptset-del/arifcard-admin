import { backendApi } from "./backendApi.js";

/**
 * Payments by receipt token.
 *
 * The customer pays through CBE or Telebirr themselves, then gives us the
 * receipt number. Nothing here moves money, and nothing here can tell the
 * customer their balance changed — verifying a receipt and crediting an
 * account are different things, and only the first exists.
 */

export const PAYMENT_METHOD = {
  CBE: "CBE",
  TELEBIRR: "TELEBIRR",
};

export const INTENT_STATUS = {
  AWAITING_CLAIM: "AWAITING_CLAIM",
  CLAIMED: "CLAIMED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
};

export const CLAIM_STATUS = {
  SUBMITTED: "SUBMITTED",
  CHECKING: "CHECKING",
  VERIFIED: "VERIFIED",
  MISMATCHED: "MISMATCHED",
  NOT_FOUND: "NOT_FOUND",
  UNREADABLE: "UNREADABLE",
  PROVIDER_ERROR: "PROVIDER_ERROR",
  REJECTED: "REJECTED",
};

export const CLAIM_STATUS_LABEL = {
  SUBMITTED: "Checking",
  CHECKING: "Checking",
  VERIFIED: "Receipt matched",
  MISMATCHED: "Does not match",
  NOT_FOUND: "Receipt not found",
  UNREADABLE: "Needs a person",
  PROVIDER_ERROR: "Could not reach provider",
  REJECTED: "Rejected",
};

/** Tones are the Badge palette's own names, so a typo renders unstyled. */
export const CLAIM_STATUS_TONE = {
  SUBMITTED: "neutral",
  CHECKING: "neutral",
  VERIFIED: "ok",
  MISMATCHED: "warn",
  NOT_FOUND: "warn",
  UNREADABLE: "warn",
  // Ours to fix, not the customer's — informational rather than a warning
  // aimed at them.
  PROVIDER_ERROR: "info",
  REJECTED: "danger",
};

/**
 * Which outcomes the customer can do something about themselves.
 *
 * A provider we could not reach, or a number that matched nothing, are
 * worth another go. A receipt for the wrong amount is not — retrying it
 * would produce the same answer and waste the customer's time.
 */
export const RETRYABLE = [CLAIM_STATUS.NOT_FOUND, CLAIM_STATUS.PROVIDER_ERROR];

/** Cents to a birr string. The server is the only place that does maths. */
export const birr = (minor) =>
  `${(Number(minor || 0) / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ETB`;

export const paymentService = {
  methods: () => backendApi.get("/payments/methods", { auth: true }),
  listIntents: () => backendApi.get("/payments/intents", { auth: true }),
  getIntent: (intentId) => backendApi.get(`/payments/intents/${intentId}`, { auth: true }),

  /**
   * `amountBirr` is sent as the customer typed it. Converting to cents in
   * the browser would mean trusting the browser's arithmetic with
   * somebody's money; the server parses and converts, once.
   */
  createIntent: ({ method, amountBirr }) =>
    backendApi.post("/payments/intents", { method, amountBirr }, { auth: true }),

  cancelIntent: (intentId) =>
    backendApi.post(`/payments/intents/${intentId}/cancel`, undefined, { auth: true }),

  submitClaim: (intentId, token) =>
    backendApi.post(`/payments/intents/${intentId}/claims`, { token }, { auth: true }),

  recheckClaim: (claimId) =>
    backendApi.post(`/payments/claims/${claimId}/recheck`, undefined, { auth: true }),
};
