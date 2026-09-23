import { useCallback } from "react";
import { Link } from "react-router-dom";
import { Clock, Eye, CheckCircle2, XCircle, AlertTriangle, Inbox } from "lucide-react";
import { Panel, Badge, ErrorState, EmptyState, Skeleton } from "@addiscard/ui";
import { adminService, KYC_STATUS_LABEL, KYC_STATUS_TONE } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";

/**
 * The staff landing screen.
 *
 * Every number here is counted from the same records the queue lists, and
 * each one links to that queue filtered to what it counted — so a figure
 * that looks wrong can be opened and checked rather than argued about.
 *
 * This page previously rendered customers, cards, payments and a wallet
 * balance, all of which came out as zero: it was reading a shape the API
 * stopped returning when the mock server was removed. Four confident
 * zeros beside real pending work is worse than an empty page, because
 * nothing about it looked broken.
 *
 * What is deliberately absent: registrations over time, payment volume,
 * approval rate and median review time. Those need period boundaries and
 * bounded aggregate queries that are not built, and a chart drawn from
 * data this page does not have would be a drawing, not a measurement.
 */

const TILES = [
  {
    key: "pending",
    label: "Waiting for review",
    icon: Clock,
    tone: "warn",
    to: "/admin/kyc?status=PENDING",
  },
  {
    key: "underReview",
    label: "Being reviewed",
    icon: Eye,
    tone: "info",
    to: "/admin/kyc?status=UNDER_REVIEW",
  },
  {
    key: "changesRequested",
    label: "Changes requested",
    icon: AlertTriangle,
    tone: "warn",
    to: "/admin/kyc?status=CHANGES_REQUESTED",
  },
  {
    key: "approved",
    label: "Approved",
    icon: CheckCircle2,
    tone: "ok",
    to: "/admin/kyc?status=APPROVED",
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: XCircle,
    tone: "danger",
    to: "/admin/kyc?status=REJECTED",
  },
];

export default function OverviewPage() {
  const load = useCallback(() => adminService.overview(), []);
  const { data, error, loading, reload } = useAsync(load, []);

  const counts = data?.counts;
  const recent = data?.recent || [];
  const waiting = (counts?.pending || 0) + (counts?.underReview || 0);

  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">Overview</h1>
      <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
        Identity verification, counted from the cases themselves.
      </p>

      {loading && (
        <div className="mt-6 flex flex-col gap-5">
          <Skeleton className="h-[96px] w-full" />
          <Skeleton className="h-[220px] w-full" />
        </div>
      )}

      {!loading && error && (
        <div className="mt-6">
          <ErrorState title="Could not load the overview" message={error.message} onRetry={reload} />
        </div>
      )}

      {!loading && !error && counts && (
        <>
          {/* Needs attention, stated once and only when true. A banner that
              is always on screen stops being read. */}
          {waiting > 0 && (
            <div className="mt-6 rounded-panel border border-warn/25 bg-warn/5 px-4 py-3">
              <p className="text-[13.5px] text-ink dark:text-ink-dark">
                <span className="font-semibold">{waiting}</span>{" "}
                {waiting === 1 ? "customer is" : "customers are"} waiting on identity review.{" "}
                <Link to="/admin/kyc?status=PENDING" className="font-medium text-brand hover:underline">
                  Open the queue
                </Link>
              </p>
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-5">
            {TILES.map((tile) => {
              const Icon = tile.icon;
              return (
                <Link
                  key={tile.key}
                  to={tile.to}
                  className="rounded-panel border border-line dark:border-line-dark bg-panel dark:bg-panel-dark p-4 transition-colors hover:border-brand/40"
                >
                  <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-${tile.tone}/10`}>
                    <Icon size={15} className={`text-${tile.tone}`} aria-hidden="true" />
                  </span>
                  <p className="mt-3 font-mono text-[26px] leading-none text-ink dark:text-ink-dark">
                    {counts[tile.key] ?? 0}
                  </p>
                  <p className="mt-1.5 text-[12.5px] text-ink-muted dark:text-ink-muted-dark">{tile.label}</p>
                </Link>
              );
            })}
          </div>

          <div className="mt-5">
            <Panel
              title="Recent cases"
              description="Newest first. Open one to review its evidence."
              padded={false}
            >
              {recent.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="No cases yet"
                  description="Submissions appear here as customers send them."
                />
              ) : (
                <ul className="divide-y divide-line dark:divide-line-dark">
                  {recent.map((row) => (
                    <li key={row.id}>
                      <Link
                        to={`/admin/kyc/${row.id}`}
                        className="flex items-center gap-3 px-5 py-4 hover:bg-panel-muted dark:hover:bg-white/[0.03]"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] font-medium text-ink dark:text-ink-dark">
                            {row.customer?.name || row.customer?.email || "—"}
                          </p>
                          <p className="truncate text-[12px] text-ink-faint">
                            {row.customer?.email} · v{row.version}
                          </p>
                        </div>
                        <Badge tone={KYC_STATUS_TONE[row.kycStatus]}>
                          {KYC_STATUS_LABEL[row.kycStatus] || row.kycStatus}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          {/* Said plainly rather than filled with placeholder charts. */}
          <p className="mt-5 text-[12.5px] text-ink-faint">
            Registration trends, payment volume, approval rate and review times are not measured yet. They
            need period boundaries and aggregate queries that are not built, and a chart drawn without them
            would not be a measurement.
          </p>
        </>
      )}
    </>
  );
}
