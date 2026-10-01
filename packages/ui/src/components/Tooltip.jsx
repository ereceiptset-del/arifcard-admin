import { cloneElement, isValidElement, useId } from "react";

/**
 * Short hint on hover and keyboard focus. The child is described by the
 * tooltip text (`aria-describedby`), so the hint is not hover-only.
 * Never put the only copy of important information in a tooltip.
 */
export function Tooltip({ content, side = "top", children }) {
  const id = useId();
  if (!content) return children;
  const child = isValidElement(children)
    ? cloneElement(children, { "aria-describedby": [children.props["aria-describedby"], id].filter(Boolean).join(" ") })
    : children;

  return (
    <span className="group/tooltip relative inline-flex">
      {child}
      <span
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-[70] w-max max-w-60 -translate-x-1/2 rounded-control bg-ink px-2.5 py-1.5 text-caption text-surface-1 opacity-0 shadow-e1 transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 ${
          side === "top" ? "bottom-full mb-2" : "top-full mt-2"
        }`}
      >
        {content}
      </span>
    </span>
  );
}
