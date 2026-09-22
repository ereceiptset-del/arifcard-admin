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
  uploadToSignedUrl({ uploadUrl, file, contentType, onProgress, signal }) {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open("PUT", uploadUrl, true);
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
