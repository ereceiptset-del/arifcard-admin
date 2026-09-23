import { useRef, useState } from "react";
import { Upload, Check, X, Loader2 } from "lucide-react";
import { useToast } from "@addiscard/ui";
import { kycService, ACCEPTED_TYPES, ApiError } from "@addiscard/services";

/**
 * One evidence slot.
 *
 * The file goes straight from the browser to Cloud Storage through a
 * short-lived signed URL. It never passes through the Arifcard API, which
 * is what keeps identity documents out of request logs — and is also why
 * there is a real progress bar rather than a spinner.
 *
 * The backend re-reads the stored bytes afterwards and checks them
 * against the JPEG/PNG/PDF magic numbers, so a file renamed to look like
 * an image is caught after upload, not trusted because of its extension.
 */
export function EvidenceUpload({ caseId, slot, label, hint, file, onChanged, disabled }) {
  const toast = useToast();
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");

  const busy = progress !== null;

  async function upload(chosen) {
    setError("");
    if (!ACCEPTED_TYPES.includes(chosen.type)) {
      setError("Upload a JPEG, PNG or PDF.");
      return;
    }

    setProgress(0);
    try {
      const ticket = await kycService.requestUpload(caseId, {
        slot,
        contentType: chosen.type,
        declaredBytes: chosen.size,
      });

      await kycService.uploadToSignedUrl({
        uploadUrl: ticket.uploadUrl,
        file: chosen,
        contentType: chosen.type,
        onProgress: setProgress,
      });

      const { case: updated } = await kycService.finalizeUpload(caseId, {
        slot,
        fileId: ticket.fileId,
        path: ticket.path,
        contentType: chosen.type,
        name: chosen.name,
      });
      onChanged(updated);
      toast.success(`${label} uploaded.`);
    } catch (problem) {
      setError(problem instanceof ApiError ? problem.message : problem.message || "Upload failed.");
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove() {
    setError("");
    try {
      const { case: updated } = await kycService.removeUpload(caseId, slot);
      onChanged(updated);
    } catch (problem) {
      setError(problem instanceof ApiError ? problem.message : "Could not remove that file.");
    }
  }

  return (
    <div className="min-w-0">
      <p className="text-[13px] font-medium text-ink dark:text-ink-dark">{label}</p>
      {hint && <p className="mt-0.5 text-[12px] text-ink-faint">{hint}</p>}

      {file ? (
        <div className="mt-2 flex items-center gap-2 rounded-panel border border-line dark:border-line-dark px-3 py-2.5">
          <Check size={15} className="shrink-0 text-ok" />
          <span className="min-w-0 flex-1 truncate text-[13px] text-ink dark:text-ink-dark">
            {file.name || "Uploaded"}
          </span>
          {!disabled && (
            <button
              type="button"
              onClick={remove}
              className="shrink-0 rounded p-1 text-ink-muted hover:text-danger"
              aria-label={`Remove ${label}`}
            >
              <X size={15} />
            </button>
          )}
        </div>
      ) : (
        <>
          <input
            ref={inputRef}
            id={`upload-${slot}`}
            type="file"
            className="sr-only"
            accept={ACCEPTED_TYPES.join(",")}
            disabled={disabled || busy}
            onChange={(event) => event.target.files?.[0] && upload(event.target.files[0])}
          />
          <label
            htmlFor={`upload-${slot}`}
            className={`mt-2 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-panel border border-line dark:border-line-dark text-[13px] text-ink dark:text-ink-dark hover:bg-panel-muted dark:hover:bg-white/5 ${
              disabled || busy ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {busy ? `Uploading ${progress}%` : "Choose file"}
          </label>
        </>
      )}

      {error && <p className="mt-1.5 text-[12px] text-danger">{error}</p>}
    </div>
  );
}
