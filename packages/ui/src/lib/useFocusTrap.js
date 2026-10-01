import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * For modal surfaces (Dialog, Drawer): while `open`, Escape closes, Tab is
 * trapped inside `ref`, body scroll is locked, focus moves in on open and
 * returns to whatever had it before on close.
 */
export function useFocusTrap(open, onClose, ref) {
  // The latest close handler, without re-running the trap when it changes.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = ref.current?.querySelectorAll(FOCUSABLE);
      if (!focusables?.length) {
        event.preventDefault();
        return;
      }
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
      const preferred = ref.current?.querySelector("[data-autofocus]") || ref.current?.querySelector(FOCUSABLE);
      (preferred || ref.current)?.focus();
    }, 0);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      clearTimeout(focusTimer);
      previouslyFocused?.focus?.();
    };
  }, [open, ref]);
}
