import { Info } from "lucide-react";

/**
 * A plain notice strip for something the customer should know about the
 * service itself (not a status). `variant="inline"` is a small label.
 */
export function DemoNotice({ children, variant = "strip", className = "" }) {
  if (variant === "inline") {
    return (
      <span className={`inline-flex items-center rounded-full bg-warning-tint px-2 py-0.5 text-caption font-medium text-warning ${className}`}>
        Preview
      </span>
    );
  }

  return (
    <div className={`flex items-start gap-2.5 rounded-control bg-surface-2 px-4 py-3 text-small text-ink-soft ${className}`}>
      <Info size={16} aria-hidden className="mt-px shrink-0 text-info" />
      <p>{children}</p>
    </div>
  );
}
