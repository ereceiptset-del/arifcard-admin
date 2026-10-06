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
  /** Administrator, audited: link one verified ETB payment to card funding under the current rule. */
  allocate: (intentId) => backendApi.post("/admin/bitnob/allocations", { intentId }, { auth: true }),
  /** Administrator, audited: the agreed USD amount and its rate basis, as supplied (never computed). */
  recordUsd: (id, body) => backendApi.post(`/admin/bitnob/allocations/${encodeURIComponent(id)}/usd`, body, { auth: true }),
  /** Card issuance queue (staff read). */
  issuance: () => backendApi.get("/admin/bitnob/issuance", { auth: true }),
  /** Administrator: issue the card; the backend re-checks eligibility and funding. */
  issue: (uid) => backendApi.post(`/admin/bitnob/issuance/${encodeURIComponent(uid)}/issue`, {}, { auth: true }),
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
  INSUFFICIENT_SANDBOX_FUNDS: "Sandbox provider test balance is insufficient",
  FUNDING_SOURCE_UNCONFIRMED: "Provider funding balance not confirmed",
  FUNDING_CHECK_FAILED: "Provider balance could not be read",
  PROVIDER_NOT_AVAILABLE_HERE: "This server cannot call the provider",
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
  funding_awaiting_usd_amount: "Funding: agreed USD amount needed",
  funding_ready: "Funding: ready to send",
  funding_unsettled: "Funding: not settled yet",
  funding_amount_mismatch: "Funding: amount differs",
};
