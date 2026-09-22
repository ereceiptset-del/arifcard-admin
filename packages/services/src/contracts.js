/**
 * Values shared between the front end and the backend.
 *
 * Kept deliberately small: a constant belongs here once something real
 * depends on it. Verification, document and income vocabularies were
 * removed along with the code that used them, and will come back with the
 * passport review workflow that actually needs them.
 */

export const CARD_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  FROZEN: "frozen",
};

export const CARD_STATUS_LABEL = {
  pending: "Pending",
  active: "Active",
  frozen: "Frozen",
};

export const CARD_STATUS_TONE = {
  pending: "neutral",
  active: "ok",
  frozen: "warn",
};
