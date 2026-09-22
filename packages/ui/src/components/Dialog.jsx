import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * Modal dialog.
 *
 * Escape and backdrop click close it, body scroll is locked while open,
 * focus moves into the panel on open and returns to the trigger on close,
 * and Tab is trapped inside.
 */
export function Dialog({ open, onClose, title, description, footer, children, size = "md" }) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    previouslyFocused.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables?.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const focusTimer = setTimeout(() => {
      const target = panelRef.current?.querySelector(
        'button:not([disabled]), input, select, textarea, a[href]'
      );
      (target || panelRef.current)?.focus();
    }, 0);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      clearTimeout(focusTimer);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/45 opacity-100 transition-opacity duration-200 starting:opacity-0"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`relative w-full ${widths[size]} rounded-t-panel sm:rounded-panel border border-line dark:border-line-dark bg-panel dark:bg-panel-dark shadow-overlay opacity-100 translate-y-0 transition-[opacity,transform] duration-200 starting:opacity-0 starting:translate-y-3`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line dark:border-line-dark px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-ink dark:text-ink-dark">{title}</h2>
            {description && (
              <p className="mt-0.5 text-[13px] text-ink-muted dark:text-ink-muted-dark">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="shrink-0 rounded-field p-1 text-ink-faint hover:bg-panel-muted dark:hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <X size={17} />
          </button>
        </header>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>

        {footer && (
          <footer className="flex flex-wrap justify-end gap-2 border-t border-line dark:border-line-dark px-5 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
