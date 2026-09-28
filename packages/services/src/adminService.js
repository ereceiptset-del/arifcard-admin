import { backendApi } from "./backendApi.js";
import { unavailable } from "./unavailable.js";

/**
 * Staff console.
 *
 * Identity review and payment claims are real and backed by the API.
 * Cards are not built, so that one refuses rather than showing invented
 * records.
 */
export const adminService = {
  overview: (options) => backendApi.get("/admin/overview", { ...options, auth: true }),

  /**
   * Counted from the records on every call.
   *
   * Metrics come back as `{ available, value }` or `{ available: false,
   * reason }` rather than bare numbers, so a figure that could not be
   * computed cannot be rendered as zero by accident.
   */
  analytics: ({ period = "7d", from, to, provider } = {}, options) => {
    const params = new URLSearchParams({ period });
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (provider && provider !== "all") params.set("provider", provider);
    return backendApi.get(`/admin/analytics?${params}`, { ...options, auth: true });
  },

  customers: ({ q, kycStatus } = {}, options) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (kycStatus && kycStatus !== "all") params.set("kycStatus", kycStatus);
    const query = params.toString();
    return backendApi.get(`/admin/customers${query ? `?${query}` : ""}`, { ...options, auth: true });
  },
  customer: (uid, options) => backendApi.get(`/admin/customers/${uid}`, { ...options, auth: true }),

  /** Card-issuer onboarding for one customer — separate from Arifcard's KYC. */
  issuerOnboarding: (uid, options) =>
    backendApi.get(`/admin/provider/customers/${encodeURIComponent(uid)}`, { ...options, auth: true }),
  /** Reads the state back from the issuer now. Administrators only (enforced by the backend). */
  refreshIssuerOnboarding: (uid) =>
    backendApi.post(`/admin/provider/customers/${encodeURIComponent(uid)}/refresh`, undefined, { auth: true }),
  staff: (options) => backendApi.get("/admin/staff", { ...options, auth: true }),

  /** Whether each thing is configured. Never what it is configured to. */
  settings: (options) => backendApi.get("/admin/settings", { ...options, auth: true }),

  kycCases: ({ status, q } = {}, options) => {
    const params = new URLSearchParams();
    if (status && status !== "all") params.set("status", status);
    if (q) params.set("q", q);
    const query = params.toString();
    return backendApi.get(`/admin/kyc/cases${query ? `?${query}` : ""}`, { ...options, auth: true });
  },
  kycCase: (caseId, options) => backendApi.get(`/admin/kyc/cases/${caseId}`, { ...options, auth: true }),
  /**
   * Returns a short-lived signed URL, not the bytes. The browser fetches
   * the file straight from Cloud Storage, so evidence never passes through
   * this API or its logs.
   */
  kycEvidence: (caseId, slot, options) =>
    backendApi.get(`/admin/kyc/cases/${caseId}/evidence/${slot}`, { ...options, auth: true }),
  claimCase: (caseId) => backendApi.post(`/admin/kyc/cases/${caseId}/claim`, undefined, { auth: true }),
  addNote: (caseId, body) => backendApi.post(`/admin/kyc/cases/${caseId}/notes`, { body }, { auth: true }),
  decide: (caseId, payload) =>
    backendApi.post(`/admin/kyc/cases/${caseId}/decision`, payload, { auth: true }),

  notificationJobs: (options) => backendApi.get("/admin/notification-jobs", { ...options, auth: true }),
  retryJob: (jobId, { acknowledgeDuplicateRisk = false } = {}) =>
    backendApi.post(`/admin/notification-jobs/${jobId}/retry`, { acknowledgeDuplicateRisk }, { auth: true }),

  /**
   * Payment claims.
   *
   * Staff see the diagnostic and the attempt count, never the receipt
   * token. `recheck` re-reads the same receipt — useful once a parser has
   * been corrected — rather than asking a customer to submit a receipt
   * they have already given us.
   */
  paymentClaims: ({ status } = {}, options) => {
    const query = status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
    return backendApi.get(`/admin/payments/claims${query}`, { ...options, auth: true });
  },
  paymentClaim: (claimId, options) =>
    backendApi.get(`/admin/payments/claims/${claimId}`, { ...options, auth: true }),
  recheckClaim: (claimId) =>
    backendApi.post(`/admin/payments/claims/${claimId}/recheck`, undefined, { auth: true }),
  /**
   * Verify, reject or ask for clarification. Reason required; the server
   * checks role, self-review and duplicates. There is no "set status".
   */
  decidePaymentClaim: (claimId, { action, reason, customerMessage, canonicalTransactionId }) =>
    backendApi.post(
      `/admin/payments/claims/${claimId}/decision`,
      { action, reason, customerMessage, canonicalTransactionId },
      { auth: true }
    ),

  auditLog: ({ action } = {}, options) => {
    const query = action && action !== "all" ? `?action=${encodeURIComponent(action)}` : "";
    return backendApi.get(`/admin/audit${query}`, { ...options, auth: true });
  },

  // Not built. There is no ledger and no card provider behind these, so
  // they refuse rather than returning records that are not real.
  cards: unavailable("Card records"),
  transactions: unavailable("Transactions"),
};
