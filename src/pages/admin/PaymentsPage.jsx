import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Banknote, RefreshCw, TriangleAlert, CircleCheck, CircleX, CircleDashed, Info } from "lucide-react";
import {
  Panel,
  PageHeader,
  Table,
  StatusPill,
  Button,
  Drawer,
  SelectInput,
  TextArea,
  TextInput,
  ErrorState,
  EmptyState,
  Skeleton,
  useToast,
  formatMoney,
  formatDateTime,
} from "@addiscard/ui";
import { adminService, PAYMENT_STATUS_LABEL, PAYMENT_STATUS_TONE, ApiError } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";
import { usePage } from "../../hooks/usePage.js";
import { adminLists } from "../../data/adminLists.js";
import { PageNav } from "../../components/admin/PageNav.jsx";

/**
 * Payments, for staff.
 *
 * The queue, and for each claim a comparison of three sources: what the
 * payment expected, what the customer claimed, and what the provider's
 * receipt says. Mismatches are highlighted; a reviewer who verifies does
 * so after reconciling against the receiving account, with a reason, and
 * the server allocates through the same path as automatic verification —
 * so this screen cannot credit a transaction twice. There is no "set
 * verified" control: only the protected decision endpoint.
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
  { value: "VERIFY", label: "Verify (reconciled against the receiving account)" },
  { value: "REJECT", label: "Reject the evidence" },
  { value: "REQUEST_CLARIFICATION", label: "Ask the customer for more information" },
];

const RESULT = {
  match: { label: "Match", icon: CircleCheck, row: "", text: "text-success" },
  mismatch: { label: "Mismatch", icon: CircleX, row: "bg-danger-tint", text: "font-semibold text-danger" },
  unknown: { label: "Unknown", icon: CircleDashed, row: "bg-warning-tint", text: "text-warning" },
  info: { label: "For information", icon: Info, row: "", text: "text-ink-muted" },
};

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
/** Dates shown in the viewer's time; everything else as the server sent it. */
function display(value) {
  if (value === null || value === undefined || value === "") return "Not recorded";
  const text = String(value);
  if (text.includes(" – ")) return text.split(" – ").map(display).join(" to ");
  return ISO.test(text) ? formatDateTime(text) : text;
}
const etb = (minor, currency = "ETB") => (minor != null ? formatMoney(minor, currency) : "Not recorded");
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
  const [page, setPage] = usePage(status);
  const load = useCallback(() => adminLists.paymentClaims({ status, page }), [status, page]);
  const { data, error, loading, reload } = useAsync(load, [status, page]);
  const claims = data?.claims || [];

  const columns = [
    {
      key: "intent",
      header: "Payment",
      render: (row) => (
        <span className="block min-w-0">
          <span className="block truncate">{row.intent?.reference || "No order reference"}</span>
          <span className="block truncate text-caption font-normal text-ink-muted">
            {row.method}, receipt {row.tokenHint || "not read"}
            {row.attempt > 1 ? `, attempt ${row.attempt}` : ""}
          </span>
        </span>
      ),
    },
    { key: "expected", header: "Expected", align: "right", render: (row) => (row.intent ? etb(row.intent.amountMinor, row.intent.currency) : "Not recorded") },
    { key: "claimed", header: "Claimed", align: "right", hideBelow: "lg", render: (row) => etb(row.claimedAmountMinor) },
    {
      key: "provider",
      header: "On the receipt",
      align: "right",
      render: (row) => {
        const differs = row.providerAmountMinor != null && row.intent && row.providerAmountMinor !== row.intent.amountMinor;
        return differs ? (
          <span className="inline-flex items-center gap-1 font-semibold text-danger">
            <CircleX size={14} aria-hidden />
            {etb(row.providerAmountMinor)}
            <span className="sr-only"> (differs from expected)</span>
          </span>
        ) : (
          etb(row.providerAmountMinor)
        );
      },
    },
    {
      key: "status",
      header: "Result",
      render: (row) => (
        <span className="block">
          <StatusPill tone={PAYMENT_STATUS_TONE[row.status] || "neutral"}>{PAYMENT_STATUS_LABEL[row.status] || row.status}</StatusPill>
          {row.reasonCode && <span className="mt-1 block text-caption text-ink-muted">{row.reasonCode}</span>}
        </span>
      ),
    },
    { key: "submittedAt", header: "Submitted", hideBelow: "md", render: (row) => (row.submittedAt ? formatDateTime(row.submittedAt) : "Not recorded") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Payments" description="Receipts customers have submitted, compared with what we expected and what the provider says. Open one to review it." />

      <div role="group" aria-label="Status" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            aria-pressed={status === filter.value}
            onClick={() => setStatus(filter.value)}
            className={`min-h-11 shrink-0 rounded-full border px-4 text-small font-medium ${
              status === filter.value ? "border-accent bg-accent-soft text-accent-ink" : "border-line-strong bg-surface-1 text-ink-soft hover:bg-surface-2"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <Panel padded={false}>
        {loading && (
          <div aria-busy="true" className="flex flex-col gap-2 p-4 sm:p-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}
        {!loading && error && (
          <div className="p-4 sm:p-6">
            <ErrorState title="We couldn't load payment claims" error={error} onRetry={reload} />
          </div>
        )}
        {!loading && !error && claims.length === 0 && (
          <EmptyState headingLevel={2} icon={Banknote} title="No claims to show" description="Receipts customers submit appear here, whatever the outcome." />
        )}
        {!loading && !error && claims.length > 0 && <Table caption="Payment claims" columns={columns} rows={claims} onRowClick={(row) => setOpenId(row.id)} />}
        {!error && <PageNav pagination={data?.pagination} onPage={setPage} loading={loading} />}
      </Panel>

      <ClaimReview claimId={openId} onClose={() => setOpenId(null)} onChanged={reload} />
    </div>
  );
}

/** One claim, laid out for a decision. */
function ClaimReview({ claimId, onClose, onChanged }) {
  const toast = useToast();
  const [claim, setClaim] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ action: "", reason: "", customerMessage: "", canonicalTransactionId: "" });

  useEffect(() => {
    if (!claimId) return;
    let cancelled = false;
    setClaim(null);
    setLoadError(null);
    setForm({ action: "", reason: "", customerMessage: "", canonicalTransactionId: "" });
    adminService
      .paymentClaim(claimId)
      .then((body) => !cancelled && setClaim(body.claim))
      .catch((problem) => !cancelled && setLoadError(problem));
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
      toast.success(`Now: ${PAYMENT_STATUS_LABEL[body.claim.status] || body.claim.status}.`, "Receipt re-checked");
      onChanged();
    } catch (problem) {
      toast.error(errorText(problem, "We couldn't re-check that receipt. Try again."));
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
      toast.success(`Now: ${PAYMENT_STATUS_LABEL[body.claim.status] || body.claim.status}.`, "Decision recorded");
      onChanged();
    } catch (problem) {
      toast.error(errorText(problem, "We couldn't record that decision. Try again."));
    } finally {
      setBusy(false);
    }
  }

  const needsId = form.action === "VERIFY" && claim?.needsTransactionId;
  const blocked =
    (!form.action && "Choose an action.") ||
    (form.reason.trim().length < 10 && "Give an internal reason of at least 10 characters.") ||
    (form.action === "REQUEST_CLARIFICATION" && form.customerMessage.trim().length < 10 && "Write a message to the customer of at least 10 characters.") ||
    (needsId && form.canonicalTransactionId.trim().length < 4 && "Enter the transaction ID you reconciled against.") ||
    null;

  if (!claimId) return null;

  return (
    <Drawer open onClose={onClose} title={claim?.expected?.reference ? `Payment ${claim.expected.reference}` : "Payment claim"} description={claim ? `${claim.method}, receipt ${claim.tokenHint || "not read"}` : undefined} width="max-w-5xl">
      {loadError ? <ErrorState title="We couldn't load this claim" error={loadError} /> : null}
      {!claim && !loadError ? <Skeleton className="h-[320px] w-full rounded-panel" /> : null}

      {claim ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2" aria-live="polite">
            <StatusPill tone={PAYMENT_STATUS_TONE[claim.status] || "neutral"}>{PAYMENT_STATUS_LABEL[claim.status] || claim.status}</StatusPill>
            {claim.reasonCode ? <span className="text-caption text-ink-muted">{claim.reasonCode}</span> : null}
            <span className="text-small text-ink-soft">
              Customer: <span className="break-all">{claim.owner?.email || claim.owner?.uid}</span>
            </span>
            <span className="text-small text-ink-soft">Submitted {display(claim.submittedAt)}</span>
            {claim.attempt > 1 && <span className="text-small text-ink-soft">Attempt {claim.attempt}</span>}
          </div>

          {claim.reasonCodes?.length > 1 ? <p className="text-small text-ink-soft">Every check that failed: {claim.reasonCodes.join(", ")}</p> : null}

          {claim.allocation && !claim.allocation.sameIntent ? (
            <p className="flex items-start gap-2 rounded-control bg-danger-tint px-4 py-3 text-small text-ink">
              <TriangleAlert size={16} className="mt-0.5 shrink-0 text-danger" aria-hidden />
              This provider transaction is already allocated to another payment ({claim.allocation.intentId}). It can't be credited again.
            </p>
          ) : null}

          {/* The three sources, aligned row by row. */}
          <section aria-labelledby="comparison-title">
            <h3 id="comparison-title" className="text-h3 text-ink">
              Checks
            </h3>
            <div className="mt-3 overflow-x-auto rounded-control border border-line">
              <table className="w-full min-w-[680px] border-collapse text-left text-small">
                <caption className="sr-only">Expected, customer claim and provider receipt, field by field</caption>
                <thead>
                  <tr className="border-b border-line bg-surface-2">
                    <th scope="col" className="px-3 py-2.5 text-caption font-medium text-ink-muted">Check</th>
                    <th scope="col" className="px-3 py-2.5 text-caption font-medium text-ink-muted">Expected</th>
                    <th scope="col" className="px-3 py-2.5 text-caption font-medium text-ink-muted">Customer claim</th>
                    <th scope="col" className="px-3 py-2.5 text-caption font-medium text-ink-muted">Provider receipt</th>
                    <th scope="col" className="px-3 py-2.5 text-caption font-medium text-ink-muted">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {(claim.comparison || []).map((row) => {
                    const style = RESULT[row.result] || RESULT.info;
                    const Icon = style.icon;
                    return (
                      <tr key={row.key} className={style.row}>
                        <th scope="row" className="px-3 py-2.5 font-medium text-ink">{row.label}</th>
                        <td className="px-3 py-2.5 tabular-nums text-ink-soft">{display(row.expected)}</td>
                        <td className="px-3 py-2.5 tabular-nums text-ink-soft">{display(row.claimed)}</td>
                        <td className="px-3 py-2.5 tabular-nums text-ink-soft">{display(row.provider)}</td>
                        <td className={`px-3 py-2.5 ${style.text}`}>
                          <span className="inline-flex items-center gap-1.5">
                            <Icon size={14} aria-hidden />
                            {style.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {(claim.comparison || []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-3 text-ink-muted">
                        No receipt was read for this claim, so there's nothing to compare yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-3">
            <Source title="Expected">
              <Item label="Order">{claim.expected?.reference}</Item>
              <Item label="Amount">{claim.expected ? etb(claim.expected.amountMinor, claim.expected.currency) : null}</Item>
              <Item label="Receiver">{claim.expected?.receiverName}</Item>
              <Item label="Account">{claim.expected?.receiverAccount}</Item>
              <Item label="Window">{claim.expected ? `${display(claim.expected.createdAt)} to ${display(claim.expected.expiresAt)}` : null}</Item>
            </Source>
            <Source title="Customer claim">
              <Item label="Payer">{claim.claimed?.payerName}</Item>
              <Item label="Account">{claim.claimed?.payerAccount}</Item>
              <Item label="Phone">{claim.claimed?.payerPhone}</Item>
              <Item label="Amount">{claim.claimed?.claimedAmountMinor != null ? etb(claim.claimed.claimedAmountMinor) : null}</Item>
              <Item label="Paid at">{claim.claimed?.claimedPaidAt ? display(claim.claimed.claimedPaidAt) : null}</Item>
              <Item label="Receipt">{claim.claimed?.tokenHint}</Item>
            </Source>
            <Source title="Provider receipt">
              <Item label="Status">{claim.provider?.paymentStatus}</Item>
              <Item label="Amount">{claim.provider?.amountMinor != null ? etb(claim.provider.amountMinor, claim.provider.currency || "ETB") : null}</Item>
              <Item label="Currency">{claim.provider?.currency}</Item>
              <Item label="Receiver">{claim.provider?.receiverName}</Item>
              <Item label="Payer">{claim.provider?.payerName}</Item>
              <Item label="Transaction ID">{claim.provider?.canonicalTransactionId}</Item>
              <Item label="Time">{claim.provider?.transactionTime ? display(claim.provider.transactionTime) : null}</Item>
              <Item label="Reason field">{claim.provider?.narrative}</Item>
              <Item label="Parser">{claim.provider ? `${claim.provider.parserVersion} (${claim.provider.rawSourceType})` : null}</Item>
            </Source>
          </div>

          {claim.claimed?.message ? (
            <Source title="Customer's pasted confirmation" asList={false}>
              <p className="whitespace-pre-wrap break-words text-small text-ink-soft">{claim.claimed.message}</p>
            </Source>
          ) : null}

          {claim.relatedClaims?.length ? (
            <Source title="Other claims on the same transaction" asList={false}>
              <ul className="flex flex-col gap-1.5 text-small text-ink-soft">
                {claim.relatedClaims.map((other) => (
                  <li key={other.id} className="flex flex-wrap items-center gap-2">
                    <StatusPill tone={PAYMENT_STATUS_TONE[other.status] || "neutral"}>{PAYMENT_STATUS_LABEL[other.status] || other.status}</StatusPill>
                    Payment {other.intentId}, {other.sameCustomer ? "same customer" : "a different customer"}, {display(other.submittedAt)}
                  </li>
                ))}
              </ul>
            </Source>
          ) : null}

          {claim.diagnostic ? (
            <Source title="What the server read" note="Staff only. Use this to correct a parser, then re-check." asList={false}>
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words text-caption leading-relaxed text-ink-soft">{claim.diagnostic}</pre>
            </Source>
          ) : null}

          {claim.decidedBy?.type === "staff" ? (
            <p className="rounded-control bg-surface-2 px-4 py-3 text-small text-ink-soft">
              Decided by {claim.decidedBy.name || claim.decidedBy.uid}, {display(claim.decidedAt)}: {claim.staffReason}
              {claim.customerMessage ? ` Message to the customer: "${claim.customerMessage}"` : ""}
            </p>
          ) : null}

          {claim.actions?.length ? (
            <form onSubmit={decide} className="flex flex-col gap-4 rounded-control border border-line-strong p-4">
              <h3 className="text-h3 text-ink">Decision</h3>
              <SelectInput
                id="decision-action"
                label="Action"
                required
                placeholder="Choose an action"
                value={form.action}
                onChange={set("action")}
                options={ACTIONS.filter((a) => claim.actions.includes(a.value))}
                hint={form.action === "VERIFY" ? "Only after you've seen this payment arrive in the receiving account." : undefined}
              />
              {needsId ? (
                <TextInput
                  id="decision-transaction"
                  label="Provider transaction ID you reconciled against"
                  required
                  value={form.canonicalTransactionId}
                  onChange={set("canonicalTransactionId")}
                  hint="The receipt didn't give one. It's what stops this transaction being credited twice."
                />
              ) : null}
              <TextArea id="decision-reason" label="Reason (internal, audited)" required rows={3} value={form.reason} onChange={set("reason")} hint="At least 10 characters. Recorded in the audit log; never shown to the customer." />
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
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" icon={RefreshCw} loading={busy} onClick={recheck}>
                  Re-check receipt
                </Button>
                <Button type="submit" variant={form.action === "REJECT" ? "destructive" : "primary"} loading={busy} disabled={Boolean(blocked)} disabledReason={blocked}>
                  Record decision
                </Button>
              </div>
            </form>
          ) : null}
        </div>
      ) : null}
    </Drawer>
  );
}

function Source({ title, note, asList = true, children }) {
  return (
    <section className="rounded-control border border-line bg-surface-1 p-4">
      <h3 className="text-small font-semibold text-ink">{title}</h3>
      {note && <p className="mt-0.5 text-caption text-ink-muted">{note}</p>}
      {asList ? <dl className="mt-2 flex flex-col gap-1.5">{children}</dl> : <div className="mt-2">{children}</div>}
    </section>
  );
}

function Item({ label, children }) {
  return (
    <div className="flex justify-between gap-3 text-small">
      <dt className="shrink-0 text-ink-muted">{label}</dt>
      <dd className="min-w-0 break-all text-right text-ink">{children || <span className="text-ink-muted">Not recorded</span>}</dd>
    </div>
  );
}
