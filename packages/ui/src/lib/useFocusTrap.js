import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Open traps, innermost last. A dialog opened from a drawer stacks two
 * traps, each with its own document listener; only the top one may act on
 * a key, or Escape closes both and Tab is wrapped by the drawer's bounds.
 */
const openTraps = [];

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

    const trap = {};
    openTraps.push(trap);
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (openTraps[openTraps.length - 1] !== trap) return;
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
      // Focus that has slipped outside (a click behind the scrim) comes back in.
      if (!ref.current.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
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
      openTraps.splice(openTraps.indexOf(trap), 1);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      clearTimeout(focusTimer);
      previouslyFocused?.focus?.();
    };
  }, [open, ref]);
}
