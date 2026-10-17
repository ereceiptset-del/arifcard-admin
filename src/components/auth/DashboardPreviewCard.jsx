import { ShieldCheck, Banknote, CreditCard, ScrollText, BadgeCheck } from "lucide-react";

/**
 * Staff-console preview panels for the sign-in showcase. Illustrative
 * figures only (the showcase says "Preview"); they come from no queue.
 * Tokens only, so both themes follow on their own.
 */

const QUEUE = [
  { icon: ShieldCheck, label: "Identity reviews waiting", count: 3, tint: "bg-info-tint text-info" },
  { icon: Banknote, label: "Payments needing a person", count: 2, tint: "bg-warning-tint text-warning" },
  { icon: CreditCard, label: "Ready for card issuance", count: 1, tint: "bg-accent-soft text-accent-ink" },
];

/** What waits for staff: the three queues. */
export function DashboardPreviewCard({ className = "" }) {
  return (
    <div className={`rounded-panel border border-line bg-surface-1 p-4 shadow-e2 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-caption text-ink-muted">Today&apos;s work</p>
          <p className="mt-0.5 text-h2 font-semibold tabular-nums text-ink">6 open items</p>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-full border border-line bg-surface-2 px-2.5 py-1 text-caption font-medium text-ink">Staff</span>
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {QUEUE.map(({ icon: Icon, label, count, tint }) => (
          <li key={label} className="flex items-center justify-between gap-3 rounded-control bg-surface-2 px-3 py-2 text-small">
            <span className="inline-flex min-w-0 items-center gap-2 text-ink">
              <span aria-hidden className={`grid size-7 shrink-0 place-items-center rounded-control ${tint}`}>
                <Icon size={14} strokeWidth={2.25} />
              </span>
              <span className="truncate">{label}</span>
            </span>
            <span className="shrink-0 font-semibold tabular-nums text-ink">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const STEPS = [
  { icon: ShieldCheck, label: "Receipt verified", detail: "Matched against the bank", tint: "bg-success-tint text-success" },
  { icon: BadgeCheck, label: "Identity approved", detail: "Decided by a reviewer", tint: "bg-info-tint text-info" },
  { icon: ScrollText, label: "Recorded in the audit log", detail: "Who, when and why", tint: "bg-accent-soft text-accent-ink" },
];

/** A decision's trail, as staff see it. */
export function StatusPreviewCard({ className = "" }) {
  return (
    <ol className={`flex flex-col gap-2.5 rounded-panel border border-line bg-surface-1 p-3.5 shadow-e2 ${className}`}>
      {STEPS.map(({ icon: Icon, label, detail, tint }) => (
        <li key={label} className="flex items-center gap-3">
          <span aria-hidden className={`grid size-8 shrink-0 place-items-center rounded-control ${tint}`}>
            <Icon size={16} strokeWidth={2.25} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-small font-medium text-ink">{label}</span>
            <span className="block truncate text-caption text-ink-muted">{detail}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export default DashboardPreviewCard;
