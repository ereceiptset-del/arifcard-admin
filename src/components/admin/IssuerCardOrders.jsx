import { useCallback, useState } from "react";
import { Badge, Button, Skeleton, TextArea, useToast } from "@addiscard/ui";
import { adminService, CARD_ORDER_LABEL, CARD_ORDER_TONE, birr } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";

/**
 * A customer's card orders, as staff see them: which payment paid for
 * each, which funding record funds it, where issuance stands, and the
 * card's masked details. The one action — retry, send to refund, or
 * cancel — is administrator-only (enforced by the backend), needs a
 * reason, and is audited. Nothing here can mark a card issued.
 */
const RESOLVABLE = ["ISSUE_FAILED", "REQUIRES_REVIEW", "AWAITING_FUNDING"];

export default function IssuerCardOrders({ uid }) {
  const load = useCallback(() => adminService.cardOrders(uid), [uid]);
  const { data, error, loading, reload } = useAsync(load, [uid]);

  return (
    <div>
      <p className="text-[13px] font-medium text-ink dark:text-ink-dark">Card orders</p>
      {loading && <Skeleton className="mt-2 h-[60px] w-full" />}
      {!loading && error && <p className="mt-2 text-[12.5px] text-danger">{error.message}</p>}
      {!loading && data && (data.orders.length === 0 ? (
        <p className="mt-2 text-[12.5px] text-ink-faint">No card orders.</p>
      ) : (
        <ul className="mt-2 divide-y divide-line dark:divide-line-dark rounded-panel border border-line dark:border-line-dark">
          {data.orders.map((o) => (
            <OrderRow key={o.id} order={o} onDone={reload} />
          ))}
        </ul>
      ))}
    </div>
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
      toast.success("Recorded.");
      setReason("");
      onDone();
    } catch (problem) {
      toast.error(problem?.message || "That did not work.");
    } finally {
      setBusy(null);
    }
  };

  const canAct = RESOLVABLE.includes(o.status) && !o.providerCardId;
  return (
    <li className="px-4 py-3 text-[12.5px]">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={CARD_ORDER_TONE[o.status]}>{CARD_ORDER_LABEL[o.status] || o.status}</Badge>
        <span className="font-mono">{o.paymentReference || o.paymentIntentId}</span>
        <span className="text-ink-faint">paid {birr(o.paymentAmountMinor)}</span>
        {o.issueAttempt > 0 && <span className="text-ink-faint">attempt {o.issueAttempt + 1}</span>}
      </div>
      <p className="mt-1 text-ink-faint">
        Funding: {o.fundingId || "not recorded"} · Operation: {o.operationId || "—"}
        {o.issueRequest ? ` · Limit ${(o.issueRequest.limit.amount / 100).toFixed(2)} USD (${o.issueRequest.limit.frequency})` : ""}
      </p>
      {o.card && (
        <p className="mt-1 font-mono text-[11.5px]">
          Card ···· {o.card.last4 || "????"} · {o.card.expiry || "—"} · {o.card.status} · {o.card.ready ? "ready" : "not ready"}
        </p>
      )}
      {o.problem && <p className="mt-1 text-danger">{o.problem}</p>}
      {o.resolution && (
        <p className="mt-1 text-ink-faint">
          {o.resolution.resolution} by {o.resolution.by}: {o.resolution.reason}
        </p>
      )}
      {canAct && (
        <div className="mt-3 flex flex-col gap-2">
          <TextArea label="Reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {["ISSUE_FAILED", "REQUIRES_REVIEW"].includes(o.status) && (
              <Button size="sm" variant="secondary" loading={busy === "RETRY"} disabled={reason.trim().length < 10} onClick={() => resolve("RETRY")}>
                Retry issuance
              </Button>
            )}
            <Button size="sm" variant="secondary" loading={busy === "REFUND_REQUIRED"} disabled={reason.trim().length < 10} onClick={() => resolve("REFUND_REQUIRED")}>
              Refund required
            </Button>
            {o.status === "AWAITING_FUNDING" && (
              <Button size="sm" variant="secondary" loading={busy === "CANCEL"} disabled={reason.trim().length < 10} onClick={() => resolve("CANCEL")}>
                Cancel order
              </Button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
