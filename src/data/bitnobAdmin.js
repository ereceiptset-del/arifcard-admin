import { backendApi } from "@addiscard/services";

/**
 * Card provider (Bitnob, sandbox) — read-only staff views.
 *
 * The backend never returns declaration values, identity data or provider
 * identifiers here, and offers no endpoint that sets a Bitnob approval, a
 * balance or a card state. Kept in the admin app's own data module
 * (packages/services is shared and left unchanged).
 */
export const bitnobAdmin = {
  customer: (uid) => backendApi.get(`/admin/bitnob/customers/${encodeURIComponent(uid)}`, { auth: true }),
  attention: () => backendApi.get("/admin/bitnob/attention", { auth: true }),
  /** Administrator, audited: approve a USD funding instruction for one verified payment (no conversion). */
  approveFunding: (body) => backendApi.post("/admin/bitnob/funding-instructions", body, { auth: true }),
  /** Administrator, audited: cancel an instruction nothing was sent for (or that the provider refused). */
  cancelFunding: (id, reason) => backendApi.post(`/admin/bitnob/funding-instructions/${encodeURIComponent(id)}/cancel`, { reason }, { auth: true }),
  /** Administrator, audited: send ONE funding request to the card provider (reserved first, never retried). */
  sendFunding: (id) => backendApi.post(`/admin/bitnob/funding-instructions/${encodeURIComponent(id)}/send`, {}, { auth: true }),
  /** Administrator: settle a sent instruction by reading the card provider (read-only). */
  confirmFunding: (id) => backendApi.post(`/admin/bitnob/funding-instructions/${encodeURIComponent(id)}/confirm`, {}, { auth: true }),
  /** Card issuance queue (staff read). */
  issuance: () => backendApi.get("/admin/bitnob/issuance", { auth: true }),
  /** Administrator: issue the card; the backend re-checks eligibility and funding. */
  issue: (uid) => backendApi.post(`/admin/bitnob/issuance/${encodeURIComponent(uid)}/issue`, {}, { auth: true }),
  /** Administrator: read-only check that the backend this site uses can reach Bitnob. */
  connectivity: () => backendApi.get("/admin/bitnob/connectivity", { auth: true }),
};

/** Funding instruction statuses (backend funding.js). */
export const FUNDING_STATUS = {
  approved: ["info", "Approved — not sent"],
  sending: ["warning", "Sending"],
  pending: ["warning", "Sent — awaiting confirmation"],
  funded: ["success", "Funded (confirmed)"],
  failed: ["danger", "Refused"],
  unknown: ["attention", "Outcome unknown — reconcile"],
  needs_review: ["attention", "Needs review"],
  cancelled: ["neutral", "Cancelled"],
};

export const ISSUANCE_LABEL = {
  not_eligible: ["neutral", "Not eligible yet"],
  awaiting_payment: ["neutral", "Awaiting payment"],
  ready_for_issuance: ["info", "Ready for issuance"],
  provisioning: ["warning", "Provisioning"],
  active: ["success", "Active"],
  failed: ["danger", "Failed"],
  unknown: ["warning", "Outcome unknown — reconcile"],
  blocked: ["attention", "Issuance blocked"],
};

export const ISSUANCE_BLOCKER_LABEL = {
  ARIFCARD_KYC_NOT_APPROVED: "Customer not verified",
  PROVIDER_DETAILS_INCOMPLETE: "Provider details incomplete",
  CONSENT_MISSING: "Consent missing",
  PAYMENT_NOT_VERIFIED: "Payment not verified",
  BITNOB_KYC_REQUIRED: "Provider KYC required",
  CARD_ALREADY_EXISTS: "Card already exists",
  INSUFFICIENT_PROVIDER_FUNDS: "Provider funding balance is insufficient",
  FUNDING_SOURCE_UNCONFIRMED: "Provider funding balance not confirmed",
  FUNDING_CHECK_FAILED: "Provider balance could not be read",
  PROVIDER_NOT_AVAILABLE_HERE: "This server cannot call the provider",
  IP_ALLOWLIST_MISMATCH: "This computer is on a network that isn't allowlisted at Bitnob — nothing was sent",
  IP_ALLOWLIST_UNCONFIGURED: "BITNOB_ALLOWLISTED_IP is not set — nothing was sent",
  IP_CHECK_UNAVAILABLE: "This computer's public IP couldn't be checked — nothing was sent",
  CARD_TEST_NOT_ALLOWED: "Customer not on the sandbox test list",
  AMOUNT_UNITS_UNCONFIRMED: "Provider amount units not confirmed",
  KYC_REQUIRED: "Provider KYC required",
  CUSTOMER_FIELDS_MISSING: "Cardholder details missing",
};

export const KYC_STATE = {
  not_submitted: ["neutral", "Not submitted"],
  pending: ["warning", "Pending at Bitnob"],
  approved: ["success", "Approved by Bitnob"],
  rejected: ["danger", "Rejected by Bitnob"],
  action_required: ["attention", "Customer action needed"],
  review_required: ["attention", "Needs review"],
  submission_unknown: ["warning", "Outcome unknown — reconcile"],
  failed: ["danger", "Not sent (refused)"],
};

export const CARD_STATE = {
  not_requested: ["neutral", "Not requested"],
  provisioning: ["warning", "Provisioning"],
  active: ["success", "Active"],
  failed: ["danger", "Failed"],
  unknown: ["warning", "Outcome unknown — reconcile"],
  review_required: ["attention", "Needs review"],
};

export const ATTENTION_LABEL = {
  kyc_submission_unresolved: "KYC submission unresolved",
  kyc_review_required: "KYC needs review",
  card_creation_unresolved: "Card creation unresolved",
  card_review_required: "Card needs review",
  card_operation_unresolved: "Card change unresolved",
  top_up_requested: "Top-up requested",
  transaction_review_required: "Card transaction needs review",
  funding_ready: "Funding: approved, ready to send",
  funding_refused: "Funding: refused by the card provider",
  funding_instruction_unknown: "Funding: outcome unknown",
  funding_review_required: "Funding needs review",
  funding_unsettled: "Funding: not settled yet",
  funding_amount_mismatch: "Funding: amount differs",
  sandbox_topup_unresolved: "Sandbox test top-up: not confirmed yet",
  sandbox_topup_review_required: "Sandbox test top-up needs review",
};
