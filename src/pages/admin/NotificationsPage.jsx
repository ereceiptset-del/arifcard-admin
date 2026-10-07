import { useCallback, useState } from "react";
import { Bell, RefreshCw } from "lucide-react";
import { Panel, PageHeader, Table, StatusPill, Button, Dialog, ErrorState, EmptyState, Skeleton, useToast, formatDateTime } from "@addiscard/ui";
import { adminService, ApiError } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";
import { usePage } from "../../hooks/usePage.js";
import { adminLists } from "../../data/adminLists.js";
import { PageNav } from "../../components/admin/PageNav.jsx";

/**
 * Outbound email jobs.
 *
 * The one thing this screen must not do is overstate delivery. `sent`
 * means the mail server **accepted** the message — not that it reached an
 * inbox — and the wording says so, because a support conversation that
 * starts from "our system says it was delivered" when it was not wastes
 * everybody's time.
 *
 * Jobs carry no recipient address and no message body; a queue that did
 * would be a second copy of everyone's mail. Retry exists only for failed
 * jobs, through the existing protected endpoint.
 */

const STATUS_LABEL = { pending: "Queued", processing: "Sending", sent: "Accepted by mail server", failed: "Failed" };
const STATUS_TONE = { pending: "neutral", processing: "info", sent: "success", failed: "danger" };
const TYPE_LABEL = {
  kyc_decision: "KYC decision",
  payment_verified: "Payment verified",
  payment_rejected: "Receipt not accepted",
  payment_requires_review: "Payment with our team",
  card_order_update: "Card order update",
};
const FILTERS = ["all", "failed", "pending", "processing", "sent"];

export default function NotificationsPage() {
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [confirming, setConfirming] = useState(null);
  const [page, setPage] = usePage(filter);
  // The status filter and the page are applied on the server; the failed
  // count comes from the server's total, not from the page on screen.
  const load = useCallback(async () => {
    const [list, failed] = await Promise.all([
      adminLists.notificationJobs({ status: filter, page }),
      filter === "failed" ? null : adminLists.notificationJobs({ status: "failed", page: 1 }),
    ]);
    return { ...list, failedTotal: (failed || list).pagination?.total ?? 0 };
  }, [filter, page]);
  const { data, error, loading, reload } = useAsync(load, [filter, page]);
  const shown = data?.jobs || [];
  const failedCount = data?.failedTotal || 0;

  async function retry(job) {
    setBusyId(job.id);
    try {
      // An ambiguous failure may already have been delivered; the backend
      // refuses unless that risk is acknowledged, which the staff member
      // just did in the dialog.
      await adminService.retryJob(job.id, { acknowledgeDuplicateRisk: Boolean(job.ambiguous) });
      toast.success("The email is queued again.", "Retrying");
      reload();
    } catch (problem) {
      toast.error(problem instanceof ApiError ? problem.message : "We couldn't retry that email. Try again.");
    } finally {
      setBusyId(null);
      setConfirming(null);
    }
  }

  const columns = [
    {
      key: "type",
      header: "Email",
      render: (row) => (
        <span className="block min-w-0">
          <span className="block truncate">{TYPE_LABEL[row.type] || row.type || "Email"}</span>
          <span className="block truncate text-caption font-normal text-ink-muted">About {row.subjectId || "an unknown record"}</span>
        </span>
      ),
    },
    {
      key: "status",
      header: "Delivery",
      render: (row) => (
        <span className="block">
          <StatusPill tone={STATUS_TONE[row.status] || "neutral"}>{STATUS_LABEL[row.status] || row.status}</StatusPill>
          {row.ambiguous && <span className="mt-1 block text-caption text-warning">May already have been delivered</span>}
        </span>
      ),
    },
    { key: "attempts", header: "Attempts", align: "right", hideBelow: "md" },
    { key: "lastError", header: "Last error", hideBelow: "lg", render: (row) => <span className="text-caption text-ink-soft">{row.lastError || "None"}</span> },
    { key: "createdAt", header: "Queued", hideBelow: "lg", render: (row) => formatDateTime(row.createdAt) || "Not recorded" },
    { key: "sentAt", header: "Accepted", hideBelow: "md", render: (row) => (row.sentAt ? formatDateTime(row.sentAt) : "Not yet") },
    {
      key: "actions",
      header: "Action",
      align: "right",
      render: (row) =>
        row.status === "failed" ? (
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={busyId === row.id}
            onClick={(event) => {
              event.stopPropagation();
              if (row.ambiguous) setConfirming(row);
              else retry(row);
            }}
          >
            Retry
          </Button>
        ) : (
          <span className="text-caption text-ink-muted">None</span>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notifications"
        description="Emails queued for customers. “Accepted by mail server” means exactly that; it isn't proof the message reached an inbox."
      />

      <div role="group" aria-label="Delivery status" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTERS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className={`min-h-11 shrink-0 rounded-full border px-4 text-small font-medium ${
              filter === value ? "border-accent bg-accent-soft text-accent-ink" : "border-line-strong bg-surface-1 text-ink-soft hover:bg-surface-2"
            }`}
          >
            {value === "all" ? "All" : STATUS_LABEL[value]}
            {value === "failed" && failedCount > 0 ? <span className="ml-1.5 tabular-nums">{failedCount}</span> : null}
          </button>
        ))}
      </div>

      <Panel padded={false} title="Recent emails" description="Newest first.">
        {loading && (
          <div aria-busy="true" className="flex flex-col gap-2 px-4 pb-4 sm:px-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}
        {!loading && error && (
          <div className="px-4 pb-4 sm:px-6">
            <ErrorState title="We couldn't load email jobs" error={error} onRetry={reload} headingLevel={3} />
          </div>
        )}
        {!loading && !error && shown.length === 0 && (
          <EmptyState compact icon={Bell} title={filter === "all" ? "No emails yet" : "None with this status"} description="A job appears each time a decision or payment result is emailed to a customer." />
        )}
        {!loading && !error && shown.length > 0 && <Table caption="Email jobs" columns={columns} rows={shown} />}
        {!error && <PageNav pagination={data?.pagination} onPage={setPage} loading={loading} />}
      </Panel>

      <Dialog
        open={Boolean(confirming)}
        onClose={() => setConfirming(null)}
        title="Retry this email?"
        description="It failed in a way that may still have delivered the message. Retrying could send the customer a duplicate."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirming(null)}>
              Don't retry
            </Button>
            <Button loading={busyId === confirming?.id} onClick={() => retry(confirming)}>
              Retry anyway
            </Button>
          </>
        }
      >
        <p className="text-small text-ink-soft">{confirming ? `${TYPE_LABEL[confirming.type] || "Email"} about ${confirming.subjectId}.` : null}</p>
      </Dialog>
    </div>
  );
}
