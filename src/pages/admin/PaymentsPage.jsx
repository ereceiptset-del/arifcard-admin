import { useCallback, useState } from "react";
import { Banknote, RefreshCw } from "lucide-react";
import { Panel, Table, Badge, Button, ErrorState, EmptyState, Skeleton, useToast } from "@addiscard/ui";
import { adminService, CLAIM_STATUS_LABEL, CLAIM_STATUS_TONE, birr, ApiError } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";

/**
 * Payment claims, for staff.
 *
 * This screen exists because of a promise made elsewhere: a customer whose
 * receipt could not be read is told "our team will look at it". Without
 * somewhere for the team to look, that is a promise the system cannot
 * keep.
 *
 * Staff see the diagnostic — what the server actually read — and can
 * re-check a receipt. They never see the receipt token itself; a masked
 * hint identifies which receipt it was without this page becoming a copy
 * of everyone's receipts.
 */

const FILTERS = [
  { value: "all", label: "All" },
  { value: "UNREADABLE", label: "Needs a person" },
  { value: "PROVIDER_ERROR", label: "Provider failed" },
  { value: "MISMATCHED", label: "Did not match" },
  { value: "NOT_FOUND", label: "Not found" },
  { value: "VERIFIED", label: "Matched" },
];

export default function PaymentsPage() {
  const toast = useToast();
  const [status, setStatus] = useState("all");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => adminService.paymentClaims({ status }), [status]);
  const { data, error, loading, reload } = useAsync(load, [status]);

  const claims = data?.claims || [];

  async function recheck(claimId) {
    setBusyId(claimId);
    try {
      const { claim } = await adminService.recheckClaim(claimId);
      toast.success(`Re-checked: ${CLAIM_STATUS_LABEL[claim.status] || claim.status}.`);
      reload();
    } catch (problem) {
      toast.error(problem instanceof ApiError ? problem.message : "Could not re-check that receipt.");
    } finally {
      setBusyId(null);
    }
  }

  const columns = [
    {
      key: "intent",
      header: "Payment",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink dark:text-ink-dark">
            {row.intent?.reference || "—"}
          </p>
          <p className="truncate text-[12px] text-ink-faint">
            {row.method} · receipt {row.tokenHint || "—"}
            {row.attempt > 1 ? ` · attempt ${row.attempt}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Expected",
      align: "right",
      render: (row) => (
        <span className="font-mono text-[13px]">
          {row.intent ? birr(row.intent.amountMinor) : "—"}
        </span>
      ),
    },
    {
      key: "observed",
      header: "On the receipt",
      align: "right",
      render: (row) => (
        <span className="font-mono text-[13px]">
          {row.observed ? `${row.observed.amountBirr} ${row.observed.currency}` : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Result",
      render: (row) => (
        <div className="min-w-0">
          <Badge tone={CLAIM_STATUS_TONE[row.status] || "neutral"}>
            {CLAIM_STATUS_LABEL[row.status] || row.status}
          </Badge>
          {row.reasonCode && <p className="mt-1 text-[11px] text-ink-faint">{row.reasonCode}</p>}
        </div>
      ),
    },
    {
      key: "submittedAt",
      header: "Submitted",
      render: (row) => (row.submittedAt ? new Date(row.submittedAt).toLocaleString() : "—"),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <Button
          variant="secondary"
          icon={RefreshCw}
          loading={busyId === row.id}
          onClick={() => recheck(row.id)}
        >
          Re-check
        </Button>
      ),
    },
  ];

  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">Payments</h1>
      <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
        Receipts customers have submitted, and what the provider said about each one.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setStatus(filter.value)}
            className={`rounded-full border px-3 py-1.5 text-[12.5px] ${
              status === filter.value
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
              <ErrorState title="Could not load payment claims" message={error.message} onRetry={reload} />
            </div>
          )}

          {!loading && !error && claims.length === 0 && (
            <EmptyState
              icon={Banknote}
              title="No claims to show"
              description="Receipts customers submit appear here, whether they matched or not."
            />
          )}

          {!loading && !error && claims.length > 0 && <Table columns={columns} rows={claims} />}
        </Panel>
      </div>

      {/*
        The diagnostic is the point of this screen. "Unreadable" with no
        explanation is a dead end — nobody can tell whether the provider's
        page changed, the field labels are wrong, or something else
        happened. Shown only for claims that need it.
      */}
      {claims.some((claim) => claim.diagnostic) && (
        <div className="mt-5">
          <Panel
            title="What the server read"
            description="Staff only. Use this to correct a parser, then re-check the claim."
          >
            <div className="flex flex-col gap-4">
              {claims
                .filter((claim) => claim.diagnostic)
                .map((claim) => (
                  <div key={claim.id}>
                    <p className="text-[12.5px] font-medium text-ink dark:text-ink-dark">
                      {claim.intent?.reference || claim.id} · {claim.method}
                    </p>
                    <pre className="mt-1 max-h-48 overflow-auto rounded-panel border border-line dark:border-line-dark bg-panel-muted dark:bg-white/[0.03] p-3 text-[11.5px] leading-relaxed whitespace-pre-wrap break-words text-ink dark:text-ink-dark">
                      {claim.diagnostic}
                    </pre>
                  </div>
                ))}
            </div>
          </Panel>
        </div>
      )}
    </>
  );
}
