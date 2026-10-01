import { useId, useRef, useState } from "react";
import { Upload, X, RefreshCw, FileImage } from "lucide-react";
import { prepareImage, formatBytes } from "../lib/image.js";
import { Spinner } from "./Spinner.jsx";

/**
 * Image upload with preview, replace and remove.
 *
 * Oversized images are downscaled in the browser before upload; if that
 * cannot get them under the limit, an error is shown rather than a silent
 * failure. The preview lives in component state only — it is never
 * written to browser storage.
 *
 * `value` is the server's metadata for an already-uploaded file
 * (`{ name, size }`), so a reloaded page can still show what exists even
 * though the image bytes are no longer in the browser.
 */
export function FileField({
  label,
  hint,
  error,
  value,
  onChange,
  onRemove,
  maxBytes = 500 * 1024,
  disabled = false,
}) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");

  const shownError = error || localError;

  const handleFile = async (file) => {
    if (!file) return;
    setLocalError("");
    setBusy(true);
    try {
      const prepared = await prepareImage(file, { maxBytes });
      setPreviewUrl(prepared.dataUrl);
      await onChange(prepared);
    } catch (problem) {
      setLocalError(problem.message);
      setPreviewUrl(null);
    } finally {
      setBusy(false);
      // Allow re-picking the same filename.
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    setLocalError("");
    setPreviewUrl(null);
    await onRemove?.();
  };

  return (
    <div>
      {label && (
        <span className="mb-1.5 block text-small font-medium text-ink">
          {label}
        </span>
      )}
      {hint && <p className="mb-2 text-caption text-ink-muted">{hint}</p>}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={disabled || busy}
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {value ? (
        <div className="flex items-center gap-3 rounded-control border border-line-strong bg-surface-2 p-3">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-md object-cover"
            />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent-ink">
              <FileImage size={20} />
            </span>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-small font-medium text-ink">
              {value.name}
            </p>
            <p className="text-caption text-ink-muted">{formatBytes(value.size)} uploaded</p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || busy}
              className="flex h-9 items-center gap-1.5 rounded-control px-2.5 text-small font-medium text-ink-soft hover:bg-surface-1 disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              {busy ? <Spinner size={14} /> : <RefreshCw size={14} />}
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || busy}
              aria-label={`Remove ${value.name}`}
              className="flex h-9 w-9 items-center justify-center rounded-control text-ink-muted hover:bg-surface-1 hover:text-danger disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || busy}
          className={`flex w-full items-center justify-center gap-2 rounded-control border border-dashed px-4 py-4 text-small font-medium transition-colors disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
            shownError
              ? "border-danger text-danger"
              : "border-line-strong text-ink-soft hover:border-accent hover:text-accent-ink"
          }`}
        >
          {busy ? <Spinner size={15} /> : <Upload size={15} />}
          {busy ? "Preparing image…" : "Choose file"}
        </button>
      )}

      {shownError && (
        <p role="alert" className="mt-1.5 text-caption text-danger">
          {shownError}
        </p>
      )}
    </div>
  );
}
