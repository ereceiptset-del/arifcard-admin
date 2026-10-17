import { backendApi } from "@addiscard/services";

/**
 * Paged staff lists. The backend sorts newest-first BEFORE cutting a page
 * and answers `{ <rows>, pagination: { page, pageSize, total, totalPages,
 * hasPrevious, hasNext } }` (backend src/lib/paging.js).
 */
export const PAGE_SIZE = 20;

const qs = (params) => {
  const p = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "" && value !== "all") p.set(key, String(value));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
};
const get = (path, params) => backendApi.get(`${path}${qs({ pageSize: PAGE_SIZE, ...params })}`, { auth: true });
// Active / Archived / All: "all" is a real value here (qs drops it), so the view is added after.
const withView = (path, params, view) => {
  const base = qs({ pageSize: PAGE_SIZE, ...params });
  const extra = view && view !== "active" ? `${base ? "&" : "?"}view=${encodeURIComponent(view)}` : "";
  return backendApi.get(`${path}${base}${extra}`, { auth: true });
};

export const adminLists = {
  customers: ({ q, kycStatus, page }) => get("/admin/customers", { q, kycStatus, page }),
  kycCases: ({ status, q, page, view }) => withView("/admin/kyc/cases", { status, q, page }, view),
  paymentClaims: ({ status, page, view }) => withView("/admin/payments/claims", { status, page }, view),
  auditLog: ({ action, page }) => get("/admin/audit", { action, page }),
  notificationJobs: ({ status, page }) => get("/admin/notification-jobs", { status, page }),
  operations: ({ status, page }) => get("/admin/provider/operations", { status, page }),
  events: ({ status, page }) => get("/admin/provider/events", { status, page }),
};
