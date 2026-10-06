import { useCallback, useState } from "react";
import { CreditCard, Send, RefreshCw } from "lucide-react";
import { Panel, PageHeader, Table, StatusPill, Button, Dialog, Skeleton, ErrorState, EmptyState, useToast, formatDateTime } from "@addiscard/ui";
import { ApiError } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";
import { bitnobAdmin, ISSUANCE_LABEL, ISSUANCE_BLOCKER_LABEL } from "../../data/bitnobAdmin.js";

/**
 * Card issuance (admin-initiated).
 *
 * Customers appear here automatically once the backend finds them verified
 * by staff, with complete card-provider details and consent, and a verified
 * payment — there is no customer request step. An administrator reviews and
 * confirms "Issue card"; the backend re-checks everything and calls the card
 * provider once. Nothing on this page decides eligibility, a balance or a
 * card state.
 */
const SECTIONS = [
  { key: "ready", title: "Ready for card issuance", states: ["ready_for_issuance"], empty: "Customers appear here once they are verified and their payment is verified." },
  { key: "provisioning", title: "Provisioning", states: ["provisioning"], empty: "No cards are being created." },
  { key: "active", title: "Active cards", states: ["active"], empty: "No active cards yet." },
  { key: "attention", title: "Needs attention", states: ["blocked", "failed", "unknown"], empty: "Nothing needs attention." },
  { key: "waiting", title: "Not ready yet", states: ["awaiting_payment", "not_eligible"], empty: "No customers are waiting." },
];

export default function CardIssuancePage() {
  const load = useCallback(() => bitnobAdmin.issuance(), []);
  const { data, error, loading, reload } = useAsync(load, []);
  const [confirm, setConfirm] = useState(null);
  const rows = data?.rows || [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Card issuance"
        description={`Card provider: Bitnob · ${data?.environment === "sandbox" ? "SANDBOX (test cards, no real money)" : data?.environment || ""}`}
        actions={
          <Button variant="secondary" icon={RefreshCw} loading={loading && Boolean(data)} onClick={reload}>
            Refresh
          </Button>
        }
      />
      {loading && !data && <Skeleton className="h-64 w-full rounded-panel" />}
      {error && !data && <ErrorState title="We couldn't load card issuance" error={error} onRetry={reload} />}
      {data &&
        SECTIONS.map((section) => {
          const list = rows.filter((r) => section.states.includes(r.state));
          return (
            <Panel key={section.key} title={`${section.title} (${list.length})`} padded={list.length === 0}>
              {list.length === 0 ? (
                <EmptyState compact icon={CreditCard} title={section.empty} />
              ) : (
                <Table caption={section.title} columns={columns(section.key, setConfirm)} rows={list.map((r) => ({ ...r, id: r.uid }))} />
              )}
            </Panel>
          );
        })}
      {confirm && <IssueDialog row={confirm} settings={data} onClose={() => setConfirm(null)} onDone={reload} />}
    </div>
  );
}

function columns(section, setConfirm) {
  const base = [
    {
      key: "customer",
      header: "Customer",
      render: (r) => (
        <span className="block min-w-0">
          <span className="block truncate">{r.name || "Name not recorded"}</span>
          <span className="block truncate text-caption font-normal text-ink-muted">{r.email || r.uid}</span>
        </span>
      ),
    },
    { key: "state", header: "Status", render: (r) => <StatusPill tone={(ISSUANCE_LABEL[r.state] || [])[0] || "neutral"}>{(ISSUANCE_LABEL[r.state] || [])[1] || r.state}</StatusPill> },
    { key: "payment", header: "Payment", hideBelow: "md", render: (r) => (r.paymentReference ? `Verified · ${r.paymentReference}` : "Not verified") },
    {
      key: "detail",
      header: section === "ready" ? "Eligible since" : "Detail",
      hideBelow: "lg",
      render: (r) =>
        section === "ready"
          ? formatDateTime(r.eligibleAt) || "—"
          : r.state === "failed" && r.providerMessage
            ? `Card provider refused: ${r.providerMessage}`
            : r.blockers?.length
            ? r.blockers.map((b) => ISSUANCE_BLOCKER_LABEL[b] || b).join(" · ")
            : r.lastIssue
              ? `Last issue: ${r.lastIssue.outcome}${r.lastIssue.code ? ` (${ISSUANCE_BLOCKER_LABEL[r.lastIssue.code] || r.lastIssue.code})` : ""}`
              : "—",
    },
  ];
  // A blocked attempt sent nothing; a refused one created nothing. Either can
  // be retried deliberately (for example once test funds arrive); the backend
  // re-checks everything and sends at most one request per retry.
  if (section !== "ready" && section !== "attention") return base;
  return [
    ...base,
    {
      key: "action",
      header: "",
      align: "right",
      render: (r) =>
        r.state === "ready_for_issuance" || r.state === "blocked" || (r.state === "failed" && r.retryable) ? (
          <Button size="sm" icon={Send} variant={r.state === "ready_for_issuance" ? undefined : "secondary"} onClick={(event) => { event.stopPropagation(); setConfirm(r); }}>
            {r.state === "ready_for_issuance" ? "Issue card" : "Retry issue"}
          </Button>
        ) : null,
    },
  ];
}

/** Explicit confirmation; the backend re-checks eligibility and funding before calling the provider. */
function IssueDialog({ row, settings, onClose, onDone }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const issue = async () => {
    setBusy(true);
    try {
      const r = await bitnobAdmin.issue(row.uid);
      setResult(r);
      if (r.cardCreated) toast.success("The card is being created. It becomes active once the provider confirms it.", "Issuance sent");
      onDone();
    } catch (problem) {
      setResult({ error: problem instanceof ApiError ? problem.message : "That didn't go through." , problems: problem?.problems || [] });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title="Issue virtual card"
      description="Check the details, then confirm. The backend checks eligibility and test funding again before anything is sent."
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            {result ? "Close" : "Cancel"}
          </Button>
          {!result && (
            <Button loading={busy} onClick={issue}>
              Confirm {settings?.environment === "sandbox" ? "Sandbox " : ""}Card Issuance
            </Button>
          )}
        </div>
      }
    >
      <dl className="divide-y divide-line rounded-control border border-line">
        <Row label="Customer" value={`${row.name || "Name not recorded"} · ${row.email || row.uid}`} />
        <Row label="Payment" value={row.paymentReference ? `Verified · ${row.paymentReference}` : "Not verified"} />
        <Row label="Provider" value="Bitnob" />
        <Row label="Environment" value={String(settings?.environment || "").toUpperCase()} />
        <Row label="Card type" value={settings?.cardType || "Standard virtual card"} />
        <Row label="Initial amount" value={`${settings?.initialAmountUsd ?? "?"} USD (test funds)`} />
        <Row label="Current status" value={(ISSUANCE_LABEL[row.state] || [])[1] || row.state} />
      </dl>
      {result && (
        <div role="status" className="mt-4 text-small">
          {result.error ? (
            <>
              <p className="text-danger">{result.error}</p>
              {result.problems?.map((p) => (
                <p key={p.code} className="mt-1 text-ink-soft">{p.message || ISSUANCE_BLOCKER_LABEL[p.code] || p.code}</p>
              ))}
            </>
          ) : result.cardCreated ? (
            <p className="text-ink">Sent. Status: {(ISSUANCE_LABEL[result.state] || [])[1] || result.state}. The card becomes active only when the provider confirms it.</p>
          ) : result.state === "failed" ? (
            <p className="text-ink">
              The card provider refused the card{result.providerMessage ? `: ${result.providerMessage}` : ` (${result.code || "no reason given"})`}. Nothing was created; the customer can be issued again later.
            </p>
          ) : result.state === "unknown" ? (
            <p className="text-ink">The card provider's answer did not arrive. Check the provider dashboard before trying again; nothing is retried automatically.</p>
          ) : (
            <p className="text-ink">
              Card issuance blocked: {ISSUANCE_BLOCKER_LABEL[result.code] || result.blocked || result.code || result.state}. Nothing was created.
            </p>
          )}
        </div>
      )}
    </Dialog>
  );
}

function Row({ label, value }) {
  return (
    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-4 px-4 py-2.5">
      <dt className="text-small text-ink-muted">{label}</dt>
      <dd className="min-w-0 break-words text-right text-small text-ink">{value}</dd>
    </div>
  );
}
