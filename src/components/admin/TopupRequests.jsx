import { useCallback, useState } from "react";
import { ArrowUpFromLine } from "lucide-react";
import { Panel, StatusPill, Button, Dialog, Skeleton, ErrorState, EmptyState, useToast, formatDateTime, formatMoney } from "@addiscard/ui";
import { ApiError } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";
import { bitnobAdmin, FUNDING_STATUS, TOPUP_BUCKETS } from "../../data/bitnobAdmin.js";
import { rateText } from "../../data/pricingAdmin.js";

/**
 * Card top-up requests: a customer's priced top-up (a quote they accepted
 * and paid). Every figure comes from the backend: the quote as accepted
 * (card credit, rate, base, Arifcard fee, total) and, for the
 * administrator only, the card provider's expected fee and what the
 * company's provider wallet must hold. Approving creates the funding
 * instruction for the quoted USD; sending it is a separate, confirmed step.
 */
const PAYMENT_LABEL = {
  AWAITING_PAYMENT: ["neutral", "Awaiting payment"],
  VERIFYING: ["info", "Verifying"],
  REQUIRES_REVIEW: ["attention", "Payment with our team"],
  VERIFIED: ["success", "Verified"],
};

export default function TopupRequests({ bucket = null, onBucket = null }) {
  const toast = useToast();
  const load = useCallback(() => bitnobAdmin.topupRequests(), []);
  const { data, error, loading, reload } = useAsync(load, []);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const all = data?.requests || [];
  const rows = bucket ? all.filter((r) => r.bucket === bucket) : all;
  const groupLabel = TOPUP_BUCKETS.find((b) => b.value === bucket)?.label;
  const canSend = data?.provider?.available !== false;

  const go = async () => {
    setBusy(true);
    try {
      const result = await pending.fn();
      const [tone, message] = pending.done(result);
      toast[tone](message);
      reload();
    } catch (problem) {
      toast.error(problem instanceof ApiError ? problem.message : "That didn't go through.");
    } finally {
      setBusy(false);
      setPending(null);
    }
  };

  return (
    <Panel title={`${groupLabel || "All top-up requests"} (${rows.length})`} padded={false}>
      {onBucket && data && (
        <div role="group" aria-label="Top-up queue" className="flex gap-2 overflow-x-auto border-b border-line px-4 py-3 sm:px-6">
          {[{ value: null, label: "All" }, ...TOPUP_BUCKETS].map((b) => {
            const n = b.value ? all.filter((r) => r.bucket === b.value).length : all.length;
            return (
              <button
                key={b.label}
                type="button"
                aria-pressed={bucket === b.value}
                onClick={() => onBucket(b.value)}
                className={`min-h-11 shrink-0 rounded-full border px-4 text-small font-medium ${
                  bucket === b.value ? "border-accent bg-accent-soft text-accent-ink" : "border-line-strong bg-surface-1 text-ink-soft hover:bg-surface-2"
                }`}
              >
                {b.label}
                <span className="ml-1.5 tabular-nums text-ink-muted">{n}</span>
              </button>
            );
          })}
        </div>
      )}
      {loading && !data && <div className="p-4 sm:p-6"><Skeleton className="h-24 w-full" /></div>}
      {error && !data && <div className="p-4 sm:p-6"><ErrorState title="We couldn't load top-up requests" error={error} onRetry={reload} /></div>}
      {data && rows.length === 0 && (
        <EmptyState compact icon={ArrowUpFromLine} title={bucket ? "Nothing in this group." : "Top-ups appear here when a customer accepts a price and pays."} />
      )}
      {data && data.provider && !data.provider.available && rows.length > 0 && (
        <p className="px-4 pt-3 text-caption text-ink-muted sm:px-6">Sending is unavailable from this backend: {data.provider.message}</p>
      )}
      {rows.length > 0 && (
        <ul className="divide-y divide-line">
          {rows.map((r) => {
            const q = r.quote || {};
            const [payTone, payLabel] = PAYMENT_LABEL[r.paymentStatus] || ["neutral", r.paymentStatus];
            const instr = r.instruction;
            const [fundTone, fundLabel] = instr ? FUNDING_STATUS[instr.status] || ["neutral", instr.status] : [null, null];
            const sendable = instr && ["approved", "failed"].includes(instr.status);
            const checkable = instr && ["pending", "unknown", "needs_review"].includes(instr.status);
            return (
              <li key={r.intentId} className="flex flex-col gap-3 px-4 py-4 sm:px-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="min-w-0 flex-1 text-small font-medium text-ink">
                    {r.customer?.name || "Name not recorded"} · {r.customer?.email || r.uid}
                  </span>
                  <StatusPill tone={payTone}>{payLabel}</StatusPill>
                  {instr && <StatusPill tone={fundTone}>{fundLabel}</StatusPill>}
                </div>
                <dl className="grid gap-x-6 gap-y-1 text-small sm:grid-cols-2">
                  <Row label="Card" value={r.cardLast4 ? `Card •••• ${r.cardLast4}` : "—"} />
                  <Row label="Payment" value={`${r.reference || r.intentId}${r.createdAt ? ` · ${formatDateTime(r.createdAt)}` : ""}`} />
                  <Row label="Card credit" value={formatMoney(q.usdCents, "USD")} strong />
                  <Row label="Approved rate" value={q.etbPerUsd ? `${rateText(q.etbPerUsd)} ETB/USD` : "—"} />
                  {q.pricingModel === "deducted" ? (
                    <>
                      <Row label="Converted" value={formatMoney(q.convertedUsdCents, "USD")} />
                      <Row label="Arifcard customer fee" value={q.customerFeeType === "percentage" ? `${q.customerFeePercentage}% (policy ${q.pricingPolicyVersion})` : `policy ${q.pricingPolicyVersion}`} />
                      <Row label="Customer fee amount" value={`− ${formatMoney(q.customerFeeUsdCents, "USD")}`} />
                    </>
                  ) : (
                    <>
                      <Row label="Base ETB" value={formatMoney(q.baseEtbMinor, "ETB")} />
                      <Row label="Arifcard customer fee" value={q.customerFeeType === "percentage" ? `${q.customerFeePercentage}% (policy ${q.pricingPolicyVersion})` : `policy ${q.pricingPolicyVersion}`} />
                      <Row label="Customer fee amount" value={formatMoney(q.customerFeeEtbMinor, "ETB")} />
                    </>
                  )}
                  <Row label="Customer total payment" value={formatMoney(q.totalPayableEtbMinor, "ETB")} strong />
                  <Row label="Card provider fee (expected)" value={`${formatMoney(r.providerFeeEstimateCents, "USD")} · company cost`} />
                  <Row label="Provider wallet requirement" value={formatMoney(r.walletRequirementCents, "USD")} />
                </dl>
                <div className="flex flex-wrap gap-2">
                  {r.canApprove && (
                    <Button
                      size="sm"
                      onClick={() =>
                        setPending({
                          title: "Approve card funding?",
                          body: `${formatMoney(q.usdCents, "USD")} for this customer's card, from their verified payment ${r.reference || r.intentId} (${formatMoney(q.totalPayableEtbMinor, "ETB")}). The amount comes from the customer's quote. Audited. Nothing is sent to the card provider yet.`,
                          confirm: "Approve card funding",
                          fn: () => bitnobAdmin.approveFunding({ intentId: r.intentId }),
                          done: () => ["success", "Funding approved. Send it to the card provider when ready."],
                        })
                      }
                    >
                      Approve card funding
                    </Button>
                  )}
                  {sendable && (
                    <Button
                      size="sm"
                      disabled={!canSend}
                      disabledReason={canSend ? undefined : data?.provider?.message}
                      onClick={() =>
                        setPending({
                          title: instr.status === "failed" ? "Send this funding again?" : "Send this funding to the card provider?",
                          body: `One request to add ${formatMoney(instr.usdCents, "USD")} to the card from the company's provider wallet (expected provider fee about ${formatMoney(r.providerFeeEstimateCents, "USD")}, a company cost). Never retried automatically; the card is funded only when the provider confirms it.`,
                          confirm: "Send to card provider",
                          fn: () => bitnobAdmin.sendFunding(instr.id),
                          done: (x) => (x.sent ? (x.status === "pending" ? ["success", "Sent. Check with the provider to confirm it."] : x.status === "unknown" ? ["info", "No answer from the provider. Check with the provider before anything else."] : ["error", `Refused: ${x.error?.message || x.error?.code || "no reason given"}`]) : ["error", x.blocked || x.code]),
                        })
                      }
                    >
                      {instr.status === "failed" ? "Send again" : "Send to card provider"}
                    </Button>
                  )}
                  {checkable && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setPending({
                          title: "Check with the card provider?",
                          body: "Reads the card's transactions and balance from the card provider (read-only). Nothing is sent.",
                          confirm: "Check",
                          fn: () => bitnobAdmin.confirmFunding(instr.id),
                          done: (x) => (x.confirmed ? ["success", `Confirmed: ${x.amount} USD added; card balance ${x.cardBalance ?? "?"} USD.`] : x.blocked ? ["info", x.blocked] : ["info", `Not confirmed yet (${x.status}).`]),
                        })
                      }
                    >
                      Check with provider
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {pending && (
        <Dialog
          open
          onClose={busy ? () => {} : () => setPending(null)}
          title={pending.title}
          footer={
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="secondary" disabled={busy} onClick={() => setPending(null)}>
                Cancel
              </Button>
              <Button loading={busy} onClick={go}>
                {pending.confirm}
              </Button>
            </div>
          }
        >
          <p className="text-small text-ink">{pending.body}</p>
        </Dialog>
      )}
    </Panel>
  );
}

function Row({ label, value, strong = false }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-0.5">
      <dt className="text-ink-muted">{label}</dt>
      <dd className={`text-right tabular-nums ${strong ? "font-semibold text-ink" : "text-ink"}`}>{value ?? "—"}</dd>
    </div>
  );
}
