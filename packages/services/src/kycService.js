import { backendApi } from "./backendApi.js";

/**
 * Manual identity review, customer side.
 *
 * Files never travel through this API. `requestUpload` asks the backend
 * for a short-lived signed URL, the browser PUTs the bytes straight to
 * Cloud Storage — which is what gives progress and retry — and
 * `finalizeUpload` then asks the backend to validate and record it.
 *
 * Nothing here can set a status: only a reviewer moves a case, and the
 * backend refuses the attempt regardless.
 */
export const kycService = {
  /**
   * The fixed choices the wizard offers.
   *
   * Fetched rather than hard-coded here, so a value this app offers is
   * always one the backend schema will accept. Two copies of a list
   * eventually disagree, and the customer is the one who finds out.
   */
  options: (o) => backendApi.get("/kyc/options", { ...o, auth: true }),

  currentCase: (options) => backendApi.get("/kyc/case", { ...options, auth: true }),
  startCase: () => backendApi.post("/kyc/case", undefined, { auth: true }),
  saveDetails: (caseId, details) =>
    backendApi.patch(`/kyc/case/${caseId}/details`, details, { auth: true }),

  requestUpload: (caseId, { slot, contentType, declaredBytes }) =>
    backendApi.post(`/kyc/case/${caseId}/uploads`, { slot, contentType, declaredBytes }, { auth: true }),
  finalizeUpload: (caseId, payload) =>
    backendApi.post(`/kyc/case/${caseId}/uploads/finalize`, payload, { auth: true }),
  removeUpload: (caseId, slot) =>
    backendApi.del(`/kyc/case/${caseId}/uploads/${slot}`, { auth: true }),

  submit: (caseId) => backendApi.post(`/kyc/case/${caseId}/submit`, undefined, { auth: true }),

  notifications: (options) => backendApi.get("/kyc/notifications", { ...options, auth: true }),
  markNotificationRead: (id) =>
    backendApi.post(`/kyc/notifications/${id}/read`, undefined, { auth: true }),

  /**
   * Uploads one file to a signed URL, reporting progress.
   *
   * Uses XHR rather than fetch because fetch still has no upload progress
   * event, and a customer watching a 10 MB scan needs to see it moving.
   */
  uploadToSignedUrl({ uploadUrl, method = "PUT", file, contentType, onProgress, signal }) {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      // The method comes from the ticket rather than being assumed. A
      // signed Cloud Storage URL takes PUT; the local emulator, which does
      // not implement signed writes, takes POST on its own endpoint.
      request.open(method, uploadUrl, true);
      request.setRequestHeader("Content-Type", contentType);

      request.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      request.onload = () =>
        request.status >= 200 && request.status < 300
          ? resolve()
          : reject(new Error(`Upload failed (${request.status}). Please try again.`));
      request.onerror = () => reject(new Error("Upload failed. Check your connection and try again."));
      request.onabort = () => reject(Object.assign(new Error("Upload cancelled."), { name: "AbortError" }));

      signal?.addEventListener("abort", () => request.abort());
      request.send(file);
    });
  },
};

/** KYC statuses, mirroring backend/src/services/kyc.constants.js. */
export const KYC_STATUS = {
  NOT_SUBMITTED: "NOT_SUBMITTED",
  PENDING: "PENDING",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CHANGES_REQUESTED: "CHANGES_REQUESTED",
};

export const KYC_STATUS_LABEL = {
  NOT_SUBMITTED: "Not submitted",
  PENDING: "Waiting for review",
  UNDER_REVIEW: "Being reviewed",
  APPROVED: "Approved",
  REJECTED: "Not approved",
  CHANGES_REQUESTED: "Changes requested",
};

export const KYC_STATUS_TONE = {
  NOT_SUBMITTED: "neutral",
  PENDING: "info",
  UNDER_REVIEW: "info",
  APPROVED: "ok",
  REJECTED: "danger",
  CHANGES_REQUESTED: "warn",
};

/** States in which the customer may still edit and upload. */
export const EDITABLE_STATUSES = [
  KYC_STATUS.NOT_SUBMITTED,
  KYC_STATUS.REJECTED,
  KYC_STATUS.CHANGES_REQUESTED,
];

export const EVIDENCE_SLOTS = [
  { slot: "faydaFront", label: "Fayda ID — front", required: true },
  { slot: "faydaBack", label: "Fayda ID — back", required: true },
  { slot: "passportBiodata", label: "Passport photo page", required: false },
  { slot: "selfie", label: "Your photo", required: false },
];

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

/** Exactly two documents. No driver's licence. */
export const DOCUMENT_TYPE = { FAYDA: "FAYDA", PASSPORT: "PASSPORT" };

/**
 * How a decision was reached, in words.
 *
 * One entry per document, because they are not the same claim: a passport
 * review shown as "Manual Fayda" would misdescribe the evidence a
 * decision rests on. Neither is an API verification — nothing contacts
 * Fayda — and the wording says so.
 */
export const KYC_METHOD_LABEL = {
  MANUAL_FAYDA: "Manual Fayda review",
  MANUAL_PASSPORT: "Manual passport review",
};

/** What to call each upload, and the help text under it. */
export const SLOT_COPY = {
  faydaFront: {
    label: "Front of the document",
    hint: "The side with your photo and FAN number.",
  },
  faydaBack: {
    label: "Back of the document",
    hint: "The side with the barcode.",
  },
  passportBiodata: {
    label: "Passport photo page",
    hint: "The page with your photo and details. There is no back page to send.",
  },
  selfie: {
    label: "Your selfie",
    hint: "A clear photo of your face, without a hat or sunglasses, in good light.",
  },
};
