import { useCallback, useState } from "react";
import { Workflow, Webhook, RefreshCw } from "lucide-react";
import {
  Panel,
  PageHeader,
  Table,
  StatusPill,
  Button,
  Drawer,
  Timeline,
  Skeleton,
  ErrorState,
  EmptyState,
  SelectInput,
  TextArea,
  TextInput,
  useToast,
  formatDateTime,
} from "@addiscard/ui";
import { ApiError } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";
import { usePage, pageRows } from "../../hooks/usePage.js";
import { adminLists } from "../../data/adminLists.js";
import { PageNav } from "../../components/admin/PageNav.jsx";
import { providerOps, OPERATION_LABEL, OPERATION_TONE, EVENT_LABEL, EVENT_TONE } from "../../data/providerOps.js";
import { bitnobAdmin, ATTENTION_LABEL } from "../../data/bitnobAdmin.js";

/**
 * Card operations: what Arifcard asked the card issuer to do, and what
 * the issuer told us back.
 *
 * - Operations are our requests (issue a card, fund, …) with their state
 *   machine and history. An operation whose outcome is unknown can be
 *   re-asked; one nothing else could settle can be resolved by an
 *   administrator, with a reason, through the existing protected endpoint.
 * - Events are what the issuer sent us: type, status and the *names* of
 *   the data fields — never the data.
 *
 * Card orders are kept per customer (no global list exists), so they are
 * reached from the customer's record. Balances, card lists and card
 * transactions are not in the backend and are not shown.
 */

const OPERATION_FILTERS = ["all", "NEEDS_REVIEW", "UNKNOWN", "RECONCILING", "QUEUED", "SUBMITTING", "FAILED", "SUCCEEDED"];
const EVENT_FILTERS = ["all", "NEEDS_REVIEW", "UNMATCHED", "UNHANDLED", "RECEIVED", "PROCESSING", "APPLIED", "IGNORED_STALE", "IGNORED_DUPLICATE"];
const UNSETTLED = ["UNKNOWN", "NEEDS_REVIEW", "RECONCILING"];
const errorText = (problem, fallback) => (problem instanceof ApiError ? problem.message : fallback);

export default function CardOperationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Card operations"
        description="Requests we sent to the card issuer, and the events it sent back. The issuer and environment are shown in the header."
        // CODEGO DISABLED (owner decision, 2026-10-02): card issuing moves to Bitnob. The 'Card orders by customer' link pointed at the Codego tabs.
      />
      <p className="max-w-[80ch] rounded-control bg-surface-2 px-4 py-3 text-small text-ink-soft">
        {/* CODEGO DISABLED (owner decision, 2026-10-02): Codego card orders and funding are switched off. */}
        Card issuing is moving to a new card provider (Bitnob). Codego card orders and funding are switched off; requests to the card
        provider and the events it sends back still appear below.
      </p>
      <BitnobAttention />
      <Operations />
      <Events />
    </div>
  );
}

function FilterChips({ label, values, value, onChange, labels }) {
  return (
    <div role="group" aria-label={label} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {values.map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={`min-h-11 shrink-0 rounded-full border px-4 text-small font-medium ${
            value === v ? "border-accent bg-accent-soft text-accent-ink" : "border-line-strong bg-surface-1 text-ink-soft hover:bg-surface-2"
          }`}
        >
          {v === "all" ? "All" : labels[v] || v}
        </button>
      ))}
    </div>
  );
}

/**
 * Card provider (Bitnob, sandbox): what needs a person or a reconciliation.
 * Read-only — reconciliation is done from the operator's allowlisted
 * machine (npm run bitnob:card -- --reconcile), and nothing here sets a
 * Bitnob outcome, a balance or a card state.
 */
function BitnobAttention() {
  const load = useCallback(() => bitnobAdmin.attention(), []);
  const { data, error, loading, reload } = useAsync(load, []);
  const all = (data?.items || []).map((item, i) => ({ ...item, id: `${item.kind}-${item.uid || "?"}-${i}` }));
  const [page, setPage] = usePage(String(all.length));
  const { items: rows, pagination } = pageRows(all, page);
  const columns = [
    { key: "kind", header: "Needs", render: (r) => ATTENTION_LABEL[r.kind] || r.kind },
    { key: "status", header: "Status", render: (r) => <StatusPill tone={r.kind === "top_up_requested" ? "info" : "warning"}>{r.status}</StatusPill> },
    { key: "uid", header: "Customer", hideBelow: "md", render: (r) => <span className="break-all text-caption">{r.uid || "Not recorded"}</span> },
    {
      key: "detail",
      header: "Detail",
      hideBelow: "lg",
      render: (r) =>
        r.lastError ? `${r.lastError.code || ""} ${r.lastError.status ?? ""}`.trim() : r.amountCents != null ? `${(r.amountCents / 100).toFixed(2)} ${r.currency}` : r.action || "—",
    },
    { key: "updatedAt", header: "Last change", hideBelow: "md", render: (r) => formatDateTime(r.updatedAt) || "Not recorded" },
  ];
  return (
    <Panel title="Card provider: needs attention" description={`Bitnob ${data?.environment || "sandbox"}. Unknown outcomes are settled by reading Bitnob, never by sending again.`} padded={false}>
      {loading && (
        <div aria-busy="true" className="px-4 pb-4 sm:px-6">
          <Skeleton className="h-12 w-full" />
        </div>
      )}
      {!loading && error && (
        <div className="px-4 pb-4 sm:px-6">
          <ErrorState title="We couldn't load card provider items" error={error} onRetry={reload} headingLevel={3} />
        </div>
      )}
      {!loading && !error && rows.length === 0 && <EmptyState compact icon={Workflow} title="Nothing needs attention" description="Unresolved submissions, card changes and top-up requests appear here." />}
      {!loading && !error && rows.length > 0 && <Table caption="Card provider items needing attention" columns={columns} rows={rows} />}
      {!error && <PageNav pagination={pagination} onPage={setPage} />}
    </Panel>
  );
}

function Operations() {
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(null);
  const [page, setPage] = usePage(status);
  const load = useCallback(() => adminLists.operations({ status, page }), [status, page]);
  const { data, error, loading, reload } = useAsync(load, [status, page]);
  const rows = data?.operations || [];

  const columns = [
    {
      key: "action",
      header: "Operation",
      render: (op) => (
        <span className="block min-w-0">
          <span className="block truncate">{op.action}</span>
          <span className="block truncate text-caption font-normal text-ink-muted">{op.id}</span>
        </span>
      ),
    },
    { key: "status", header: "Status", render: (op) => <StatusPill tone={OPERATION_TONE[op.status] || "neutral"}>{OPERATION_LABEL[op.status] || op.status}</StatusPill> },
    { key: "environment", header: "Environment", hideBelow: "lg", render: (op) => op.environment || "Not recorded" },
    { key: "attempts", header: "Attempts", align: "right", hideBelow: "lg", render: (op) => `${op.attempts}${op.reconcileAttempts ? ` + ${op.reconcileAttempts} checks` : ""}` },
    { key: "updatedAt", header: "Last change", hideBelow: "md", render: (op) => formatDateTime(op.updatedAt || op.createdAt) || "Not recorded" },
  ];

  return (
    <Panel title="Issuer operations" description="Newest first." padded={false}>
      <div className="px-4 pb-3 sm:px-6">
        <FilterChips label="Operation status" values={OPERATION_FILTERS} value={status} onChange={setStatus} labels={OPERATION_LABEL} />
      </div>
      {loading && (
        <div aria-busy="true" className="flex flex-col gap-2 px-4 pb-4 sm:px-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}
      {!loading && error && (
        <div className="px-4 pb-4 sm:px-6">
          <ErrorState title="We couldn't load issuer operations" error={error} onRetry={reload} headingLevel={3} />
        </div>
      )}
      {!loading && !error && rows.length === 0 && (
        <EmptyState compact icon={Workflow} title="No operations" description={status === "all" ? "Requests to the card issuer appear here once customers order cards." : "None with this status."} />
      )}
      {!loading && !error && rows.length > 0 && <Table caption="Issuer operations" columns={columns} rows={rows} onRowClick={setOpen} />}
      {!error && <PageNav pagination={data?.pagination} onPage={setPage} loading={loading} />}
      {open && (
        <OperationDrawer
          op={open}
          onClose={() => setOpen(null)}
          onChanged={(updated) => {
            if (updated) setOpen(updated);
            reload();
          }}
        />
      )}
    </Panel>
  );
}

function OperationDrawer({ op, onClose, onChanged }) {
  const toast = useToast();
  const [busy, setBusy] = useState(null);
  const [form, setForm] = useState({ resolution: "", reason: "", providerRef: "" });
  const unsettled = UNSETTLED.includes(op.status);

  const run = async (key, fn, success) => {
    setBusy(key);
    try {
      const body = await fn();
      toast.success(success);
      onChanged(body?.operation || null);
    } catch (problem) {
      toast.error(errorText(problem, "That didn't go through. Try again."));
    } finally {
      setBusy(null);
    }
  };

  const blocked = (!form.resolution && "Choose the outcome you confirmed.") || (form.reason.trim().length < 10 && "Give a reason of at least 10 characters.") || null;

  const history = (op.history || []).map((h) => ({
    title: `${OPERATION_LABEL[h.to] || h.to}${h.reason ? `: ${h.reason}` : ""}`,
    time: h.at,
    state: h.to === "FAILED" ? "failed" : "done",
  }));

  return (
    <Drawer open onClose={onClose} title={op.action} description={`Operation ${op.id}`} width="max-w-2xl">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2" aria-live="polite">
          <StatusPill tone={OPERATION_TONE[op.status] || "neutral"}>{OPERATION_LABEL[op.status] || op.status}</StatusPill>
          {op.leaseActive && <StatusPill tone="info">A worker is on it now</StatusPill>}
        </div>
        <dl className="divide-y divide-line rounded-control border border-line">
          <Fact label="Customer" value={op.uid} />
          <Fact label="Environment" value={op.environment} />
          <Fact label="Attempts" value={String(op.attempts)} />
          <Fact label="Checks with the issuer" value={String(op.reconcileAttempts)} />
          <Fact label="Issuer reference" value={op.providerRef} />
          <Fact label="Next attempt" value={op.nextAttemptAt ? formatDateTime(op.nextAttemptAt) : null} />
          <Fact label="Last error" value={op.lastError} />
          <Fact label="Created" value={formatDateTime(op.createdAt)} />
          <Fact label="Last change" value={formatDateTime(op.updatedAt)} />
        </dl>

        <section>
          <h3 className="text-h3 text-ink">History</h3>
          {history.length ? <Timeline className="mt-3" items={history} /> : <p className="mt-2 text-small text-ink-muted">No history recorded.</p>}
        </section>

        {unsettled && (
          <section className="flex flex-col gap-4 rounded-control border border-line-strong p-4">
            <h3 className="text-h3 text-ink">Settle this operation</h3>
            <p className="text-small text-ink-soft">
              First ask the issuer whether it happened. Resolve it by hand only when you've confirmed the outcome with the issuer yourself. Both need
              an administrator; the backend refuses otherwise.
            </p>
            {op.status !== "RECONCILING" && (
              <Button variant="secondary" icon={RefreshCw} loading={busy === "reconcile"} className="self-start" onClick={() => run("reconcile", () => providerOps.reconcile(op.id), "We'll ask the issuer now.")}>
                Ask the issuer
              </Button>
            )}
            <form
              className="flex flex-col gap-4 border-t border-line pt-4"
              onSubmit={(event) => {
                event.preventDefault();
                run(
                  "resolve",
                  () => providerOps.resolve(op.id, { resolution: form.resolution, reason: form.reason.trim(), ...(form.providerRef.trim() ? { providerRef: form.providerRef.trim() } : {}) }),
                  "Operation resolved."
                );
              }}
            >
              <SelectInput
                label="Confirmed outcome"
                required
                placeholder="Choose the outcome"
                value={form.resolution}
                onChange={(e) => setForm((f) => ({ ...f, resolution: e.target.value }))}
                options={[
                  { value: "SUCCEEDED", label: "It happened at the issuer" },
                  { value: "FAILED", label: "It did not happen" },
                ]}
              />
              <TextArea label="Reason (audited)" required rows={3} maxLength={1000} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} hint="At least 10 characters. Recorded in the audit log." />
              <TextInput label="Issuer reference (optional)" value={form.providerRef} maxLength={128} onChange={(e) => setForm((f) => ({ ...f, providerRef: e.target.value }))} />
              <Button type="submit" loading={busy === "resolve"} disabled={Boolean(blocked)} disabledReason={blocked} className="self-start">
                Resolve operation
              </Button>
            </form>
          </section>
        )}
      </div>
    </Drawer>
  );
}

function Events() {
  const toast = useToast();
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(false);
  const [page, setPage] = usePage(status);
  const load = useCallback(() => adminLists.events({ status, page }), [status, page]);
  const { data, error, loading, reload } = useAsync(load, [status, page]);
  const rows = data?.events || [];

  const reprocess = async (ev) => {
    setBusy(true);
    try {
      const body = await providerOps.reprocess(ev.id);
      toast.success("Event processed again.");
      setOpen(body?.event || null);
      reload();
    } catch (problem) {
      toast.error(errorText(problem, "We couldn't process the event again. Try again."));
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    {
      key: "type",
      header: "Event",
      render: (ev) => (
        <span className="block min-w-0">
          <span className="block truncate">{ev.type}</span>
          <span className="block truncate text-caption font-normal text-ink-muted">{ev.eventId || ev.id}</span>
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (ev) => (
        <span className="flex flex-wrap gap-1.5">
          <StatusPill tone={EVENT_TONE[ev.status] || "neutral"}>{EVENT_LABEL[ev.status] || ev.status}</StatusPill>
          {ev.conflicting && <StatusPill tone="attention">Conflicting</StatusPill>}
        </span>
      ),
    },
    { key: "environment", header: "Environment", hideBelow: "lg", render: (ev) => ev.environment || "Not recorded" },
    { key: "receivedAt", header: "Received", hideBelow: "md", render: (ev) => formatDateTime(ev.receivedAt) || "Not recorded" },
  ];

  return (
    <Panel title="Issuer events" description="What the issuer sent us. Field names only, never the data. Newest first." padded={false}>
      <div className="px-4 pb-3 sm:px-6">
        <FilterChips label="Event status" values={EVENT_FILTERS} value={status} onChange={setStatus} labels={EVENT_LABEL} />
      </div>
      {loading && (
        <div aria-busy="true" className="flex flex-col gap-2 px-4 pb-4 sm:px-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}
      {!loading && error && (
        <div className="px-4 pb-4 sm:px-6">
          <ErrorState title="We couldn't load issuer events" error={error} onRetry={reload} headingLevel={3} />
        </div>
      )}
      {!loading && !error && rows.length === 0 && (
        <EmptyState compact icon={Webhook} title="No events" description={status === "all" ? "Events from the card issuer appear here as they arrive." : "None with this status."} />
      )}
      {!loading && !error && rows.length > 0 && <Table caption="Issuer events" columns={columns} rows={rows} onRowClick={setOpen} />}
      {!error && <PageNav pagination={data?.pagination} onPage={setPage} loading={loading} />}

      {open && (
        <Drawer
          open
          onClose={() => setOpen(null)}
          title={open.type}
          description={`Event ${open.eventId || open.id}`}
          width="max-w-2xl"
          footer={
            ["NEEDS_REVIEW", "UNMATCHED", "UNHANDLED"].includes(open.status) && !open.conflicting ? (
              <Button icon={RefreshCw} loading={busy} onClick={() => reprocess(open)}>
                Process again
              </Button>
            ) : null
          }
        >
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-2" aria-live="polite">
              <StatusPill tone={EVENT_TONE[open.status] || "neutral"}>{EVENT_LABEL[open.status] || open.status}</StatusPill>
              {open.conflicting && <StatusPill tone="attention">Conflicting</StatusPill>}
            </div>
            <dl className="divide-y divide-line rounded-control border border-line">
              <Fact label="Provider" value={open.provider} />
              <Fact label="Environment" value={open.environment} />
              <Fact label="Detail" value={open.detail} />
              <Fact label="Attempts" value={String(open.attempts)} />
              <Fact label="Occurred" value={open.occurredAt ? formatDateTime(open.occurredAt) : null} />
              <Fact label="Received" value={formatDateTime(open.receivedAt)} />
              <Fact label="Processed" value={formatDateTime(open.processedAt)} />
              <Fact label="Data fields" value={open.dataFields?.length ? open.dataFields.join(", ") : "None"} />
              {open.redactedKeys?.length > 0 && <Fact label="Redacted" value={open.redactedKeys.join(", ")} />}
            </dl>
            {["NEEDS_REVIEW", "UNMATCHED", "UNHANDLED"].includes(open.status) && (
              <p className="text-small text-ink-soft">
                {open.conflicting
                  ? "A conflicting delivery has to be resolved before this event can be processed again."
                  : "Process it again once whatever stopped it has been fixed. An administrator is required."}
              </p>
            )}
          </div>
        </Drawer>
      )}
    </Panel>
  );
}

function Fact({ label, value }) {
  return (
    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-4 py-2.5">
      <dt className="text-small text-ink-muted">{label}</dt>
      <dd className="min-w-0 break-words text-right text-small text-ink">{value || <span className="text-ink-muted">Not recorded</span>}</dd>
    </div>
  );
}
