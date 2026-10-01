import { useCallback, useState } from "react";
import { StatusPill, Button, Skeleton, TextArea, ErrorState, useToast, formatMoney } from "@addiscard/ui";
import { adminService, CARD_ORDER_LABEL, CARD_ORDER_TONE } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";

/**
 * A customer's card orders, as staff see them: which payment paid for
 * each, which funding record funds it, where issuance stands, and the
 * card's masked details. The one action — retry, send to refund, or
 * cancel — is administrator-only (enforced by the backend), needs a
 * reason, and is audited. Nothing here can mark a card issued.
 *
 * Four separate facts are never merged into one status: the payment was
 * verified, the issuer was funded, the card was issued, the card is
 * active. Each gets its own pill, derived from the order's own fields.
 */
const RESOLVABLE = ["ISSUE_FAILED", "REQUIRES_REVIEW", "AWAITING_FUNDING"];

function facts(o) {
  const issuedStates = { ISSUED: ["success", "Card issued"], ISSUING: ["warning", "Issuing"], ISSUE_FAILED: ["danger", "Issue failed"] };
  return [
    o.paymentReference || o.paymentIntentId ? ["success", "Payment verified"] : ["neutral", "No payment"],
    o.status === "AWAITING_FUNDING" ? ["warning", "Funding pending"] : o.fundingId ? ["success", "Issuer funded"] : ["neutral", "Funding not recorded"],
    issuedStates[o.status] || (o.providerCardId ? ["success", "Card issued"] : ["neutral", "Not issued"]),
    o.card ? (o.card.ready ? ["success", "Card active"] : ["warning", "Not activated"]) : ["neutral", "No card yet"],
  ];
}

export default function IssuerCardOrders({ uid }) {
  const load = useCallback(() => adminService.cardOrders(uid), [uid]);
  const { data, error, loading, reload } = useAsync(load, [uid]);

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-h3 text-ink">Card orders</h3>
      {loading && <Skeleton className="h-20 w-full rounded-control" />}
      {!loading && error && <ErrorState title="We couldn't load card orders" error={error} onRetry={reload} headingLevel={4} />}
      {!loading &&
        data &&
        (data.orders.length === 0 ? (
          <p className="text-small text-ink-muted">No card orders.</p>
        ) : (
          <ul className="divide-y divide-line rounded-control border border-line">
            {data.orders.map((o) => (
              <OrderRow key={o.id} order={o} onDone={reload} />
            ))}
          </ul>
        ))}
    </section>
  );
}

function OrderRow({ order: o, onDone }) {
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(null);

  const resolve = async (resolution) => {
    setBusy(resolution);
    try {
      await adminService.resolveCardOrder(o.id, { resolution, reason });
      toast.success("Recorded in the audit log.", "Order updated");
      setReason("");
      onDone();
    } catch (problem) {
      toast.error(problem?.message || "That didn't go through. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const canAct = RESOLVABLE.includes(o.status) && !o.providerCardId;
  const reasonMissing = reason.trim().length < 10 ? "Give a reason of at least 10 characters." : null;

  return (
    <li className="flex flex-col gap-3 px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill tone={CARD_ORDER_TONE[o.status]}>{CARD_ORDER_LABEL[o.status] || o.status}</StatusPill>
        <span className="text-small font-medium text-ink">Payment {o.paymentReference || o.paymentIntentId}</span>
        {o.paymentAmountMinor != null && <span className="text-small tabular-nums text-ink-soft">{formatMoney(o.paymentAmountMinor, "ETB")}</span>}
        {o.issueAttempt > 0 && <span className="text-caption text-ink-muted">Attempt {o.issueAttempt + 1}</span>}
      </div>

      <ul aria-label="Order progress" className="flex flex-wrap gap-1.5">
        {facts(o).map(([tone, label]) => (
          <li key={label}>
            <StatusPill tone={tone}>{label}</StatusPill>
          </li>
        ))}
      </ul>

      <dl className="grid gap-x-6 gap-y-1 text-small sm:grid-cols-2">
        <Fact label="Funding record" value={o.fundingId} />
        <Fact label="Issuer operation" value={o.operationId} />
        {o.issueRequest && <Fact label="Spending limit" value={`${(o.issueRequest.limit.amount / 100).toFixed(2)} USD (${o.issueRequest.limit.frequency})`} />}
        {o.card && <Fact label="Card" value={`Ends in ${o.card.last4 || "unknown"}, expires ${o.card.expiry || "unknown"}, ${o.card.status}`} />}
      </dl>

      {o.problem && <p className="rounded-control bg-danger-tint px-3 py-2 text-small text-ink">{o.problem}</p>}
      {o.resolution && (
        <p className="text-small text-ink-soft">
          {o.resolution.resolution} by {o.resolution.by}: {o.resolution.reason}
        </p>
      )}

      {canAct && (
        <div className="flex flex-col gap-2 rounded-control bg-surface-2 p-3">
          <TextArea label="Reason (audited)" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} hint="At least 10 characters. Administrators only." />
          <div className="flex flex-wrap gap-2">
            {["ISSUE_FAILED", "REQUIRES_REVIEW"].includes(o.status) && (
              <Button size="sm" variant="secondary" loading={busy === "RETRY"} disabled={Boolean(reasonMissing)} disabledReason={reasonMissing} onClick={() => resolve("RETRY")}>
                Retry issuance
              </Button>
            )}
            <Button size="sm" variant="secondary" loading={busy === "REFUND_REQUIRED"} disabled={Boolean(reasonMissing)} disabledReason={reasonMissing} onClick={() => resolve("REFUND_REQUIRED")}>
              Mark refund required
            </Button>
            {o.status === "AWAITING_FUNDING" && (
              <Button size="sm" variant="destructive" loading={busy === "CANCEL"} disabled={Boolean(reasonMissing)} disabledReason={reasonMissing} onClick={() => resolve("CANCEL")}>
                Cancel order
              </Button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

function Fact({ label, value }) {
  return (
    <div className="flex justify-between gap-3 sm:justify-start">
      <dt className="text-ink-muted">{label}:</dt>
      <dd className="min-w-0 break-all text-ink">{value || "Not recorded"}</dd>
    </div>
  );
}
