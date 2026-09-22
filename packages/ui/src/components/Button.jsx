import { forwardRef } from "react";
import { Spinner } from "./Spinner.jsx";

const VARIANTS = {
  primary:
    "bg-brand text-white hover:bg-brand-hover active:bg-brand-active disabled:bg-brand-muted",
  secondary:
    "border border-line-strong dark:border-line-strong-dark text-ink dark:text-ink-dark hover:bg-panel-muted dark:hover:bg-white/5 disabled:opacity-55",
  ghost:
    "text-ink-soft dark:text-ink-muted-dark hover:bg-panel-muted dark:hover:bg-white/5 disabled:opacity-55",
  danger: "bg-danger text-white hover:brightness-110 disabled:opacity-55",
};

const SIZES = {
  sm: "h-8 px-3 text-[12.5px] gap-1.5",
  md: "h-10 px-4 text-[13px] gap-2",
  lg: "h-11 px-5 text-[14px] gap-2",
};

/**
 * Primary action control.
 *
 * `disabledReason` is required whenever a button is disabled for a reason
 * the user cannot see — it becomes the tooltip and the accessible title,
 * so no control is ever silently dead.
 */
export const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    disabledReason,
    icon: Icon,
    className = "",
    children,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      title={isDisabled && disabledReason ? disabledReason : undefined}
      aria-disabled={isDisabled || undefined}
      className={`inline-flex items-center justify-center rounded-field font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? <Spinner size={15} /> : Icon ? <Icon size={15} /> : null}
      {children}
    </button>
  );
});
