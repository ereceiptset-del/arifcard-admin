import { useCallback, useState } from "react";
import { ScrollText } from "lucide-react";
import { Panel, PageHeader, Table, StatusPill, Drawer, ErrorState, EmptyState, Skeleton, formatDateTime } from "@addiscard/ui";
import { useAsync } from "../../hooks/useAsync.js";
import { usePage } from "../../hooks/usePage.js";
import { adminLists } from "../../data/adminLists.js";
import { PageNav } from "../../components/admin/PageNav.jsx";

/**
 * The audit trail.
 *
 * Read-only, and there is no route that could make it otherwise: nothing
 * writes, edits or deletes an entry, because a trail that can be
 * rewritten is not a trail.
 *
 * It records *that* something happened and who did it — never the
 * contents of a document, a receipt token or a customer's details. A log
 * that carried those would itself be worth stealing. The detail view shows
 * only the fields the backend stored on the entry.
 */

// Every action the backend writes (backend services; scripts/provision-owner.mjs).
const ACTIONS = [
  ["kyc.claim", "KYC review started"],
  ["kyc.decision", "KYC decision"],
  ["payment.recheck", "Payment re-checked"],
  ["payment.staff_decision", "Payment decided by staff"],
  ["payment.decision", "Payment decided"],
  ["card.order.created", "Card ordered"],
  ["card.order.issuance", "Card issuance"],
  ["card.order.resolved", "Card order resolved"],
  ["provider.funding.created", "Funding created"],
  ["provider.funding.status", "Funding status"],
  ["provider.funding.resolved", "Funding resolved"],
  ["provider.operation", "Issuer operation"],
  ["provider.operation.reconcile_requested", "Issuer asked again"],
  ["provider.operation.resolved", "Issuer operation resolved"],
  ["provider.event.applied", "Issuer event applied"],
  ["provider.event.reprocess", "Issuer event reprocessed"],
  ["staff.owner.granted", "Ownership granted"],
];
const LABEL = Object.fromEntries(ACTIONS);
const tone = (action) => (action === "staff.owner.granted" ? "danger" : action.startsWith("kyc") ? "accent" : action.startsWith("payment") ? "info" : "neutral");

/** Human labels for fields entries commonly carry. */
const FIELD_LABEL = {
  fromStatus: "Old state",
  toStatus: "New state",
  from: "Old state",
  to: "New state",
  decision: "Decision",
  reasonCode: "Reason code",
  version: "Version",
  operationId: "Operation",
  orderId: "Order",
  intentId: "Payment",
  claimId: "Claim",
  resolution: "Resolution",
};

export default function AuditLogPage() {
  const [action, setAction] = useState("all");
  const [open, setOpen] = useState(null);
  const [page, setPage] = usePage(action);
  const load = useCallback(() => adminLists.auditLog({ action, page }), [action, page]);
  const { data, error, loading, reload } = useAsync(load, [action, page]);
  const entries = data?.entries || [];

  const columns = [
    { key: "action", header: "Action", render: (row) => <StatusPill tone={tone(row.action)} icon={null}>{LABEL[row.action] || row.action}</StatusPill> },
    { key: "actor", header: "Who", render: (row) => row.actorName || row.actorUid || "System" },
    {
      key: "subject",
      header: "Resource",
      hideBelow: "md",
      render: (row) => (
        <span className="block min-w-0">
          <span className="block truncate">{row.subjectType || "Record"}</span>
          <span className="block truncate text-caption text-ink-muted">{row.subjectId || "No ID"}</span>
        </span>
      ),
    },
    { key: "change", header: "Change", hideBelow: "lg", render: (row) => change(row.detail) || <span className="text-ink-muted">Not recorded</span> },
    { key: "createdAt", header: "When", render: (row) => (row.createdAt ? formatDateTime(row.createdAt) : "Not recorded") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Audit logs" description="Who did what, and when. Append-only: nothing here can be edited or removed." />

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="audit-action" className="mb-1.5 block text-small font-medium text-ink">
            Action
          </label>
          <select id="audit-action" value={action} onChange={(event) => setAction(event.target.value)} className="h-11 rounded-control border border-line-strong bg-surface-1 px-3 text-small text-ink">
            <option value="all">All actions</option>
            {ACTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <p className="pb-3 text-caption text-ink-muted">Newest first, for the chosen action.</p>
      </div>

      <Panel padded={false}>
        {loading && (
          <div aria-busy="true" className="flex flex-col gap-2 p-4 sm:p-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}
        {!loading && error && (
          <div className="p-4 sm:p-6">
            <ErrorState title="We couldn't load the audit log" error={error} onRetry={reload} />
          </div>
        )}
        {!loading && !error && entries.length === 0 && (
          <EmptyState headingLevel={2} icon={ScrollText} title="Nothing recorded yet" description="Decisions, ownership changes and other sensitive actions appear here as they happen." />
        )}
        {!loading && !error && entries.length > 0 && <Table caption="Audit entries" columns={columns} rows={entries} onRowClick={setOpen} />}
        {!error && <PageNav pagination={data?.pagination} onPage={setPage} loading={loading} />}
      </Panel>

      {open && (
        <Drawer open onClose={() => setOpen(null)} title={LABEL[open.action] || open.action} description={open.createdAt ? formatDateTime(open.createdAt) : undefined}>
          <div className="flex flex-col gap-5">
            <dl className="divide-y divide-line rounded-control border border-line">
              <Fact label="Action" value={open.action} />
              <Fact label="Who" value={open.actorName || open.actorUid || "System"} />
              <Fact label="Staff ID" value={open.actorUid} />
              <Fact label="Resource" value={open.subjectType} />
              <Fact label="Resource ID" value={open.subjectId} />
              <Fact label="Entry ID" value={open.id} />
            </dl>
            <section>
              <h3 className="text-h3 text-ink">Recorded detail</h3>
              {open.detail && Object.keys(open.detail).length ? (
                <dl className="mt-3 divide-y divide-line rounded-control border border-line">
                  {Object.entries(open.detail).map(([key, value]) => (
                    <Fact key={key} label={FIELD_LABEL[key] || key} value={typeof value === "object" && value !== null ? JSON.stringify(value) : String(value)} />
                  ))}
                </dl>
              ) : (
                <p className="mt-2 text-small text-ink-muted">No further detail was recorded.</p>
              )}
            </section>
          </div>
        </Drawer>
      )}
    </div>
  );
}

function change(detail) {
  if (!detail) return null;
  const from = detail.fromStatus ?? detail.from;
  const to = detail.toStatus ?? detail.to ?? detail.decision ?? detail.resolution;
  if (from && to) return `${from} to ${to}`;
  return to || null;
}

function Fact({ label, value }) {
  return (
    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-4 py-2.5">
      <dt className="text-small text-ink-muted">{label}</dt>
      <dd className="min-w-0 break-words text-right text-small text-ink">{value || <span className="text-ink-muted">Not recorded</span>}</dd>
    </div>
  );
}
