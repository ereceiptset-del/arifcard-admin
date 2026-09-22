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
        <span className="mb-1.5 block text-[13px] font-medium text-ink dark:text-ink-dark">
          {label}
        </span>
      )}
      {hint && <p className="mb-2 text-[12px] text-ink-faint">{hint}</p>}

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
        <div className="flex items-center gap-3 rounded-field border border-line-strong dark:border-line-strong-dark bg-panel-muted dark:bg-[#141823] p-3">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-md object-cover"
            />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
              <FileImage size={20} />
            </span>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ink dark:text-ink-dark">
              {value.name}
            </p>
            <p className="text-[12px] text-ink-faint">{formatBytes(value.size)} uploaded</p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || busy}
              className="flex h-9 items-center gap-1.5 rounded-field px-2.5 text-[12.5px] font-medium text-ink-soft dark:text-ink-muted-dark hover:bg-panel dark:hover:bg-white/5 disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              {busy ? <Spinner size={14} /> : <RefreshCw size={14} />}
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || busy}
              aria-label={`Remove ${value.name}`}
              className="flex h-9 w-9 items-center justify-center rounded-field text-ink-faint hover:bg-panel dark:hover:bg-white/5 hover:text-danger disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
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
          className={`flex w-full items-center justify-center gap-2 rounded-field border border-dashed px-4 py-4 text-[13px] font-medium transition-colors disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
            shownError
              ? "border-danger text-danger"
              : "border-line-strong dark:border-line-strong-dark text-ink-soft dark:text-ink-muted-dark hover:border-brand hover:text-brand"
          }`}
        >
          {busy ? <Spinner size={15} /> : <Upload size={15} />}
          {busy ? "Preparing image…" : "Choose file"}
        </button>
      )}

      {shownError && (
        <p role="alert" className="mt-1.5 text-[12px] text-danger">
          {shownError}
        </p>
      )}
    </div>
  );
}
