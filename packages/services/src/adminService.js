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
  staff: (options) => backendApi.get("/admin/staff", { ...options, auth: true }),

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

  auditLog: ({ action } = {}, options) => {
    const query = action && action !== "all" ? `?action=${encodeURIComponent(action)}` : "";
    return backendApi.get(`/admin/audit${query}`, { ...options, auth: true });
  },

  // Not built. There is no ledger behind these yet, so they refuse rather
  // than returning records that are not real.
  cards: unavailable("Card records"),
  transactions: unavailable("Transactions"),
};
