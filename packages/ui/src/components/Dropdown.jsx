import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

/**
 * Menu button. `trigger` is rendered inside the button; `items` are
 * `{ label, icon?, onSelect?, href?, disabled?, reason?, tone?, divider? }` —
 * a disabled item shows its reason underneath instead of silently doing
 * nothing; `tone: "danger"` marks a destructive item (red text, still a
 * word, never colour alone); `divider` draws a line above the item.
 * Arrow keys move, Escape closes and returns focus to the trigger.
 */
export function Dropdown({ trigger, label, items, align = "right", buttonClassName = "", renderLink }) {
  const [open, setOpen] = useState(false);
  // The side actually used: the requested one, flipped if the menu would leave the screen.
  const [side, setSide] = useState(align);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();

  useLayoutEffect(() => {
    if (!open || !menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    if (rect.left < 8 && side === "right") setSide("left");
    else if (rect.right > window.innerWidth - 8 && side === "left") setSide("right");
  }, [open, side]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    const first = rootRef.current?.querySelector('[role="menuitem"]:not([aria-disabled="true"])');
    first?.focus();
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };

  const onMenuKeyDown = (event) => {
    const options = [...rootRef.current.querySelectorAll('[role="menuitem"]')];
    const index = options.indexOf(document.activeElement);
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      options[(index + 1) % options.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      options[(index - 1 + options.length) % options.length]?.focus();
    } else if (event.key === "Tab") {
      close(false);
    }
  };

  const itemClass =
    "flex w-full items-start gap-3 rounded-control px-3 py-2.5 text-left text-small text-ink hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none min-h-11";

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={label}
        onClick={() => {
          setSide(align);
          setOpen((value) => !value);
        }}
        className={buttonClassName}
      >
        {trigger}
      </button>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
          className={`absolute top-full z-30 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-panel border border-line bg-surface-3 p-1.5 shadow-e1 ${
            side === "right" ? "right-0" : "left-0"
          }`}
        >
          {items.map((item) => {
            const Icon = item.icon;
            const danger = item.tone === "danger" && !item.disabled;
            const content = (
              <>
                {Icon && <Icon size={16} aria-hidden className={`mt-0.5 shrink-0 ${danger ? "text-danger" : "text-ink-muted"}`} />}
                <span className="min-w-0">
                  <span className="block font-medium">{item.label}</span>
                  {item.disabled && item.reason && <span className="block text-caption text-ink-muted">{item.reason}</span>}
                </span>
              </>
            );
            if (item.href && !item.disabled && renderLink) {
              return renderLink({
                key: item.label,
                to: item.href,
                role: "menuitem",
                tabIndex: -1,
                className: itemClass,
                onClick: () => close(false),
                children: content,
              });
            }
            return (
              <div key={item.label} className={item.divider ? "mt-1.5 border-t border-line pt-1.5" : undefined} role="none">
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  aria-disabled={item.disabled || undefined}
                  onClick={() => {
                    if (item.disabled) return;
                    close();
                    item.onSelect?.();
                  }}
                  className={`${itemClass} ${item.disabled ? "cursor-not-allowed text-ink-muted" : danger ? "text-danger" : ""}`}
                >
                  {content}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
