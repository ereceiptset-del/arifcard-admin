import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { TriangleAlert, Clock, Users, Banknote, Mail } from "lucide-react";
import {
  Panel,
  PageHeader,
  StatCard,
  StatusPill,
  ErrorState,
  EmptyState,
  Skeleton,
  TextInput,
  BarChart,
  formatMoney,
  formatDate,
  formatDateTime,
} from "@addiscard/ui";
import { adminService } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";

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
 * compute renders as "Unavailable" with the reason, never as 0. Fees,
 * principal and refunds fall in that category: they need a ledger that
 * does not exist, and reporting them as zero would assert that no fees
 * were charged and no refunds are owed.
 *
 * Every figure the previous version showed is still here, with the same
 * value (analytics parity, docs/checkpoint-c.md).
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

const etb = (minor) => formatMoney(minor, "ETB");
const count = (n) => Number(n || 0).toLocaleString("en-US");
/** `{ available, value }` from the backend, or a bare number known to be counted. */
const known = (value) => ({ available: true, value });

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

  const attention = data
    ? [
        waiting > 0 && {
          key: "kyc",
          icon: Users,
          to: "/kyc?status=PENDING",
          text: `${waiting} identity ${waiting === 1 ? "case is" : "cases are"} waiting`,
          detail: kyc.oldestWaiting ? `Oldest since ${formatDateTime(kyc.oldestWaiting.submittedAt)}` : null,
        },
        (payments.needsReview.value || 0) > 0 && {
          key: "payments",
          icon: Banknote,
          to: "/payments?status=REQUIRES_REVIEW",
          text: `${payments.needsReview.value} ${payments.needsReview.value === 1 ? "payment needs" : "payments need"} a person`,
        },
        (ops.failedNotifications.value || 0) > 0 && {
          key: "mail",
          icon: Mail,
          to: "/notifications",
          text: `${ops.failedNotifications.value} ${ops.failedNotifications.value === 1 ? "email" : "emails"} failed to send`,
        },
      ].filter(Boolean)
    : [];

  const series = (byDay, pick = (v) => v) =>
    Object.keys(byDay || {})
      .sort()
      .map((day) => ({ label: day.slice(5), value: pick(byDay[day]) }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Overview"
        description="Counted from the records themselves, each time this page loads."
        meta={
          data && (
            <span className="text-caption text-ink-muted" title={`${data.window.startUtc} to ${data.window.endUtc} UTC`}>
              Updated {formatDateTime(data.generatedAt)}, {data.window.timezone.replace("_", " ")} time
            </span>
          )
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-2">
        <div role="group" aria-label="Period" className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              aria-pressed={period === p.value}
              onClick={() => setPeriod(p.value)}
              className={`min-h-11 rounded-full border px-4 text-small font-medium ${
                period === p.value ? "border-accent bg-accent-soft text-accent-ink" : "border-line-strong bg-surface-1 text-ink-soft hover:bg-surface-2"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <label className="sr-only" htmlFor="overview-provider">
          Payment provider
        </label>
        <select
          id="overview-provider"
          value={provider}
          onChange={(event) => setProvider(event.target.value)}
          className="h-11 rounded-control border border-line-strong bg-surface-1 px-3 text-small text-ink"
        >
          {PROVIDERS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        {period === "custom" && (
          <div className="flex flex-wrap items-end gap-2">
            <TextInput label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <TextInput label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        )}
      </div>

      {period === "custom" && !ready && <p className="text-small text-ink-muted">Choose both dates to see the report.</p>}

      {loading && ready && (
        <div aria-busy="true" className="flex flex-col gap-4">
          <Skeleton className="h-28 w-full rounded-panel" />
          <Skeleton className="h-64 w-full rounded-panel" />
        </div>
      )}

      {!loading && error && <ErrorState title="We couldn't load the overview" error={error} onRetry={reload} />}

      {!loading && !error && data && (
        <>
          {/* Needs attention — first, and only when there is something to act on. */}
          {attention.length > 0 && (
            <section aria-labelledby="attention-title" className="rounded-panel border border-line bg-warning-tint px-4 py-4 sm:px-6">
              <h2 id="attention-title" className="flex items-center gap-2 text-h3 text-ink">
                <TriangleAlert size={18} aria-hidden className="text-warning" />
                Needs attention
              </h2>
              <ul className="mt-3 grid gap-2 md:grid-cols-3">
                {attention.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.key}>
                      <Link to={item.to} className="flex min-h-11 items-start gap-3 rounded-control bg-surface-1 px-3 py-2.5 hover:bg-surface-2">
                        <Icon size={17} aria-hidden className="mt-0.5 shrink-0 text-warning" />
                        <span className="min-w-0">
                          <span className="block text-small font-semibold text-ink">{item.text}</span>
                          {item.detail && <span className="block text-caption text-ink-muted">{item.detail}</span>}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Primary figures: one joined strip, not a wall of identical tiles. */}
          <section aria-label="Key figures" className="grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-line bg-line md:grid-cols-3 xl:grid-cols-6">
            <StatCard className="bg-surface-1" label="Customers" available={customers.total?.available !== false} value={count(customers.total?.value)} reason={customers.total?.reason} hint="All time" />
            <StatCard className="bg-surface-1" label="New customers" available={customers.newInPeriod.available !== false} value={count(customers.newInPeriod.value)} reason={customers.newInPeriod.reason} hint="This period" href="/customers" LinkComponent={Link} />
            <StatCard className="bg-surface-1" label="KYC waiting" value={count(waiting)} hint="Waiting or being reviewed now" tone={waiting > 0 ? "attention" : "default"} href="/kyc?status=PENDING" LinkComponent={Link} />
            <StatCard className="bg-surface-1" label="Verified payments" available={payments.verifiedCount.available !== false} value={count(payments.verifiedCount.value)} reason={payments.verifiedCount.reason} hint="This period" href="/payments?status=VERIFIED" LinkComponent={Link} />
            <StatCard className="bg-surface-1" label="Verified volume" available={payments.verifiedMinor.available !== false} value={etb(payments.verifiedMinor.value)} reason={payments.verifiedMinor.reason} hint="This period" />
            <StatCard
              className="bg-surface-1"
              label="Payments needing a person"
              available={payments.needsReview.available !== false}
              value={count(payments.needsReview.value)}
              reason={payments.needsReview.reason}
              hint="Right now"
              tone={payments.needsReview.value > 0 ? "attention" : "default"}
              href="/payments?status=REQUIRES_REVIEW"
              LinkComponent={Link}
            />
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <MetricList
              title="Identity queue"
              note="Right now"
              rows={[
                ["Waiting", known(kyc.queue.pending), count, "/kyc?status=PENDING"],
                ["Being reviewed", known(kyc.queue.underReview), count, "/kyc?status=UNDER_REVIEW"],
                ["Changes requested", known(kyc.queue.changesRequested), count, "/kyc?status=CHANGES_REQUESTED"],
                ["Approved", known(kyc.queue.approved), count, "/kyc?status=APPROVED"],
                ["Rejected", known(kyc.queue.rejected), count, "/kyc?status=REJECTED"],
              ]}
            />
            <MetricList
              title="Identity decisions"
              note={`${formatDate(data.window.startUtc)} to ${formatDate(new Date(new Date(data.window.endUtc).getTime() - 1))}`}
              rows={[
                ["Decisions made", kyc.decidedInPeriod, count],
                ["Approved", kyc.approvedInPeriod, count],
                ["Rejected", kyc.rejectedInPeriod, count],
                ["Approval rate", kyc.approvalRate, (n) => `${n}%`, null, "Approved ÷ (approved + rejected)"],
                ["Median review time", kyc.medianReviewMinutes, minutesToText],
              ]}
            />
            <MetricList
              title="Verified payments"
              note="This period"
              rows={[
                ["Payments", payments.verifiedCount, count, "/payments?status=VERIFIED", "Counted per payment, not per receipt"],
                ["Amount", payments.verifiedMinor, etb],
                ["CBE", known(payments.byProvider.CBE.count), (n) => `${count(n)} (${etb(payments.byProvider.CBE.minor)})`],
                ["Telebirr", known(payments.byProvider.TELEBIRR.count), (n) => `${count(n)} (${etb(payments.byProvider.TELEBIRR.minor)})`],
              ]}
            />
            <MetricList
              title="Receipts needing a person"
              note="Right now"
              rows={[
                ["Needs a person", payments.needsReview, count, "/payments?status=REQUIRES_REVIEW"],
                ["Still checking", payments.verifying, count],
                ["Already-allocated transactions", payments.duplicateRejected, count, null, "A transaction presented again; never credited twice"],
                ["Provider unreachable", payments.providerFailures, count, null, "Ours to retry, not the customer's fault"],
              ]}
            />
            <MetricList
              title="Money"
              note="Birr received is customers' money awaiting a card. It is not revenue, and nothing here adds ETB to USD."
              rows={[
                ["Received (verified)", payments.verifiedMinor, etb],
                ["Customer principal", payments.principalMinor, etb],
                ["Service fees", payments.feesMinor, etb],
                ["Refunds", payments.refundsMinor, etb],
              ]}
            />
            <MetricList
              title="Cards"
              note="From the card issuer"
              rows={[
                ["Active cards", data.cards, count],
                ["Pending card orders", data.cards, count],
                ["Failed emails", ops.failedNotifications, count, "/notifications"],
                ["Queued emails", ops.pendingNotifications, count, "/notifications"],
              ]}
            />
          </div>

          <section aria-label="Charts" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <ChartPanel empty="No new customers in this period" data={series(customers.registrationsByDay)}>
              {(rows) => <BarChart title="Registrations per day" data={rows} />}
            </ChartPanel>
            <ChartPanel empty="No decisions in this period" data={series(kyc.decisionsByDay, (d) => d.approved + d.rejected + d.changesRequested)}>
              {(rows) => <BarChart title="KYC decisions per day" data={rows} />}
            </ChartPanel>
            <ChartPanel empty="No verified payments in this period" data={series(payments.volumeByDay, (v) => v.minor)}>
              {(rows) => <BarChart title="Verified volume per day (ETB)" data={rows} valueFormat={etb} />}
            </ChartPanel>
          </section>

          <Panel title="Payment providers" description="Verified payments this period, by provider.">
            <ProviderSplit byProvider={payments.byProvider} />
          </Panel>

          <Panel title="Recent activity" description="From the audit trail." padded={false} action={<Link to="/audit" className="inline-flex min-h-11 items-center text-small font-medium text-link hover:underline">Open audit log</Link>}>
            {ops.recentActivity.length === 0 ? (
              <EmptyState compact icon={Clock} title="Nothing recorded yet" description="Sensitive actions appear here as they happen." />
            ) : (
              <ul className="divide-y divide-line">
                {ops.recentActivity.map((entry) => (
                  <li key={entry.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 sm:px-6">
                    <StatusPill tone="neutral" icon={null}>
                      {entry.action}
                    </StatusPill>
                    <span className="min-w-0 flex-1 truncate text-small text-ink">{entry.actorName || "System"}</span>
                    <span className="shrink-0 text-caption text-ink-muted">{entry.createdAt ? formatDateTime(entry.createdAt) : "Time not recorded"}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {(customers.truncated || kyc.truncated || payments.truncated) && (
            <p role="note" className="rounded-control bg-warning-tint px-4 py-3 text-small text-ink">
              More records exist than this report counts. The totals above are a floor, not a total.
            </p>
          )}
        </>
      )}
    </div>
  );
}

/** A titled list of metrics: label left, figure right, "Unavailable" with its reason when not counted. */
function MetricList({ title, note, rows }) {
  return (
    <Panel title={title} description={note}>
      <dl className="divide-y divide-line">
        {rows.map(([label, metric, format, to, hint]) => {
          const available = metric?.available !== false;
          const value = available ? format(metric?.value ?? 0) : "Unavailable";
          return (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
              <dt className="min-w-0 text-small text-ink-soft">
                {to && available ? (
                  <Link to={to} className="text-link hover:underline">
                    {label}
                  </Link>
                ) : (
                  label
                )}
                {hint && available && <span className="block text-caption text-ink-muted">{hint}</span>}
                {!available && metric?.reason && <span className="block text-caption text-ink-muted">{metric.reason}</span>}
              </dt>
              <dd className={`shrink-0 text-right text-small tabular-nums ${available ? "font-semibold text-ink" : "text-ink-muted"}`}>{value}</dd>
            </div>
          );
        })}
      </dl>
    </Panel>
  );
}

function ChartPanel({ data, empty, children }) {
  return <Panel>{data.length === 0 ? <p className="text-small text-ink-muted">{empty}</p> : children(data)}</Panel>;
}

function ProviderSplit({ byProvider }) {
  const rows = [
    ["CBE", byProvider.CBE],
    ["Telebirr", byProvider.TELEBIRR],
  ];
  const total = rows.reduce((sum, [, v]) => sum + (v.count || 0), 0);
  if (total === 0) return <p className="text-small text-ink-muted">No verified payments in this period.</p>;
  return (
    <ul className="flex flex-col gap-3">
      {rows.map(([name, v]) => {
        const share = Math.round(((v.count || 0) / total) * 100);
        return (
          <li key={name}>
            <div className="flex items-baseline justify-between gap-3 text-small">
              <span className="font-medium text-ink">{name}</span>
              <span className="tabular-nums text-ink-soft">
                {count(v.count)} payments, {etb(v.minor)} ({share}%)
              </span>
            </div>
            <div aria-hidden className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-accent" style={{ width: `${share}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
