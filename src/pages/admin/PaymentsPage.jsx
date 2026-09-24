import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Banknote, RefreshCw, AlertTriangle } from "lucide-react";
import {
  Panel,
  Table,
  Badge,
  Button,
  Dialog,
  SelectInput,
  TextArea,
  TextInput,
  ErrorState,
  EmptyState,
  Skeleton,
  useToast,
} from "@addiscard/ui";
import { adminService, PAYMENT_STATUS_LABEL, PAYMENT_STATUS_TONE, birr, ApiError } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";

/**
 * Payments, for staff.
 *
 * The queue, and for each claim a comparison of three sources: what the
 * payment expected, what the customer claimed, and what the provider's
 * receipt says. Mismatches are highlighted; a reviewer who verifies does
 * so after reconciling against the receiving account, with a reason, and
 * the server allocates through the same path as automatic verification —
 * so this screen cannot credit a transaction twice.
 *
 * Staff never see a receipt token or a full account number: masked hints
 * identify them without this page becoming a copy of everyone's receipts.
 */

const FILTERS = [
  { value: "all", label: "All" },
  { value: "REQUIRES_REVIEW", label: "Needs a person" },
  { value: "VERIFYING", label: "Verifying" },
  { value: "REJECTED_EVIDENCE", label: "Rejected" },
  { value: "VERIFIED", label: "Verified" },
];

const ACTIONS = [
  { value: "VERIFY", label: "Verify — reconciled against the receiving account" },
  { value: "REJECT", label: "Reject the evidence" },
  { value: "REQUEST_CLARIFICATION", label: "Ask the customer for more information" },
];

const RESULT_STYLE = {
  match: { label: "Match", row: "", chip: "text-emerald-700 dark:text-emerald-400" },
  mismatch: { label: "Mismatch", row: "bg-red-50 dark:bg-red-950/30", chip: "font-semibold text-red-700 dark:text-red-400" },
  unknown: { label: "Unknown", row: "bg-amber-50/60 dark:bg-amber-950/20", chip: "text-amber-700 dark:text-amber-400" },
  info: { label: "—", row: "", chip: "text-ink-faint" },
};

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
/** Dates shown in the viewer's time; everything else as the server sent it. */
function display(value) {
  if (value === null || value === undefined || value === "") return "—";
  const text = String(value);
  if (text.includes(" – ")) return text.split(" – ").map(display).join(" – ");
  return ISO.test(text) ? new Date(text).toLocaleString() : text;
}

const errorText = (problem, fallback) => (problem instanceof ApiError ? problem.message : fallback);

export default function PaymentsPage() {
  /*
   * The filter lives in the URL, not in component state: the dashboard
   * links here with a status chosen, and a filtered view can be shared or
   * reloaded and still show the same rows.
   */
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") || "all";
  const setStatus = (next) => {
    const params = new URLSearchParams(searchParams);
    if (next === "all") params.delete("status");
    else params.set("status", next);
    setSearchParams(params, { replace: true });
  };

  const [openId, setOpenId] = useState(null);

  const load = useCallback(() => adminService.paymentClaims({ status }), [status]);
  const { data, error, loading, reload } = useAsync(load, [status]);
  const claims = data?.claims || [];

  const columns = [
    {
      key: "intent",
      header: "Payment",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink dark:text-ink-dark">{row.intent?.reference || "—"}</p>
          <p className="truncate text-[12px] text-ink-faint">
            {row.method} · receipt {row.tokenHint || "—"}
            {row.attempt > 1 ? ` · attempt ${row.attempt}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "expected",
      header: "Expected",
      align: "right",
      render: (row) => <span className="font-mono text-[13px]">{row.intent ? birr(row.intent.amountMinor) : "—"}</span>,
    },
    {
      key: "claimed",
      header: "Claimed",
      align: "right",
      render: (row) => <span className="font-mono text-[13px]">{row.claimedAmountMinor != null ? birr(row.claimedAmountMinor) : "—"}</span>,
    },
    {
      key: "provider",
      header: "On the receipt",
      align: "right",
      render: (row) => {
        const differs = row.providerAmountMinor != null && row.intent && row.providerAmountMinor !== row.intent.amountMinor;
        return (
          <span className={`font-mono text-[13px] ${differs ? "font-semibold text-red-700 dark:text-red-400" : ""}`}>
            {row.providerAmountMinor != null ? birr(row.providerAmountMinor) : "—"}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Result",
      render: (row) => (
        <div className="min-w-0">
          <Badge tone={PAYMENT_STATUS_TONE[row.status] || "neutral"}>{PAYMENT_STATUS_LABEL[row.status] || row.status}</Badge>
          {row.reasonCode && <p className="mt-1 text-[11px] text-ink-faint">{row.reasonCode}</p>}
        </div>
      ),
    },
    {
      key: "submittedAt",
      header: "Submitted",
      render: (row) => (row.submittedAt ? new Date(row.submittedAt).toLocaleString() : "—"),
    },
  ];

  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">Payments</h1>
      <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
        Receipts customers have submitted, compared with what we expected and what the provider says. Open one to review it.
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
            <EmptyState icon={Banknote} title="No claims to show" description="Receipts customers submit appear here, whatever the outcome." />
          )}
          {!loading && !error && claims.length > 0 && (
            <Table columns={columns} rows={claims} onRowClick={(row) => setOpenId(row.id)} />
          )}
        </Panel>
      </div>

      <ClaimReview
        claimId={openId}
        onClose={() => setOpenId(null)}
        onChanged={reload}
      />
    </>
  );
}

/** One claim, laid out for a decision. */
function ClaimReview({ claimId, onClose, onChanged }) {
  const toast = useToast();
  const [claim, setClaim] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ action: "", reason: "", customerMessage: "", canonicalTransactionId: "" });

  useEffect(() => {
    if (!claimId) return;
    let cancelled = false;
    setClaim(null);
    setLoadError("");
    setForm({ action: "", reason: "", customerMessage: "", canonicalTransactionId: "" });
    adminService
      .paymentClaim(claimId)
      .then((body) => !cancelled && setClaim(body.claim))
      .catch((problem) => !cancelled && setLoadError(errorText(problem, "Could not load this claim.")));
    return () => {
      cancelled = true;
    };
  }, [claimId]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  async function recheck() {
    setBusy(true);
    try {
      const body = await adminService.recheckClaim(claim.id);
      setClaim(body.claim);
      toast.success(`Re-checked: ${PAYMENT_STATUS_LABEL[body.claim.status] || body.claim.status}.`);
      onChanged();
    } catch (problem) {
      toast.error(errorText(problem, "Could not re-check that receipt."));
    } finally {
      setBusy(false);
    }
  }

  async function decide(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const body = await adminService.decidePaymentClaim(claim.id, form);
      setClaim(body.claim);
      toast.success(`Recorded: ${PAYMENT_STATUS_LABEL[body.claim.status] || body.claim.status}.`);
      onChanged();
    } catch (problem) {
      toast.error(errorText(problem, "Could not record that decision."));
    } finally {
      setBusy(false);
    }
  }

  const needsId = form.action === "VERIFY" && claim?.needsTransactionId;
  const canSubmit =
    form.action &&
    form.reason.trim().length >= 10 &&
    (form.action !== "REQUEST_CLARIFICATION" || form.customerMessage.trim().length >= 10) &&
    (!needsId || form.canonicalTransactionId.trim().length >= 4);

  return (
    <Dialog open={Boolean(claimId)} onClose={onClose} title={claim?.expected?.reference || "Payment claim"} size="lg">
      {loadError ? <ErrorState title="Could not load this claim" message={loadError} /> : null}
      {!claim && !loadError ? <Skeleton className="h-[240px] w-full" /> : null}

      {claim ? (
        <div className="space-y-5 text-[13px]">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={PAYMENT_STATUS_TONE[claim.status] || "neutral"}>{PAYMENT_STATUS_LABEL[claim.status] || claim.status}</Badge>
            {claim.reasonCode ? <span className="font-mono text-[11.5px] text-ink-faint">{claim.reasonCode}</span> : null}
            <span className="text-ink-faint">
              · {claim.method} · receipt {claim.tokenHint || "—"} · {claim.owner?.email || claim.owner?.uid}
            </span>
          </div>

          {claim.reasonCodes?.length > 1 ? (
            <p className="text-ink-muted dark:text-ink-muted-dark">
              Every check that failed: <span className="font-mono text-[11.5px]">{claim.reasonCodes.join(", ")}</span>
            </p>
          ) : null}

          {claim.allocation && !claim.allocation.sameIntent ? (
            <p className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-red-800 dark:bg-red-950/40 dark:text-red-200">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              This provider transaction is already allocated to another payment ({claim.allocation.intentId}). It cannot be
              credited again.
            </p>
          ) : null}

          {/* The three sources, side by side. */}
          <div className="overflow-x-auto rounded-panel border border-line dark:border-line-dark">
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-panel-muted dark:bg-white/[0.03] text-[11.5px] uppercase tracking-wide text-ink-faint">
                <tr>
                  <th className="px-3 py-2 font-medium">Field</th>
                  <th className="px-3 py-2 font-medium">Expected</th>
                  <th className="px-3 py-2 font-medium">Customer claimed</th>
                  <th className="px-3 py-2 font-medium">Provider receipt</th>
                  <th className="px-3 py-2 font-medium">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-line-dark">
                {(claim.comparison || []).map((row) => {
                  const style = RESULT_STYLE[row.result] || RESULT_STYLE.info;
                  return (
                    <tr key={row.key} className={style.row}>
                      <td className="px-3 py-2 font-medium text-ink dark:text-ink-dark">{row.label}</td>
                      <td className="px-3 py-2">{display(row.expected)}</td>
                      <td className="px-3 py-2">{display(row.claimed)}</td>
                      <td className="px-3 py-2">{display(row.provider)}</td>
                      <td className={`px-3 py-2 ${style.chip}`}>{style.label}</td>
                    </tr>
                  );
                })}
                {(claim.comparison || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-3 text-ink-faint">
                      No receipt was read for this claim, so there is nothing to compare yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Panel title="Expected">
              <dl className="space-y-1">
                <Item label="Order">{claim.expected?.reference}</Item>
                <Item label="Amount">{claim.expected ? birr(claim.expected.amountMinor) : null}</Item>
                <Item label="Receiver">{claim.expected?.receiverName}</Item>
                <Item label="Account">{claim.expected?.receiverAccount}</Item>
                <Item label="Window">{claim.expected ? `${display(claim.expected.createdAt)} – ${display(claim.expected.expiresAt)}` : null}</Item>
              </dl>
            </Panel>
            <Panel title="Customer claim">
              <dl className="space-y-1">
                <Item label="Payer">{claim.claimed?.payerName}</Item>
                <Item label="Account">{claim.claimed?.payerAccount}</Item>
                <Item label="Phone">{claim.claimed?.payerPhone}</Item>
                <Item label="Amount">{claim.claimed?.claimedAmountMinor != null ? birr(claim.claimed.claimedAmountMinor) : null}</Item>
                <Item label="Paid at">{display(claim.claimed?.claimedPaidAt)}</Item>
                <Item label="Token">{claim.claimed?.tokenHint}</Item>
              </dl>
            </Panel>
            <Panel title="Provider receipt">
              <dl className="space-y-1">
                <Item label="Status">{claim.provider?.paymentStatus}</Item>
                <Item label="Amount">{claim.provider?.amountMinor != null ? birr(claim.provider.amountMinor) : null}</Item>
                <Item label="Currency">{claim.provider?.currency}</Item>
                <Item label="Receiver">{claim.provider?.receiverName}</Item>
                <Item label="Payer">{claim.provider?.payerName}</Item>
                <Item label="Transaction ID">{claim.provider?.canonicalTransactionId}</Item>
                <Item label="Time">{display(claim.provider?.transactionTime)}</Item>
                <Item label="Reason field">{claim.provider?.narrative}</Item>
                <Item label="Parser">{claim.provider ? `${claim.provider.parserVersion} (${claim.provider.rawSourceType})` : null}</Item>
              </dl>
            </Panel>
          </div>

          {claim.claimed?.message ? (
            <Panel title="Customer's pasted confirmation">
              <p className="whitespace-pre-wrap break-words text-ink-muted dark:text-ink-muted-dark">{claim.claimed.message}</p>
            </Panel>
          ) : null}

          {claim.relatedClaims?.length ? (
            <Panel title="Other claims on the same transaction">
              <ul className="space-y-1">
                {claim.relatedClaims.map((other) => (
                  <li key={other.id} className="text-ink-muted dark:text-ink-muted-dark">
                    {other.intentId} · {PAYMENT_STATUS_LABEL[other.status] || other.status} ·{" "}
                    {other.sameCustomer ? "same customer" : "a different customer"} · {display(other.submittedAt)}
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}

          {claim.diagnostic ? (
            <Panel title="What the server read" description="Staff only. Use this to correct a parser, then re-check.">
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words text-[11.5px] leading-relaxed">{claim.diagnostic}</pre>
            </Panel>
          ) : null}

          {claim.decidedBy?.type === "staff" ? (
            <p className="text-ink-muted dark:text-ink-muted-dark">
              Decided by {claim.decidedBy.name || claim.decidedBy.uid} on {display(claim.decidedAt)}: {claim.staffReason}
              {claim.customerMessage ? ` — message to customer: “${claim.customerMessage}”` : ""}
            </p>
          ) : null}

          {claim.actions?.length ? (
            <form onSubmit={decide} className="space-y-3 rounded-panel border border-line dark:border-line-dark p-4">
              <p className="font-medium text-ink dark:text-ink-dark">Decision</p>
              <SelectInput
                id="decision-action"
                label="Action"
                required
                placeholder="Choose an action"
                value={form.action}
                onChange={set("action")}
                options={ACTIONS.filter((a) => claim.actions.includes(a.value))}
                hint={form.action === "VERIFY" ? "Only after you have seen this payment arrive in the receiving account." : undefined}
              />
              {needsId ? (
                <TextInput
                  id="decision-transaction"
                  label="Provider transaction ID you reconciled against"
                  required
                  value={form.canonicalTransactionId}
                  onChange={set("canonicalTransactionId")}
                  hint="The receipt did not give one. It is what stops this transaction being credited twice."
                />
              ) : null}
              <TextArea
                id="decision-reason"
                label="Reason (internal, audited)"
                required
                rows={3}
                value={form.reason}
                onChange={set("reason")}
                hint="At least 10 characters. Recorded in the audit log; never shown to the customer."
              />
              {form.action === "REQUEST_CLARIFICATION" ? (
                <TextArea
                  id="decision-message"
                  label="Message to the customer"
                  required
                  rows={3}
                  maxLength={500}
                  value={form.customerMessage}
                  onChange={set("customerMessage")}
                  hint="Shown to the customer on their payment. 10 to 500 characters."
                />
              ) : null}
              <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="secondary" icon={RefreshCw} loading={busy} onClick={recheck}>
                  Re-check receipt
                </Button>
                <Button type="submit" disabled={busy || !canSubmit}>
                  Record decision
                </Button>
              </div>
            </form>
          ) : null}
        </div>
      ) : null}
    </Dialog>
  );
}

function Item({ label, children }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-ink-faint">{label}</dt>
      <dd className="text-right break-all text-ink dark:text-ink-dark">{children || "—"}</dd>
    </div>
  );
}
