import { backendApi } from "@addiscard/services";

/**
 * Card issuer operations and events, for the Card operations screen.
 *
 * These admin endpoints already exist on the backend (routes/admin.routes.js)
 * but had no client. They live here, in the admin app's own data module,
 * rather than in packages/services (a frozen zone for the redesign). Same
 * API client, same bearer session; every route is still checked by
 * requireAuth + requireStaff, and reconcile/resolve need an administrator.
 */
const q = (status) => (status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "");

export const providerOps = {
  operations: (status) => backendApi.get(`/admin/provider/operations${q(status)}`, { auth: true }),
  reconcile: (operationId) => backendApi.post(`/admin/provider/operations/${encodeURIComponent(operationId)}/reconcile`, undefined, { auth: true }),
  /** `{ resolution: "SUCCEEDED" | "FAILED", reason (≥ 10 chars), providerRef? }` */
  resolve: (operationId, body) => backendApi.post(`/admin/provider/operations/${encodeURIComponent(operationId)}/resolve`, body, { auth: true }),
  events: (status) => backendApi.get(`/admin/provider/events${q(status)}`, { auth: true }),
  reprocess: (eventId) => backendApi.post(`/admin/provider/events/${encodeURIComponent(eventId)}/reprocess`, undefined, { auth: true }),
};

export const OPERATION_TONE = {
  QUEUED: "neutral",
  SUBMITTING: "info",
  SUCCEEDED: "success",
  FAILED: "danger",
  UNKNOWN: "warning",
  RECONCILING: "warning",
  NEEDS_REVIEW: "attention",
};

export const OPERATION_LABEL = {
  QUEUED: "Queued",
  SUBMITTING: "Submitting",
  SUCCEEDED: "Succeeded",
  FAILED: "Failed",
  UNKNOWN: "Outcome unknown",
  RECONCILING: "Asking the issuer",
  NEEDS_REVIEW: "Needs a person",
};

export const EVENT_TONE = {
  RECEIVED: "info",
  PROCESSING: "info",
  APPLIED: "success",
  IGNORED_STALE: "neutral",
  IGNORED_DUPLICATE: "neutral",
  UNMATCHED: "attention",
  UNHANDLED: "attention",
  NEEDS_REVIEW: "attention",
};

export const EVENT_LABEL = {
  RECEIVED: "Received",
  PROCESSING: "Processing",
  APPLIED: "Applied",
  IGNORED_STALE: "Ignored (older than current)",
  IGNORED_DUPLICATE: "Ignored (duplicate)",
  UNMATCHED: "No matching record",
  UNHANDLED: "Not handled",
  NEEDS_REVIEW: "Needs a person",
};
