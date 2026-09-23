import { useCallback, useState } from "react";
import { ScrollText } from "lucide-react";
import { Panel, Table, Badge, ErrorState, EmptyState, Skeleton } from "@addiscard/ui";
import { adminService } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";

/**
 * The audit trail.
 *
 * Read-only, and there is no route that could make it otherwise: nothing
 * writes, edits or deletes an entry, because a trail that can be
 * rewritten is not a trail.
 *
 * It records *that* something happened and who did it — never the
 * contents of a document, a receipt token or a customer's details. A log
 * that carried those would itself be worth stealing.
 */

const FILTERS = [
  { value: "all", label: "All" },
  { value: "kyc.decision", label: "KYC decisions" },
  { value: "staff.owner.granted", label: "Ownership" },
];

const TONE = {
  "kyc.decision": "brand",
  "staff.owner.granted": "danger",
};

export default function AuditLogPage() {
  const [action, setAction] = useState("all");
  const load = useCallback(() => adminService.auditLog({ action }), [action]);
  const { data, error, loading, reload } = useAsync(load, [action]);

  const entries = data?.entries || [];

  const columns = [
    {
      key: "action",
      header: "Action",
      render: (row) => <Badge tone={TONE[row.action] || "neutral"}>{row.action}</Badge>,
    },
    {
      key: "actor",
      header: "Who",
      render: (row) => (
        <span className="font-mono text-[12px]">{row.actorName || row.actorUid || "—"}</span>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      render: (row) => (
        <span className="font-mono text-[12px]">
          {row.subjectType ? `${row.subjectType}/` : ""}
          {row.subjectId || "—"}
        </span>
      ),
    },
    {
      key: "detail",
      header: "Detail",
      render: (row) =>
        row.detail ? (
          <span className="text-[12px] text-ink-muted dark:text-ink-muted-dark">
            {Object.entries(row.detail)
              .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
              .join(" · ")}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "createdAt",
      header: "When",
      render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"),
    },
  ];

  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">Audit logs</h1>
      <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
        Who did what, and when. Append-only — nothing here can be edited or removed.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setAction(filter.value)}
            className={`rounded-full border px-3 py-1.5 text-[12.5px] ${
              action === filter.value
                ? "border-brand bg-brand/10 text-brand"
                : "border-line dark:border-line-dark text-ink-muted dark:text-ink-muted-dark"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <Panel padded={false}>
          {loading && (
            <div className="p-5">
              <Skeleton className="h-[160px] w-full" />
            </div>
          )}
          {!loading && error && (
            <div className="p-5">
              <ErrorState title="Could not load the audit log" message={error.message} onRetry={reload} />
            </div>
          )}
          {!loading && !error && entries.length === 0 && (
            <EmptyState
              icon={ScrollText}
              title="Nothing recorded yet"
              description="Decisions, ownership changes and other sensitive actions appear here as they happen."
            />
          )}
          {!loading && !error && entries.length > 0 && <Table columns={columns} rows={entries} />}
        </Panel>
      </div>
    </>
  );
}
