import { useCallback, useState } from "react";
import { Bell, RefreshCw } from "lucide-react";
import { Panel, Table, Badge, Button, ErrorState, EmptyState, Skeleton, useToast } from "@addiscard/ui";
import { adminService, ApiError } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";

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
 * would be a second copy of everyone's mail.
 */

const STATUS_LABEL = {
  pending: "Queued",
  processing: "Sending",
  sent: "Accepted by mail server",
  failed: "Failed",
};

const STATUS_TONE = {
  pending: "neutral",
  processing: "info",
  sent: "ok",
  failed: "danger",
};

export default function NotificationsPage() {
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);
  const load = useCallback(() => adminService.notificationJobs(), []);
  const { data, error, loading, reload } = useAsync(load, []);

  const jobs = data?.jobs || [];

  async function retry(job) {
    // An ambiguous failure may already have been delivered, so retrying
    // can send a duplicate. The backend refuses unless that is
    // acknowledged, and this asks rather than acknowledging on the
    // customer's behalf.
    if (job.ambiguous) {
      const ok = window.confirm(
        "This job failed in a way that may still have delivered the message.\n\n" +
          "Retrying could send the customer a duplicate. Continue?"
      );
      if (!ok) return;
    }

    setBusyId(job.id);
    try {
      await adminService.retryJob(job.id, { acknowledgeDuplicateRisk: Boolean(job.ambiguous) });
      toast.success("Re-queued.");
      reload();
    } catch (problem) {
      toast.error(problem instanceof ApiError ? problem.message : "Could not retry that job.");
    } finally {
      setBusyId(null);
    }
  }

  const columns = [
    { key: "id", header: "Job", render: (row) => <span className="font-mono text-[12px]">{row.id}</span> },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <div className="min-w-0">
          <Badge tone={STATUS_TONE[row.status] || "neutral"}>{STATUS_LABEL[row.status] || row.status}</Badge>
          {row.ambiguous && (
            <p className="mt-1 text-[11px] text-warn">May already have been delivered</p>
          )}
        </div>
      ),
    },
    { key: "attempts", header: "Attempts", align: "right" },
    {
      key: "lastError",
      header: "Last error",
      render: (row) => (
        <span className="text-[12px] text-ink-muted dark:text-ink-muted-dark">{row.lastError || "—"}</span>
      ),
    },
    {
      key: "sentAt",
      header: "Accepted at",
      render: (row) => (row.sentAt ? new Date(row.sentAt).toLocaleString() : "—"),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) =>
        row.status === "failed" ? (
          <Button variant="secondary" icon={RefreshCw} loading={busyId === row.id} onClick={() => retry(row)}>
            Retry
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">Notifications</h1>
      <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
        Decision emails queued for customers. “Accepted by mail server” means exactly that — it is not proof
        the message reached an inbox.
      </p>

      <div className="mt-5">
        <Panel padded={false}>
          {loading && (
            <div className="p-5">
              <Skeleton className="h-[160px] w-full" />
            </div>
          )}
          {!loading && error && (
            <div className="p-5">
              <ErrorState title="Could not load notification jobs" message={error.message} onRetry={reload} />
            </div>
          )}
          {!loading && !error && jobs.length === 0 && (
            <EmptyState
              icon={Bell}
              title="No notification jobs"
              description="A job appears here each time a reviewer decides a case."
            />
          )}
          {!loading && !error && jobs.length > 0 && <Table columns={columns} rows={jobs} />}
        </Panel>
      </div>
    </>
  );
}
