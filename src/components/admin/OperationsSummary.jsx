import { useCallback } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, ArrowUpFromLine, ShieldCheck, Banknote, ChevronRight } from "lucide-react";
import { Skeleton, ErrorState, Button, formatDateTime, timeAgo } from "@addiscard/ui";
import { useAsync } from "../../hooks/useAsync.js";
import { adminLists } from "../../data/adminLists.js";

/**
 * What needs a person right now: four queues, first on the overview.
 *
 * Every figure comes from GET /admin/operations/summary, which counts with
 * the same definitions the queues use — so each number opens exactly the
 * rows it counts. A figure the backend could not count says "Unavailable",
 * never 0. Opening this page sends nothing to any provider.
 */
export function OperationsSummary() {
  const load = useCallback(() => adminLists.operationsSummary(), []);
  const { data, error, loading, reload } = useAsync(load, []);
  const s = data?.summary;

  if (loading && !s) {
    return (
      <div aria-busy="true" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((n) => (
          <Skeleton key={n} className="h-40 w-full rounded-panel" />
        ))}
      </div>
    );
  }
  if (error && !s) return <ErrorState title="We couldn't count the work queues" error={error} onRetry={reload} />;
  if (!s) return null;

  const issuance = s.issuance;
  const topups = s.topups;
  const kyc = s.kyc;
  const payments = s.payments;

  return (
    <section aria-labelledby="ops-title" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="ops-title" className="text-h3 text-ink">
          Needs a person now
        </h2>
        <span className="text-caption text-ink-muted">
          Counted {formatDateTime(s.generatedAt)}
          <Button variant="ghost" size="sm" className="ml-2" onClick={reload} loading={loading}>
            Refresh
          </Button>
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <QueueCard
          icon={BadgeCheck}
          title="Ready for card issuance"
          to="/card-issuance"
          action="Review card issuance"
          value={issuance.unavailable ? null : issuance.ready}
          unavailable={issuance.unavailable}
          note={issuance.oldestReadySince ? `Oldest waiting ${timeAgo(issuance.oldestReadySince)}` : null}
          rows={
            issuance.unavailable
              ? []
              : [
                  ["Blocked or failed", issuance.blocked, "/card-issuance"],
                  ["Being created", issuance.provisioning, "/card-issuance"],
                  ["Outcome unknown — reconcile", issuance.reconciliation, "/card-issuance"],
                ]
          }
          badge={issuance.environment === "sandbox" ? "Sandbox" : null}
        />
        <QueueCard
          icon={ArrowUpFromLine}
          title="Card top-up requests"
          to="/top-ups"
          action="Open top-ups"
          value={topups.unavailable ? null : topups.actionable}
          valueHint="actionable"
          unavailable={topups.unavailable}
          rows={
            topups.unavailable
              ? []
              : [
                  ["Awaiting USD allocation", topups.awaiting_allocation, "/top-ups?bucket=awaiting_allocation"],
                  ["Ready for funding", topups.ready_for_funding, "/top-ups?bucket=ready_for_funding"],
                  ["Needs attention", topups.needs_attention, "/top-ups?bucket=needs_attention"],
                  ["Reconciliation required", topups.reconciliation_required, "/top-ups?bucket=reconciliation_required"],
                  ["Awaiting payment verification", topups.verifying_payment, "/top-ups?bucket=verifying_payment"],
                ]
          }
        />
        <QueueCard
          icon={ShieldCheck}
          title="KYC awaiting review"
          to="/kyc?status=PENDING"
          action="Open KYC queue"
          value={kyc.unavailable ? null : kyc.awaitingReview}
          unavailable={kyc.unavailable}
          rows={
            kyc.unavailable
              ? []
              : [
                  ["Waiting", kyc.pending, "/kyc?status=PENDING"],
                  ["Being reviewed", kyc.underReview, "/kyc?status=UNDER_REVIEW"],
                ]
          }
        />
        <QueueCard
          icon={Banknote}
          title="Payments needing a person"
          to="/payments?status=REQUIRES_REVIEW"
          action="Open payments"
          value={payments.unavailable ? null : payments.needsPerson}
          unavailable={payments.unavailable}
          rows={
            payments.unavailable
              ? []
              : [
                  ["Verification delayed", payments.verificationDelayed, "/payments?status=DELAYED"],
                  ["Awaiting reference", payments.awaitingReference, "/payments?status=AWAITING_REFERENCE"],
                  ["Reference overdue", payments.referenceOverdue, "/payments?status=REFERENCE_OVERDUE"],
                ]
          }
        />
      </div>
    </section>
  );
}

/** One queue: the headline count, its breakdown, and the way in. */
function QueueCard({ icon: Icon, title, to, action, value, valueHint, unavailable, note, rows, badge }) {
  const known = (n) => (typeof n === "number" ? n.toLocaleString("en-US") : "Unavailable");
  return (
    <article className="flex flex-col rounded-panel border border-line bg-surface-1">
      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex items-center gap-2 text-small font-semibold text-ink">
            <Icon size={17} aria-hidden className="shrink-0 text-ink-muted" />
            {title}
          </h3>
          {badge && <span className="rounded-full bg-warning-tint px-2 py-0.5 text-caption font-medium text-warning">{badge}</span>}
        </div>
        {unavailable ? (
          <div>
            <p className="text-h3 text-ink-soft">Unavailable</p>
            <p className="text-caption text-ink-muted">{unavailable}</p>
          </div>
        ) : (
          <p className={`text-h1 tabular-nums ${value > 0 ? "text-ink" : "text-ink-soft"}`}>
            {known(value)}
            {valueHint && <span className="ml-1.5 text-small font-normal text-ink-muted">{valueHint}</span>}
          </p>
        )}
        {note && <p className="text-caption text-ink-muted">{note}</p>}
        {rows.length > 0 && (
          <dl className="mt-1 divide-y divide-line text-small">
            {rows.map(([label, n, href]) => (
              <div key={label} className="flex items-center justify-between gap-3 py-1.5">
                <dt className="min-w-0">
                  <Link to={href} className="text-ink-soft hover:text-ink hover:underline">
                    {label}
                  </Link>
                </dt>
                <dd className="tabular-nums text-ink">{known(n)}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <Link to={to} className="flex min-h-11 items-center justify-between gap-2 border-t border-line px-4 text-small font-medium text-link hover:bg-surface-2 sm:px-5">
        {action}
        <ChevronRight size={16} aria-hidden />
      </Link>
    </article>
  );
}
