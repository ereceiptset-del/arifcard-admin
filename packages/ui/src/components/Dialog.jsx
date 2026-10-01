import { useId, useRef } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "../lib/useFocusTrap.js";

/**
 * Modal dialog: a bottom sheet on phones, centred from `sm` up.
 * Escape and the backdrop close it; focus is trapped and restored.
 */
export function Dialog({ open, onClose, title, description, footer, children, size = "md" }) {
  const panelRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  useFocusTrap(open, onClose, panelRef);

  if (!open) return null;

  const widths = { sm: "sm:max-w-sm", md: "sm:max-w-lg", lg: "sm:max-w-2xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-scrim opacity-100 transition-opacity duration-200 starting:opacity-0"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`relative flex max-h-[92vh] w-full flex-col rounded-t-panel border border-line bg-surface-1 shadow-e2 sm:rounded-panel ${widths[size] || widths.md} translate-y-0 opacity-100 transition-[opacity,transform] duration-200 ease-[var(--ease-standard)] starting:translate-y-3 starting:opacity-0`}
      >
        <header className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-h2 text-ink">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-small text-ink-muted">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-ink-muted hover:bg-surface-2 hover:text-ink"
          >
            <X size={18} aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

        {footer && (
          <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4 sm:px-6">{footer}</footer>
        )}
      </div>
    </div>
  );
}
