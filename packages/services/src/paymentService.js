import { backendApi } from "./backendApi.js";

/**
 * Payments by receipt token.
 *
 * The customer pays through CBE or Telebirr themselves, then tells us
 * what they paid and gives us the receipt token. The server reads the
 * receipt from the provider and decides; this client only ever sends the
 * token and the customer's account of the payment — never a URL, and
 * never a status.
 */

export const PAYMENT_METHOD = {
  CBE: "CBE",
  TELEBIRR: "TELEBIRR",
};

/** A payment's status. Set by the server only. */
export const PAYMENT_STATUS = {
  AWAITING_PAYMENT: "AWAITING_PAYMENT",
  VERIFYING: "VERIFYING",
  VERIFIED: "VERIFIED",
  REQUIRES_REVIEW: "REQUIRES_REVIEW",
  REJECTED_EVIDENCE: "REJECTED_EVIDENCE",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
};

/** Kept as names for older imports; payments and claims share statuses. */
export const INTENT_STATUS = PAYMENT_STATUS;
export const CLAIM_STATUS = PAYMENT_STATUS;

export const PAYMENT_STATUS_LABEL = {
  AWAITING_PAYMENT: "Awaiting payment",
  VERIFYING: "Verifying",
  VERIFIED: "Verified",
  REQUIRES_REVIEW: "With our team",
  REJECTED_EVIDENCE: "Receipt not accepted",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};
export const CLAIM_STATUS_LABEL = PAYMENT_STATUS_LABEL;

/** Tones are the Badge palette's own names, so a typo renders unstyled. */
export const PAYMENT_STATUS_TONE = {
  AWAITING_PAYMENT: "neutral",
  VERIFYING: "info",
  VERIFIED: "ok",
  REQUIRES_REVIEW: "info",
  REJECTED_EVIDENCE: "danger",
  CANCELLED: "neutral",
  EXPIRED: "neutral",
};
export const CLAIM_STATUS_TONE = PAYMENT_STATUS_TONE;

/**
 * Reasons after which "check again" can help: the provider was
 * unreachable. Everything else needs a different receipt or a person.
 */
export const RETRYABLE_REASONS = ["SOURCE_UNAVAILABLE", "PROVIDER_NOT_CONFIGURED"];
export const RETRYABLE = [PAYMENT_STATUS.VERIFYING];

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

  /**
   * The customer's account of the payment, and the receipt token last.
   * Only the token identifies the receipt; the server builds the URL.
   */
  submitClaim: (intentId, { payerName, payerPhone, payerAccount, claimedAmountBirr, claimedPaidAt, message, token }) =>
    backendApi.post(
      `/payments/intents/${intentId}/claims`,
      { payerName, payerPhone, payerAccount, claimedAmountBirr, claimedPaidAt, message, token },
      { auth: true }
    ),

  recheckClaim: (claimId) =>
    backendApi.post(`/payments/claims/${claimId}/recheck`, undefined, { auth: true }),
};
