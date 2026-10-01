import { CircleCheck, Clock, CircleX, CircleDashed, TriangleAlert, Info } from "lucide-react";

/**
 * Status pill: icon + text + colour, never colour alone.
 *
 * Tones map to the semantic palette. Each tone carries a default icon so a
 * state is readable without colour; pass `icon` to override or
 * `icon={null}` for a plain label (only where the text alone is the state).
 */
const TONES = {
  success: { className: "bg-success-tint text-success", icon: CircleCheck },
  warning: { className: "bg-warning-tint text-warning", icon: Clock },
  attention: { className: "bg-warning-tint text-warning", icon: TriangleAlert },
  danger: { className: "bg-danger-tint text-danger", icon: CircleX },
  neutral: { className: "bg-neutral-tint text-neutral", icon: CircleDashed },
  info: { className: "bg-info-tint text-info", icon: Info },
  accent: { className: "bg-accent-soft text-accent-ink", icon: null },
};

// Names used by the services' *_TONE maps before the redesign.
const ALIASES = { ok: "success", warn: "warning", brand: "accent" };

export function StatusPill({ tone = "neutral", icon, children, className = "" }) {
  const key = ALIASES[tone] || tone;
  const style = TONES[key] || TONES.neutral;
  const Icon = icon === undefined ? style.icon : icon;

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-medium ${style.className} ${className}`}
    >
      {Icon && <Icon size={13} strokeWidth={2.25} aria-hidden className="shrink-0" />}
      <span className="truncate">{children}</span>
    </span>
  );
}

/** Older name for StatusPill. */
export const Badge = StatusPill;
