import { useCallback, useState } from "react";
import { CreditCard, Plus, RefreshCw, Send } from "lucide-react";
import { Panel, Button, Badge, Skeleton, ErrorState, EmptyState, SelectInput, useToast } from "@addiscard/ui";
import { cardIssuerService, ApiError, CARD_ORDER_LABEL, CARD_ORDER_TONE, birr } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";
import IssuerOnboardingPanel from "../../components/cards/IssuerOnboardingPanel.jsx";

/**
 * Cards.
 *
 * Three separate steps, each decided by the backend from its own records:
 * verification with the card issuer (the panel at the top), a card order
 * paid by one of the customer's verified payments, and issuance once our
 * team has funded the card at the issuer. Nothing on this page decides a
 * status, and no card number, CVC or PIN is ever shown here.
 */

/** Masked card face: the last four digits and expiry, nothing else. */
function CardFace({ card }) {
  return (
    <div className={`relative w-full max-w-[340px] rounded-panel border border-white/10 bg-[#101217] p-5 ${card.ready ? "" : "opacity-80"}`}>
      <div className="flex items-start justify-between">
        <span className="text-[13px] font-semibold text-white/90">Arifcard</span>
        <Badge tone={card.ready ? "ok" : "neutral"}>{card.ready ? "Ready" : card.status === "notActivated" ? "Not activated" : card.status}</Badge>
      </div>
      <p className="mt-7 font-mono text-[15px] tracking-[0.18em] text-white/90">•••• •••• •••• {card.last4 || "····"}</p>
      <div className="mt-5 flex items-end justify-between font-mono text-[9px] uppercase tracking-wider text-ink-faint">
        <div>
          <p>Expires</p>
          <p className="mt-0.5 text-white/80">{card.expiry || "—"}</p>
        </div>
        <div className="text-right">
          <p>Limit</p>
          <p className="mt-0.5 text-white/80">{card.limitUsd ? `${card.limitUsd} USD` : "—"}</p>
        </div>
      </div>
      {!card.ready && <p className="mt-4 text-[11.5px] text-white/60">Issued. It becomes ready once the issuer activates it.</p>}
    </div>
  );
}

function OrderRow({ order, onIssue, onRefresh, busy }) {
  return (
    <div className="flex flex-col gap-4 border-b border-line dark:border-line-dark px-5 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={CARD_ORDER_TONE[order.status]}>{CARD_ORDER_LABEL[order.status] || order.status}</Badge>
          {order.paymentReference && <span className="font-mono text-[12px] text-ink-faint">{order.paymentReference}</span>}
        </div>
        <p className="mt-2 text-[13px] text-ink dark:text-ink-dark">{order.message}</p>
        {order.card && (
          <div className="mt-4">
            <CardFace card={order.card} />
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
        {order.canIssue && (
          <Button icon={Send} loading={busy === `issue-${order.id}`} onClick={() => onIssue(order)}>
            Issue my card
          </Button>
        )}
        {order.card && !order.card.ready && (
          <Button variant="secondary" size="sm" icon={RefreshCw} loading={busy === `refresh-${order.id}`} onClick={() => onRefresh(order)}>
            Check card
          </Button>
        )}
      </div>
    </div>
  );
}

export default function CardsPage() {
  const toast = useToast();
  const load = useCallback(() => cardIssuerService.cardOrders(), []);
  const { data, error, loading, reload } = useAsync(load, []);
  const [paymentId, setPaymentId] = useState("");
  const [busy, setBusy] = useState(null);

  const run = async (key, fn, success) => {
    setBusy(key);
    try {
      await fn();
      if (success) toast.success(success);
    } catch (problem) {
      toast.error(problem instanceof ApiError ? problem.message : "That did not work. Try again.");
    } finally {
      setBusy(null);
      reload();
    }
  };

  const orders = data?.orders || [];
  const payments = data?.eligiblePayments || [];

  return (
    <>
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">Cards</h1>
        <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">Virtual USD cards, issued by our card issuer.</p>
      </div>

      <div className="mt-6">
        <IssuerOnboardingPanel />
      </div>

      {loading && <Skeleton className="mt-6 h-[160px] w-full" />}
      {!loading && error && (
        <div className="mt-6">
          <ErrorState title="Could not load your card orders" message={error.message} onRetry={reload} />
        </div>
      )}

      {!loading && !error && data && (
        <div className="mt-6 flex flex-col gap-5">
          {payments.length > 0 && (
            <Panel title="Order a card" description="Choose one of your verified payments to pay for a card. Our team then funds the card with the card issuer.">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <SelectInput
                  label="Verified payment"
                  placeholder="Choose a payment"
                  options={payments.map((p) => ({ value: p.id, label: `${p.reference} · ${birr(p.amountMinor)}` }))}
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                />
                <Button
                  icon={Plus}
                  disabled={!paymentId}
                  loading={busy === "order"}
                  onClick={() => run("order", () => cardIssuerService.orderCard(paymentId).then(() => setPaymentId("")), "Card ordered.")}
                >
                  Order card
                </Button>
              </div>
            </Panel>
          )}

          <Panel padded={false}>
            {orders.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title="No cards yet"
                description={payments.length ? "Order a card with one of your verified payments above." : "Verify with the card issuer, then add money to your account to order a card."}
              />
            ) : (
              orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  busy={busy}
                  onIssue={(o) => run(`issue-${o.id}`, () => cardIssuerService.issueCard(o.id))}
                  onRefresh={(o) => run(`refresh-${o.id}`, () => cardIssuerService.refreshCard(o.id))}
                />
              ))
            )}
          </Panel>
        </div>
      )}
    </>
  );
}
