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
};
