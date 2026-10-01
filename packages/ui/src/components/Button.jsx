import { forwardRef, useId } from "react";
import { Spinner } from "./Spinner.jsx";

const VARIANTS = {
  primary: ["bg-accent text-on-accent", "hover:bg-accent-hover"],
  secondary: ["border border-line-strong bg-surface-1 text-ink", "hover:bg-surface-2"],
  ghost: ["text-ink-soft", "hover:bg-surface-2 hover:text-ink"],
  destructive: ["bg-danger text-surface-1", "hover:opacity-90"],
  // Older name, same look.
  danger: ["bg-danger text-surface-1", "hover:opacity-90"],
};

const SIZES = {
  // `sm` is for dense desktop tables: 44px on phones and touch screens, 36px from `sm` up.
  sm: "h-11 sm:h-9 px-3 text-small gap-1.5 pointer-coarse:min-h-11",
  md: "h-11 px-4 text-small gap-2",
  lg: "h-12 px-5 text-body gap-2",
};

/** Button look for elements that are not <button> (e.g. a router Link). */
export function buttonClasses({ variant = "primary", size = "md", className = "" } = {}) {
  const [look, hover] = VARIANTS[variant] || VARIANTS.primary;
  return `inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-control font-semibold transition-colors duration-150 ${look} ${hover} ${
    SIZES[size] || SIZES.md
  } ${className}`;
}

/**
 * Action control.
 *
 * A disabled button with a `disabledReason` stays focusable (it uses
 * `aria-disabled`, not `disabled`), ignores clicks, and exposes the reason
 * as its accessible description and hover tooltip — so a keyboard or
 * screen-reader user can find out why it does nothing. Without a reason it
 * falls back to the native `disabled` attribute. Several buttons that share
 * one visible reason pass that element's id as `reasonId`.
 */
export const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    disabledReason,
    reasonId: externalReasonId,
    icon: Icon,
    className = "",
    children,
    onClick,
    type,
    ...props
  },
  ref
) {
  const ownReasonId = useId();
  // Several buttons sharing one visible reason pass its element id instead.
  const reasonId = externalReasonId || ownReasonId;
  const blocked = disabled || loading;
  const explained = blocked && Boolean(disabledReason) && !loading;
  const [look, hover] = VARIANTS[variant] || VARIANTS.primary;

  return (
    <>
      <button
        ref={ref}
        type={type}
        disabled={blocked && !explained}
        aria-disabled={explained || undefined}
        aria-busy={loading || undefined}
        aria-describedby={explained ? reasonId : undefined}
        title={explained ? disabledReason : undefined}
        onClick={blocked ? (event) => event.preventDefault() : onClick}
        className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-control font-semibold transition-colors duration-150 ${look} ${blocked ? "cursor-not-allowed opacity-50" : hover} ${
          SIZES[size] || SIZES.md
        } ${className}`}
        {...props}
      >
        {loading ? <Spinner size={16} /> : Icon ? <Icon size={16} aria-hidden /> : null}
        {children}
      </button>
      {explained && !externalReasonId && (
        <span id={reasonId} className="sr-only">
          {disabledReason}
        </span>
      )}
    </>
  );
});
