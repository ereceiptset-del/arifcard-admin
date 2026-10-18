import { backendApi } from "@addiscard/services";

/**
 * Customer account access — administrator actions on one customer.
 *
 * Disable and re-enable are audited state changes with a required reason;
 * the deletion check is read-only and can never start a deletion (the
 * backend has no endpoint that does). Every call sends the version the
 * screen was showing, so a change someone else made in the meantime is
 * refused instead of overwritten.
 */
const base = (uid) => `/admin/customers/${encodeURIComponent(uid)}`;

export const customerAccessApi = {
  account: (uid) => backendApi.get(`${base(uid)}/account`, { auth: true }),
  disable: (uid, { reason, note, expectedVersion }) => backendApi.post(`${base(uid)}/disable`, { reason, note: note || undefined, expectedVersion }, { auth: true }),
  enable: (uid, { reason, expectedVersion }) => backendApi.post(`${base(uid)}/enable`, { reason, expectedVersion }, { auth: true }),
  deletionPreview: (uid) => backendApi.post(`${base(uid)}/deletion-preview`, {}, { auth: true }),
};

export const ACCOUNT_STATUS_LABEL = {
  ACTIVE: "Active",
  TEMPORARILY_DISABLED: "Temporarily disabled",
  HARD_SUSPENDED: "Suspended",
  DELETION_REQUESTED: "Deletion requested",
  DELETION_BLOCKED: "Deletion blocked",
  DELETION_IN_PROGRESS: "Deletion in progress",
  PERMANENTLY_DELETED: "Permanently deleted",
  DEIDENTIFIED: "De-identified",
};

export const ACCOUNT_STATUS_TONE = {
  ACTIVE: "success",
  TEMPORARILY_DISABLED: "danger",
  HARD_SUSPENDED: "danger",
  DELETION_REQUESTED: "attention",
  DELETION_BLOCKED: "attention",
  DELETION_IN_PROGRESS: "attention",
  PERMANENTLY_DELETED: "neutral",
  DEIDENTIFIED: "neutral",
};

export const DEPENDENCY_LABEL = {
  activeCards: "Active or pending cards",
  cards: "Cards (all)",
  pendingPayments: "Payments not settled",
  verifiedPayments: "Verified payments",
  topups: "Card top-ups",
  transactions: "Card transactions",
  unresolvedProviderOperations: "Unresolved provider operations",
  identityCases: "Identity verification cases",
  identityFiles: "Private identity files",
};
