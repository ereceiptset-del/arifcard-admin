import { backendApi } from "./backendApi.js";
import { unavailable } from "./unavailable.js";

/**
 * Staff console.
 *
 * Identity review is real and backed by the API. Cards and payments are
 * not built, so they refuse rather than showing invented records.
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

  // Not built.
  cards: unavailable("Card records"),
  payments: unavailable("Payment records"),
};
