import { backendApi } from "@addiscard/services";

/**
 * Record management (backend docs/RECORD_MANAGEMENT.md). Every call goes to
 * the staff-protected backend, which reloads the record and re-runs the
 * policy; nothing here decides what is allowed. The browser names only a
 * record type from the backend's fixed list and an id.
 */
export const RECORD_TYPES = ["kyc_case", "payment", "card_transaction", "card_operation", "funding_instruction"];

const path = (type, id) => `/admin/records/${encodeURIComponent(type)}/${encodeURIComponent(id)}`;

export const recordsApi = {
  /** Summary, archive state, full capabilities with reasons, and audit history. */
  status: (type, id) => backendApi.get(path(type, id), { auth: true }),
  /** Read-only impact analysis before a permanent delete. */
  preview: (type, id) => backendApi.post(`${path(type, id)}/deletion-preview`, {}, { auth: true }),
  archive: (type, id, reason) => backendApi.post(`${path(type, id)}/archive`, { reason }, { auth: true }),
  restore: (type, id, reason) => backendApi.post(`${path(type, id)}/restore`, { reason }, { auth: true }),
  cancel: (type, id, reason) => backendApi.post(`${path(type, id)}/cancel`, { reason }, { auth: true }),
  /** Owner only: password, typed DELETE and a reason; the backend repeats every check. */
  remove: (type, id, { reason, reasonCode, confirm, password }) =>
    backendApi.del(path(type, id), { auth: true, body: { reason, reasonCode, confirm, password } }),
};

export const DELETE_REASONS = [
  { value: "TEST_DATA", label: "Test data" },
  { value: "DUPLICATE_TEST_RECORD", label: "Duplicate test record" },
  { value: "ABANDONED_DRAFT", label: "Abandoned draft" },
  { value: "OTHER", label: "Other (explain below)" },
];

export const AUDIT_ACTION_LABEL = {
  "record.archived": "Archived",
  "record.restored": "Restored",
  "record.delete_previewed": "Deletion checked",
  "record.permanent_delete_requested": "Permanent deletion requested",
  "record.permanent_delete_completed": "Permanently deleted",
  "record.permanent_delete_failed": "Permanent deletion failed",
  "card_funding.instruction_cancelled": "Cancelled",
  "card_funding.instruction_approved": "Funding approved",
  "card_funding.sent": "Funding sent to the card provider",
  "card_funding.confirmed": "Funding confirmed",
  "card_funding.failed": "Funding refused",
  "kyc.claim": "Review started",
  "kyc.decision": "KYC decision recorded",
  "payment.decision": "Payment decided automatically",
  "payment.staff_decision": "Payment decided by staff",
  "payment.recheck": "Receipt checked again",
  "provider.transaction.review": "Flagged for review",
};
