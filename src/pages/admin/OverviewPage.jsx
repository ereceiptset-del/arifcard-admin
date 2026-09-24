import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Clock, Inbox } from "lucide-react";
import { Panel, Badge, ErrorState, EmptyState, Skeleton, TextInput } from "@addiscard/ui";
import { adminService, KYC_STATUS_LABEL, KYC_STATUS_TONE, birr } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";
import { Metric, BarChart } from "../../components/admin/Metric.jsx";

/**
 * The operational dashboard.
 *
 * Everything is counted from the records on each request; there are no
 * stored counters to drift, and nothing is compared against a prior
 * period nobody measured.
 *
 * Two distinctions the layout keeps visible:
 *
 * **Right now versus this period.** The queue is a snapshot — how many
 * cases are waiting at this moment. Decisions, registrations and verified
 * payments are activity inside the chosen window. They are in separate
 * sections because merging them produces a number that answers neither
 * question.
 *
 * **Counted zero versus could not count.** A metric the backend could not
 * compute renders as "unavailable" with the reason, never as 0. Fees,
 * principal and refunds fall in that category: they need a ledger that
 * does not exist, and reporting them as zero would assert that no fees
 * were charged and no refunds are owed.
 */

const PERIODS = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "custom", label: "Custom" },
];

const PROVIDERS = [
  { value: "all", label: "All providers" },
  { value: "CBE", label: "CBE" },
  { value: "TELEBIRR", label: "Telebirr" },
];

const minutesToText = (n) => {
  if (n < 60) return `${n} min`;
  if (n < 1440) return `${Math.round((n / 60) * 10) / 10} h`;
  return `${Math.round((n / 1440) * 10) / 10} d`;
};

export default function OverviewPage() {
  const [period, setPeriod] = useState("7d");
  const [provider, setProvider] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const ready = period !== "custom" || (from && to);

  const load = useCallback(
    () => (ready ? adminService.analytics({ period, provider, from, to }) : Promise.resolve(null)),
    [period, provider, from, to, ready]
  );
  const { data, error, loading, reload } = useAsync(load, [period, provider, from, to, ready]);

  const kyc = data?.kyc;
  const payments = data?.payments;
  const customers = data?.customers;
  const ops = data?.operations;
  const waiting = (kyc?.queue.pending || 0) + (kyc?.queue.underReview || 0);

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">Overview</h1>
          <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
            Counted from the records themselves, each time this page loads.
          </p>
        </div>
        {data && (
          <p className="text-[12px] text-ink-faint">
            Last updated {new Date(data.generatedAt).toLocaleTimeString()} ·{" "}
            <span title={`${data.window.startUtc} to ${data.window.endUtc} UTC`}>
              {data.window.timezone.replace("_", " ")}
            </span>
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-end gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setPeriod(p.value)}
            className={`rounded-full border px-3 py-1.5 text-[12.5px] ${
              period === p.value
                ? "border-brand bg-brand/10 text-brand"
                : "border-line dark:border-line-dark text-ink-muted dark:text-ink-muted-dark"
            }`}
          >
            {p.label}
          </button>
        ))}

        <select
          value={provider}
          onChange={(event) => setProvider(event.target.value)}
          aria-label="Payment provider"
          className="h-8 rounded-field border border-line dark:border-line-dark bg-panel dark:bg-panel-dark px-2 text-[12.5px] text-ink dark:text-ink-dark"
        >
          {PROVIDERS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        {period === "custom" && (
          <div className="flex items-end gap-2">
            <TextInput label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <TextInput label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        )}
      </div>

      {period === "custom" && !ready && (
        <p className="mt-4 text-[13px] text-ink-muted dark:text-ink-muted-dark">
          Choose both dates to see the report.
        </p>
      )}

      {loading && ready && (
        <div className="mt-6 flex flex-col gap-5">
          <Skeleton className="h-[110px] w-full" />
          <Skeleton className="h-[220px] w-full" />
        </div>
      )}

      {!loading && error && (
        <div className="mt-6">
          <ErrorState title="Could not load the dashboard" message={error.message} onRetry={reload} />
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Needs attention — shown only when there is something to act on. */}
          {(waiting > 0 || (ops?.failedNotifications.value || 0) > 0 || (payments?.needsReview.value || 0) > 0) && (
            <div className="mt-6 rounded-panel border border-warn/30 bg-warn/5 px-4 py-3">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-ink dark:text-ink-dark">
                <AlertTriangle size={15} className="text-warn" aria-hidden="true" />
                Needs attention
              </p>
              <ul className="mt-2 flex flex-col gap-1 text-[13px] text-ink dark:text-ink-dark">
                {waiting > 0 && (
                  <li>
                    <Link to="/admin/kyc?status=PENDING" className="text-brand hover:underline">
                      {waiting} identity {waiting === 1 ? "case is" : "cases are"} waiting
                    </Link>
                    {kyc?.oldestWaiting && (
                      <span className="text-ink-faint">
                        {" "}
                        — oldest since {new Date(kyc.oldestWaiting.submittedAt).toLocaleDateString()}
                      </span>
                    )}
                  </li>
                )}
                {(payments?.needsReview.value || 0) > 0 && (
                  <li>
                    <Link to="/admin/payments?status=REQUIRES_REVIEW" className="text-brand hover:underline">
                      {payments.needsReview.value} payment(s) need a person
                    </Link>
                  </li>
                )}
                {(ops?.failedNotifications.value || 0) > 0 && (
                  <li>
                    <Link to="/admin/notifications" className="text-brand hover:underline">
                      {ops.failedNotifications.value} email(s) failed to send
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Queue — a snapshot of now, not of the period. */}
          <h2 className="mt-6 text-[14px] font-semibold text-ink dark:text-ink-dark">
            Identity queue <span className="font-normal text-ink-faint">— right now</span>
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-5">
            <Metric label="Waiting" metric={{ available: true, value: kyc.queue.pending }} to="/admin/kyc?status=PENDING" tone={kyc.queue.pending > 0 ? "warn" : "neutral"} />
            <Metric label="Being reviewed" metric={{ available: true, value: kyc.queue.underReview }} to="/admin/kyc?status=UNDER_REVIEW" />
            <Metric label="Changes requested" metric={{ available: true, value: kyc.queue.changesRequested }} to="/admin/kyc?status=CHANGES_REQUESTED" />
            <Metric label="Approved" metric={{ available: true, value: kyc.queue.approved }} to="/admin/kyc?status=APPROVED" />
            <Metric label="Rejected" metric={{ available: true, value: kyc.queue.rejected }} to="/admin/kyc?status=REJECTED" />
          </div>

          {/* Period activity */}
          <h2 className="mt-7 text-[14px] font-semibold text-ink dark:text-ink-dark">
            In this period{" "}
            <span className="font-normal text-ink-faint">
              — {new Date(data.window.startUtc).toLocaleDateString()} to{" "}
              {new Date(new Date(data.window.endUtc).getTime() - 1).toLocaleDateString()}
            </span>
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Metric label="New customers" metric={customers.newInPeriod} to="/admin/customers" />
            <Metric label="Decisions made" metric={kyc.decidedInPeriod} />
            <Metric
              label="Approval rate"
              metric={kyc.approvalRate}
              format={(n) => `${n}%`}
              hint="approved ÷ (approved + rejected)"
            />
            <Metric label="Median review time" metric={kyc.medianReviewMinutes} format={minutesToText} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Metric label="Verified payments" metric={payments.verifiedCount} to="/admin/payments?status=VERIFIED" hint="counted per payment, not per receipt" />
            <Metric label="Verified amount" metric={payments.verifiedMinor} format={(n) => birr(n)} />
            <Metric label="CBE" metric={{ available: true, value: payments.byProvider.CBE.count }} />
            <Metric label="Telebirr" metric={{ available: true, value: payments.byProvider.TELEBIRR.count }} />
          </div>

          <h2 className="mt-7 text-[14px] font-semibold text-ink dark:text-ink-dark">
            Receipts needing a person <span className="font-normal text-ink-faint">— right now</span>
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Metric label="Needs a person" metric={payments.needsReview} to="/admin/payments?status=REQUIRES_REVIEW" tone={payments.needsReview.value > 0 ? "warn" : "neutral"} />
            <Metric label="Still checking" metric={payments.verifying} />
            <Metric label="Already-allocated transactions" metric={payments.duplicateRejected} hint="a transaction presented again — never credited twice" />
            <Metric label="Provider unreachable" metric={payments.providerFailures} hint="ours to retry, not the customer's fault" />
          </div>

          {/* Money that would need a ledger. */}
          <h2 className="mt-7 text-[14px] font-semibold text-ink dark:text-ink-dark">Money</h2>
          <p className="mt-1 text-[12.5px] text-ink-faint">
            Birr received is customers' money awaiting a card. It is not revenue, and nothing here adds ETB to
            USD.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Metric label="Received (verified)" metric={payments.verifiedMinor} format={(n) => birr(n)} />
            <Metric label="Customer principal" metric={payments.principalMinor} />
            <Metric label="Service fees" metric={payments.feesMinor} />
            <Metric label="Refunds" metric={payments.refundsMinor} />
          </div>

          {/* Charts */}
          <div className="mt-7 grid gap-5 lg:grid-cols-3">
            <Panel>
              <BarChart title="Registrations" series={customers.registrationsByDay} empty="No new customers in this period" />
            </Panel>
            <Panel>
              <BarChart
                title="KYC decisions"
                series={Object.fromEntries(
                  Object.entries(kyc.decisionsByDay).map(([day, d]) => [
                    day,
                    d.approved + d.rejected + d.changesRequested,
                  ])
                )}
                empty="No decisions in this period"
              />
            </Panel>
            <Panel>
              <BarChart
                title="Verified payment volume"
                series={Object.fromEntries(Object.entries(payments.volumeByDay).map(([day, v]) => [day, v.minor]))}
                format={(n) => birr(n).replace(" ETB", "")}
                empty="No verified payments in this period"
              />
            </Panel>
          </div>

          {/* Cards — absent, and said so. */}
          <div className="mt-5">
            <Panel padded={false}>
              <EmptyState
                icon={Inbox}
                title={data.cards.reason}
                description="Card orders, issuance and reconciliation figures will appear here once a provider is connected. They are not shown as zero, because zero would read as nothing needing attention."
                dashed
              />
            </Panel>
          </div>

          {/* Recent admin activity */}
          <div className="mt-5">
            <Panel title="Recent activity" description="From the audit trail." padded={false}>
              {ops.recentActivity.length === 0 ? (
                <EmptyState icon={Clock} title="Nothing recorded yet" description="Sensitive actions appear here as they happen." />
              ) : (
                <ul className="divide-y divide-line dark:divide-line-dark">
                  {ops.recentActivity.map((entry) => (
                    <li key={entry.id} className="flex items-center gap-3 px-5 py-3">
                      <Badge tone="neutral">{entry.action}</Badge>
                      <span className="min-w-0 flex-1 truncate text-[13px] text-ink dark:text-ink-dark">
                        {entry.actorName || "—"}
                      </span>
                      <span className="shrink-0 text-[12px] text-ink-faint">
                        {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          {(customers.truncated || kyc.truncated || payments.truncated) && (
            <p className="mt-5 text-[12px] text-warn">
              More records exist than this report counts. The totals above are a floor, not a total.
            </p>
          )}
        </>
      )}
    </>
  );
}
