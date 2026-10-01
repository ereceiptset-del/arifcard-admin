import { useId, useRef } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "../lib/useFocusTrap.js";

/**
 * Side panel for detail views (a transaction, a case). Slides in from the
 * right (`side="left"` for navigation). Same focus rules as Dialog.
 */
export function Drawer({ open, onClose, title, description, footer, side = "right", width = "max-w-md", children }) {
  const panelRef = useRef(null);
  const titleId = useId();
  useFocusTrap(open, onClose, panelRef);

  if (!open) return null;

  const edge = side === "left" ? "left-0 starting:-translate-x-full" : "right-0 starting:translate-x-full";

  return (
    <div className="fixed inset-0 z-40">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-scrim opacity-100 transition-opacity duration-200 starting:opacity-0"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : "Panel"}
        tabIndex={-1}
        className={`absolute inset-y-0 ${edge} flex w-[88vw] ${width} flex-col border-line bg-surface-1 shadow-e2 ${
          side === "left" ? "border-r" : "border-l"
        } translate-x-0 transition-transform duration-200 ease-[var(--ease-standard)]`}
      >
        {title && (
          <header className="flex items-start justify-between gap-4 px-5 pt-5">
            <div className="min-w-0">
              <h2 id={titleId} className="text-h2 text-ink">
                {title}
              </h2>
              {description && <p className="mt-1 text-small text-ink-muted">{description}</p>}
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
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4">{footer}</footer>}
      </div>
    </div>
  );
}
