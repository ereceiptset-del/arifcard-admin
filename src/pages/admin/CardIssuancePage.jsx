import { Fragment, useCallback, useState } from "react";
import { CreditCard, ClipboardCheck, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Panel, PageHeader, Table, StatusPill, Button, Skeleton, ErrorState, EmptyState, formatDateTime, formatMoney } from "@addiscard/ui";
import { ApiError } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";
import { usePage, pageRows } from "../../hooks/usePage.js";
import { PageNav } from "../../components/admin/PageNav.jsx";
import { bitnobAdmin, ISSUANCE_LABEL, ISSUANCE_BLOCKER_LABEL } from "../../data/bitnobAdmin.js";
import CardIssuanceReview from "../../components/admin/CardIssuanceReview.jsx";

/** "someone.example@example.com" → "some••••@example.com" (the row needs to recognise, not to contact). */
const maskEmail = (email) => {
  const [local, domain] = String(email || "").split("@");
  return local && domain ? `${local.slice(0, Math.min(4, Math.max(1, local.length - 2)))}••••@${domain}` : null;
};

/**
 * Card issuance (admin-initiated).
 *
 * Customers appear here automatically once the backend finds them verified
 * by staff, with complete card-provider details and consent, and a verified
 * payment — there is no customer request step. An administrator opens
 * "Review Card Issuance" (the backend's checks, payment, pricing and card
 * preview), confirms explicitly, and the backend re-checks everything and
 * calls the card provider once. Nothing on this page decides eligibility, a
 * balance or a card state.
 */
const SECTIONS = [
  { key: "ready", title: "Ready for card issuance", states: ["ready_for_issuance"], empty: "Customers appear here once they are verified and their payment is verified." },
  { key: "provisioning", title: "Provisioning", states: ["provisioning"], empty: "No cards are being created." },
  { key: "active", title: "Active cards", states: ["active"], empty: "No active cards yet." },
  { key: "attention", title: "Needs attention", states: ["blocked", "failed"], empty: "Nothing needs attention." },
  // The provider's outcome is not known: settled by reading (or the signed event), never by issuing again.
  { key: "reconcile", title: "Reconciliation required", states: ["unknown"], empty: "No unknown outcomes." },
  { key: "waiting", title: "Not ready yet", states: ["awaiting_payment", "not_eligible"], empty: "No customers are waiting." },
];

export default function CardIssuancePage() {
  const load = useCallback(() => bitnobAdmin.issuance(), []);
  const { data, error, loading, reload } = useAsync(load, []);
  const [reviewing, setReviewing] = useState(null);
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
      {data?.provider && !data.provider.available && (
        <p role="status" className="rounded-control border border-line bg-surface-2 px-4 py-3 text-small text-ink">
          Issuing is unavailable from this backend ({data.provider.runtime === "deployed" ? "live" : "local"}): {data.provider.message} Nothing can be sent to the card provider from here; use the allowlisted backend.
        </p>
      )}
      {data &&
        SECTIONS.map((section) => (
          <Fragment key={section.key}>
            <IssuanceSection section={section} rows={rows.filter((r) => section.states.includes(r.state))} setConfirm={setReviewing} />
            {/* Top-ups fund an existing card: their own queue, linked here. */}
            {section.key === "ready" && (
              <p className="-mt-3 text-small text-ink-muted">
                Top-ups for existing cards are a separate queue:{" "}
                <Link to="/top-ups" className="font-medium text-link hover:underline">
                  Top-up requests
                </Link>
                .
              </p>
            )}
          </Fragment>
        ))}
      <ConnectionPanel />
      {reviewing && <CardIssuanceReview uid={reviewing.uid} fallbackName={reviewing.name} onClose={() => setReviewing(null)} onChanged={reload} />}
    </div>
  );
}

/** One queue section, paged on screen (the queue is read whole, newest state first). */
function IssuanceSection({ section, rows, setConfirm }) {
  const [page, setPage] = usePage(String(rows.length));
  const { items, pagination } = pageRows(rows, page);
  return (
    <Panel title={`${section.title} (${rows.length})`} padded={rows.length === 0}>
      {rows.length === 0 ? (
        <EmptyState compact icon={CreditCard} title={section.empty} />
      ) : (
        <>
          <Table caption={section.title} columns={columns(section.key, setConfirm)} rows={items.map((r) => ({ ...r, id: r.uid }))} />
          <PageNav pagination={pagination} onPage={setPage} />
        </>
      )}
    </Panel>
  );
}

/**
 * Administrator: can THIS backend (the one this site talks to — local or
 * deployed) reach the Bitnob API? Read-only: configured, source IP vs the
 * allowlisted one, and a whoami. Run on the live site, it is the evidence
 * for (or against) live Bitnob calls such as card details.
 */
function ConnectionPanel() {
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState(null);
  const [problem, setProblem] = useState(null);
  const run = async () => {
    setBusy(true);
    setProblem(null);
    try {
      setReport(await bitnobAdmin.connectivity());
    } catch (e) {
      setProblem(e instanceof ApiError ? e.message : "The check didn't go through.");
    } finally {
      setBusy(false);
    }
  };
  const w = report?.whoami;
  return (
    <Panel
      title="Bitnob connection"
      description="Read-only check from the backend this site uses: is Bitnob set up there, which public IP it calls from, and does Bitnob accept it."
      action={
        <Button variant="secondary" size="sm" loading={busy} onClick={run}>
          Check connection
        </Button>
      }
    >
      {problem && <p className="text-small text-danger">{problem}</p>}
      {report && (
        <dl className="divide-y divide-line rounded-control border border-line">
          <Row label="Backend" value={report.runtime === "deployed" ? "Live (deployed)" : "Local (this computer)"} />
          <Row label="Bitnob set up here" value={report.configured ? `Yes (${report.environment})` : `No — ${report.reason || "not configured"}`} />
          <Row label="Calls Bitnob from IP" value={report.sourceIp?.currentIp || "Unknown"} />
          <Row label="Allowlisted IP (setting)" value={report.allowlistedIp || "Not set"} />
          <Row label="Matches" value={report.sourceIp?.matchesAllowlist ? "Yes" : "No"} />
          <Row
            label="Bitnob answer (whoami)"
            value={!w ? "Not tried (not set up here)" : w.result === "SUCCESS" ? `Accepted — ${w.environment}` : `Refused — ${w.result}${w.code ? ` / ${w.code}` : ""}${w.status ? ` (HTTP ${w.status})` : ""}`}
          />
          <Row label="Checked" value={formatDateTime(report.checkedAt)} />
        </dl>
      )}
    </Panel>
  );
}

function columns(section, setReview) {
  return [
    {
      key: "customer",
      header: "Customer",
      render: (r) => (
        <span className="block min-w-0">
          <span className="block truncate">{r.name || "Name not recorded"}</span>
          <span className="block truncate text-caption font-normal text-ink-muted">{maskEmail(r.email) || "Email not recorded"}</span>
        </span>
      ),
    },
    { key: "state", header: "Status", render: (r) => <StatusPill tone={(ISSUANCE_LABEL[r.state] || [])[0] || "neutral"}>{(ISSUANCE_LABEL[r.state] || [])[1] || r.state}</StatusPill> },
    {
      key: "payment",
      header: "Payment",
      hideBelow: "md",
      render: (r) =>
        r.paymentReference ? (
          <span className="block min-w-0">
            <span className="block truncate">
              <StatusPill tone="success">Payment verified</StatusPill>
            </span>
            {/* Two short lines, so the column stays narrow enough for tablets. */}
            <span className="mt-1 block text-caption font-normal text-ink-muted">
              {r.paymentAmountMinor != null ? formatMoney(r.paymentAmountMinor, r.paymentCurrency || "ETB") : r.paymentReference}
            </span>
            {r.paymentVerifiedAt && <span className="block text-caption font-normal text-ink-muted">Paid {formatDateTime(r.paymentVerifiedAt)}</span>}
          </span>
        ) : (
          "Not verified"
        ),
    },
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
    {
      key: "action",
      header: "",
      align: "right",
      // Every customer with a verified payment can be reviewed; issuing happens
      // only after the review and an explicit confirmation (the backend decides).
      render: (r) =>
        r.paymentReference || ["ready_for_issuance", "blocked", "failed", "unknown", "active"].includes(r.state) ? (
          <Button
            size="sm"
            icon={ClipboardCheck}
            variant={r.state === "ready_for_issuance" ? undefined : "secondary"}
            onClick={(event) => {
              event.stopPropagation();
              setReview(r);
            }}
          >
            Review Card Issuance
          </Button>
        ) : null,
    },
  ];
}
function Row({ label, value }) {
  return (
    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-4 px-4 py-2.5">
      <dt className="text-small text-ink-muted">{label}</dt>
      <dd className="min-w-0 break-words text-right text-small text-ink">{value}</dd>
    </div>
  );
}
