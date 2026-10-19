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
  /** Owner only: password re-entered, phrase typed; the server re-checks everything. */
  hardSuspend: (uid, body) => backendApi.post(`${base(uid)}/hard-suspend`, body, { auth: true }),
  liftSuspension: (uid, body) => backendApi.post(`${base(uid)}/lift-suspension`, body, { auth: true }),
  /** Deletion requests (administrator): restrict while reviewed; nothing is deleted. */
  requestDeletion: (uid, { reason, expectedVersion }) => backendApi.post(`${base(uid)}/deletion-request`, { reason, expectedVersion }, { auth: true }),
  reviewDeletion: (uid, { expectedVersion }) => backendApi.post(`${base(uid)}/deletion-review`, { expectedVersion }, { auth: true }),
  cancelDeletion: (uid, { reason, expectedVersion }) => backendApi.post(`${base(uid)}/deletion-request/cancel`, { reason, expectedVersion }, { auth: true }),
  deletionOperation: (uid) => backendApi.get(`${base(uid)}/deletion-operation`, { auth: true }),
  /**
   * Owner only, and refused by the server unless execution is enabled there
   * (never on a deployed server) and the retention policy is approved. The
   * screen offers it only when the preview says deletion can start.
   */
  executeDeletion: (uid, body) => backendApi.post(`${base(uid)}/deletion/execute`, body, { auth: true }),
  resumeDeletion: (uid, body) => backendApi.post(`${base(uid)}/deletion/resume`, body, { auth: true }),
};

export const DELETE_CUSTOMER_PHRASE = "DELETE CUSTOMER";
export const DELETION_REASONS = [
  { value: "CUSTOMER_REQUEST", label: "The customer asked for deletion" },
  { value: "ACCOUNT_CLOSURE", label: "Account closure" },
  { value: "DUPLICATE_OR_TEST_ACCOUNT", label: "Duplicate or test account" },
  { value: "OTHER", label: "Other (explain below)" },
];
export const DELETION_STAGE_LABEL = {
  ACCESS_REVOKED: "Access revoked",
  PERSONAL_DATA_REMOVED: "Personal data removed",
  FILES_REMOVED: "Identity files removed",
  RETAINED_RECORDS_DEIDENTIFIED: "Retained records de-identified",
  AUTH_USER_REMOVED: "Sign-in account removed",
  TOMBSTONE_CREATED: "Tombstone created",
};
export const DELETION_OP_LABEL = {
  IN_PROGRESS: "In progress",
  DELETION_FAILED: "Failed — investigate, then resume",
  RECONCILIATION_REQUIRED: "Reconciliation required",
  DELETION_COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const HARD_SUSPEND_PHRASE = "SUSPEND CUSTOMER";
export const LIFT_SUSPENSION_PHRASE = "LIFT SUSPENSION";

/** Staff-only reasons for a hard suspension (never shown to the customer). */
export const HARD_SUSPENSION_REASONS = [
  { value: "ACCOUNT_COMPROMISE", label: "Suspected account compromise" },
  { value: "FRAUD_OR_SECURITY_INCIDENT", label: "Severe fraud or security incident" },
  { value: "LEGAL_OR_COMPLIANCE_HOLD", label: "Legal or compliance hold" },
  { value: "CREDENTIAL_ABUSE", label: "Credential abuse" },
  { value: "UNAUTHORIZED_ACCESS", label: "Confirmed unauthorized access" },
  { value: "OTHER", label: "Other (explain below)" },
];
export const HARD_SUSPENSION_REASON_LABEL = Object.fromEntries(HARD_SUSPENSION_REASONS.map((r) => [r.value, r.label]));

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
  providerMappings: "Card-provider records (kept by the provider)",
};
