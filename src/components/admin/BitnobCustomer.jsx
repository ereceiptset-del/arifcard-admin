import { useCallback, useState } from "react";
import { StatusPill, ErrorState, Skeleton, Button, Dialog, TextInput, useToast, formatDateTime, formatMoney } from "@addiscard/ui";
import { ApiError } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";
import { bitnobAdmin, KYC_STATE, CARD_STATE, FUNDING_STATUS } from "../../data/bitnobAdmin.js";

/**
 * One customer's card-provider (Bitnob, sandbox) picture — read-only.
 *
 * Three separate states: Arifcard's own review (staff), Bitnob Card KYC
 * (Bitnob's decision, from signed events only) and the card. Missing items
 * are shown by NAME; declaration values and identity data are never sent
 * to this screen. Staff cannot set a Bitnob approval, a balance or a card
 * state from here — those come only from Bitnob.
 */
export default function BitnobCustomer({ uid }) {
  const load = useCallback(() => bitnobAdmin.customer(uid), [uid]);
  const { data, error, loading, reload } = useAsync(load, [uid]);
  if (error && !data) return <ErrorState title="Couldn't load the card provider status" error={error} headingLevel={4} />;
  if (loading && !data) return <Skeleton className="h-48 w-full rounded-control" />;
  const o = data.overview;
  const k = data.kycRecord;
  const [kt, kl] = KYC_STATE[o.bitnobKyc.state] || ["neutral", o.bitnobKyc.state];
  const [ct, cl] = CARD_STATE[o.card.state] || ["neutral", o.card.state];
  const d = o.declarations;
  const missingDecl = ["postalCode", "annualSalary", "expectedMonthlyVolume"].filter((f) => !d[f]);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-caption text-ink-muted">Environment: {o.environment}. Bitnob's decisions come only from signed Bitnob events; nothing here can change them.</p>
      <dl className="divide-y divide-line rounded-control border border-line">
        <Line label="Arifcard review (staff)" value={<StatusPill tone={o.arifcard.approved ? "success" : "neutral"}>{o.arifcard.approved ? `Approved · v${o.arifcard.approvedVersion ?? "?"}` : o.arifcard.status}</StatusPill>} />
        <Line label="Document" value={o.arifcard.documentType || "—"} />
        <Line label="Bitnob Card KYC" value={<StatusPill tone={kt}>{kl}</StatusPill>} />
        <Line label="Card" value={<StatusPill tone={ct}>{cl}</StatusPill>} />
        {o.card.last4 && <Line label="Card ends in" value={o.card.last4} />}
      </dl>

      <section>
        <h3 className="text-small font-semibold text-ink">Before it can be sent</h3>
        {o.submission.blockers.length === 0 ? (
          <p className="mt-1 text-small text-ink-soft">Nothing blocking.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1.5">
            {o.submission.blockers.map((b) => (
              <li key={b.code} className="text-small text-ink-soft">
                <span className="text-caption font-semibold text-ink">{b.code}</span> — {b.message}
                {b.fields?.length ? ` (${b.fields.join(", ")})` : ""}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-caption text-ink-muted">
          Customer declarations: {missingDecl.length ? `missing ${missingDecl.join(", ")}` : "present"}
          {d.currency ? ` · currency ${d.currency}` : ""} · consent {d.consentAccepted ? "given" : "not given"}
        </p>
      </section>

      {k && (
        <section>
          <h3 className="text-small font-semibold text-ink">Submission</h3>
          <dl className="mt-2 divide-y divide-line rounded-control border border-line">
            <Line label="Local status" value={k.status} />
            <Line label="Attempts" value={String(k.attempts)} />
            <Line label="For case version" value={k.arifcardApprovedVersion != null ? `v${k.arifcardApprovedVersion}` : "—"} />
            <Line label="Bitnob customer id stored" value={k.providerCustomerIdStored ? "Yes" : "No"} />
            <Line label="Last error" value={k.lastError ? `${k.lastError.category || ""} ${k.lastError.code || ""} ${k.lastError.status ?? ""}`.trim() : "—"} />
            <Line label="Last Bitnob event" value={k.lastEventType || "—"} />
            <Line label="Sent" value={k.submittedAt ? formatDateTime(k.submittedAt) : "—"} />
            <Line label="Decided" value={k.decidedAt ? formatDateTime(k.decidedAt) : "—"} />
            {k.needsReview && <Line label="Review" value={<StatusPill tone="attention">Needs review</StatusPill>} />}
          </dl>
          {o.bitnobKyc.rejectionCodes?.length > 0 && <p className="mt-2 text-caption text-ink-muted">Bitnob reasons: {o.bitnobKyc.rejectionCodes.join(", ")}</p>}
        </section>
      )}

      <Funding data={data} onChange={reload} />

      {(data.cards.length > 0 || data.cardOperations.length > 0 || data.topUpRequests.length > 0) && (
        <section>
          <h3 className="text-small font-semibold text-ink">Card history</h3>
          <ul className="mt-2 divide-y divide-line rounded-control border border-line">
            {data.cards.map((c) => (
              <HistoryRow key={c.id} at={c.createdAt} detail={c.lastError ? `Provider: ${[c.lastError.code, c.lastError.status].filter(Boolean).join(" ")}` : c.reason || null}>
                <span className="text-ink">Card {c.last4 ? `ending ${c.last4}` : "(no digits yet)"}{c.amountUsd ? ` · initial ${c.amountUsd} USD (sandbox)` : ""}</span>
                <StatusPill tone={c.status === "active" ? "success" : c.status === "failed" ? "danger" : "warning"}>{c.status}</StatusPill>
                {c.needsReview && <StatusPill tone="attention">Needs review</StatusPill>}
              </HistoryRow>
            ))}
            {data.cardOperations.map((op) => (
              <HistoryRow
                key={op.id}
                at={op.createdAt}
                detail={[op.settledBy === "provider_read" ? "settled by reading the card" : null, op.error ? `error ${[op.error.code, op.error.status].filter(Boolean).join(" ")}` : null].filter(Boolean).join(" · ") || null}
              >
                <span className="text-ink">{op.action === "frozen" ? "Freeze" : op.action === "active" ? "Unfreeze" : `Set ${op.action}`}</span>
                <StatusPill tone={OP_TONE[op.status] || "warning"}>{OP_LABEL[op.status] || op.status}</StatusPill>
              </HistoryRow>
            ))}
            {data.topUpRequests.map((t) => (
              <HistoryRow key={t.id} at={t.createdAt}>
                <span className="text-ink">Customer top-up request · {(t.amountCents / 100).toFixed(2)} {t.currency}</span>
                <StatusPill tone="info">{t.status}</StatusPill>
              </HistoryRow>
            ))}
          </ul>
        </section>
      )}

      {data.sandboxTopups?.length > 0 && (
        <section>
          <h3 className="text-small font-semibold text-ink">Sandbox test top-ups</h3>
          <p className="mt-1 text-caption text-ink-muted">Operator-run lifecycle tests with test funds — not customer funding. Confirmed only by Bitnob (a read of the card or the signed event).</p>
          <ul className="mt-2 divide-y divide-line rounded-control border border-line">
            {data.sandboxTopups.map((t) => (
              <HistoryRow
                key={t.id}
                at={t.createdAt}
                detail={[
                  t.feeUnits != null ? `fee ${units(t.feeUnits, t.unitsPerUsd)}` : null,
                  `cap ${t.maxDebitUsd}.00`,
                  t.companyDebitUnits != null ? `company debit ${units(t.companyDebitUnits, "1000000")} USDC` : null,
                  t.confirmedBy ? `confirmed by ${t.confirmedBy === "provider_read" ? "card read" : "signed event"}` : null,
                  t.error ? `refused: ${[t.error.code, t.error.status].filter(Boolean).join(" ")}` : null,
                  t.reviewReason ? `review: ${t.reviewReason}` : null,
                  t.resolution ? `resolved: ${t.resolution}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              >
                <span className="text-ink">Test top-up · {units(t.amountUnits, t.unitsPerUsd)} USD</span>
                <StatusPill tone={t.status === "confirmed" ? "success" : t.status === "failed" ? "danger" : "warning"}>{t.status}</StatusPill>
                {t.needsReview && <StatusPill tone="attention">Needs review</StatusPill>}
              </HistoryRow>
            ))}
          </ul>
        </section>
      )}

      {data.transactions?.length > 0 && (
        <section>
          <h3 className="text-small font-semibold text-ink">Card activity (signed provider events)</h3>
          <ul className="mt-2 divide-y divide-line rounded-control border border-line">
            {data.transactions.map((t) => (
              <HistoryRow key={t.reference} at={t.occurredAt} detail={[t.chargedTo === "company_wallet" ? "charged to the company wallet" : null, t.reviewReason ? `review: ${t.reviewReason}` : null].filter(Boolean).join(" · ") || null}>
                <span className="text-ink">
                  {t.merchant || t.kind} · {t.amountUnits != null ? `${units(t.amountUnits, "1000000")} ${t.currency || ""}` : "amount not reported"}
                </span>
                <StatusPill tone={t.state === "settled" || t.state === "completed" ? "success" : t.state === "declined" ? "danger" : "neutral"}>{t.state}</StatusPill>
                {t.needsReview && <StatusPill tone="attention">Needs review</StatusPill>}
              </HistoryRow>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

const OP_LABEL = { sending: "Sending", unknown: "Outcome unknown — reconcile", done: "Done", not_applied: "Not applied", failed: "Refused" };
const OP_TONE = { done: "success", failed: "danger", not_applied: "neutral", unknown: "attention" };

/** Integer provider units → an exact two-decimal string (display only). */
function units(value, perUsd) {
  if (!/^-?\d{1,20}$/.test(String(value ?? "")) || !/^\d{1,12}$/.test(String(perUsd ?? ""))) return "?";
  const per = BigInt(perUsd);
  let u = BigInt(value);
  const sign = u < 0n ? "-" : "";
  if (u < 0n) u = -u;
  return `${sign}${u / per}.${String(((u % per) * 100n) / per).padStart(2, "0")}`;
}

function HistoryRow({ at, detail, children }) {
  return (
    <li className="flex flex-col gap-1 px-4 py-2.5 text-small">
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="min-w-0 flex-1">{children[0] ?? children}</span>
        {Array.isArray(children) ? children.slice(1) : null}
      </span>
      {(at || detail) && <span className="text-caption text-ink-muted">{[at ? formatDateTime(at) : null, detail].filter(Boolean).join(" · ")}</span>}
    </li>
  );
}

function Line({ label, value }) {
  return (
    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-4 px-4 py-2.5">
      <dt className="text-small text-ink-muted">{label}</dt>
      <dd className="min-w-0 break-words text-right text-small text-ink">{value}</dd>
    </div>
  );
}

/**
 * Card funding from an APPROVED USD instruction: verified payment → the USD
 * amount an administrator approves for the card (no exchange rate, no
 * conversion here) → one request to the card provider → the provider's
 * confirmation. Every action is confirmed in a dialog and audited; the
 * provider's fee is absorbed by the company and shown here only. Nothing here
 * sets a balance.
 */
function Funding({ data, onChange }) {
  const toast = useToast();
  const [busy, setBusy] = useState(null);
  const [amounts, setAmounts] = useState({});
  const [pending, setPending] = useState(null);
  const [reason, setReason] = useState("");
  const rule = data.fundingRule;
  const canSend = data.provider?.available !== false;
  const ask = (p) => {
    setReason("");
    setPending(p);
  };
  const go = async (override) => {
    const { key, done } = pending;
    const fn = override || pending.fn;
    setBusy(key);
    try {
      const result = await fn();
      const [tone, message] = done(result);
      toast[tone](message);
      onChange();
    } catch (problem) {
      toast.error(problem instanceof ApiError ? problem.message : "That didn't go through.");
    } finally {
      setBusy(null);
      setPending(null);
    }
  };
  if (!data.funding.length && !data.verifiedPaymentsNotInstructed.length) return null;
  const usd = (cents) => formatMoney(cents, "USD");

  return (
    <section>
      <h3 className="text-small font-semibold text-ink">Card funding</h3>
      <p className="mt-1 text-caption text-ink-muted">{rule.description} Sandbox: {usd(rule.minUsdCents)} to {usd(rule.maxUsdCents)} per instruction.</p>
      {data.provider && !data.provider.available && <p className="mt-1 text-caption text-ink-muted">Sending is unavailable from this backend: {data.provider.message}</p>}

      {data.verifiedPaymentsNotInstructed.length > 0 && (
        <ul className="mt-2 divide-y divide-line rounded-control border border-line">
          {data.verifiedPaymentsNotInstructed.map((p) => {
            const amount = amounts[p.id] || "";
            return (
              <li key={p.id} className="flex flex-col gap-2 px-4 py-3 text-small">
                <span className="text-ink">
                  Verified payment {p.reference || p.id} · {p.verifiedAmountMinor != null ? formatMoney(p.verifiedAmountMinor, p.currency) : "amount not recorded"}
                </span>
                <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                  <TextInput label="Approved USD for the card" hint="As approved upstream — never converted here." inputMode="decimal" value={amount} onChange={(e) => setAmounts((a) => ({ ...a, [p.id]: e.target.value }))} />
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={busy === `approve-${p.id}`}
                    disabled={!amount}
                    onClick={() =>
                      ask({
                        key: `approve-${p.id}`,
                        title: "Approve this card funding?",
                        body: `${amount} USD for this customer's card, for payment ${p.reference || p.id}. Recorded exactly as entered and audited. Nothing is sent to the card provider yet. A payment can back only one instruction.`,
                        fn: () => bitnobAdmin.approveFunding({ intentId: p.id, usdAmount: amount }),
                        done: () => ["success", "Funding approved. Send it when ready."],
                      })
                    }
                  >
                    Approve funding
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {data.funding.length > 0 && (
        <ul className="mt-2 divide-y divide-line rounded-control border border-line">
          {data.funding.map((f) => {
            const [tone, label] = FUNDING_STATUS[f.status] || ["neutral", f.status];
            const o = f.operation;
            const sendable = ["approved", "failed"].includes(f.status);
            const checkable = o && ["pending", "unknown", "needs_review", "funded"].includes(f.status);
            return (
              <li key={f.id} className="flex flex-col gap-2 px-4 py-3 text-small">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="min-w-0 flex-1 text-ink">
                    {usd(f.usdCents)} for the card · payment {f.paymentReference || f.intentId}
                  </span>
                  <StatusPill tone={tone}>{label}</StatusPill>
                </div>
                <span className="text-caption text-ink-muted">
                  {[
                    `Approved by ${f.approvedBy || "?"}${f.approvedAt ? ` ${formatDateTime(f.approvedAt)}` : ""}`,
                    f.note ? `note: ${f.note}` : null,
                    f.attempts ? `${f.attempts} request${f.attempts > 1 ? "s" : ""} sent` : null,
                    o?.feeUnits != null ? `provider fee ${units(o.feeUnits, o.unitsPerUsd)} USD (company)` : null,
                    o?.confirmedBy ? `confirmed by ${o.confirmedBy === "provider_read" ? "provider read" : "signed event"}` : null,
                    o?.cardBalanceDelta != null ? `card balance change ${units(o.cardBalanceDelta, o.unitsPerUsd)} USD` : null,
                    f.lastError && f.status === "failed" ? `refused: ${f.lastError.message || f.lastError.code}` : null,
                    o?.reviewReason ? `review: ${o.reviewReason}` : null,
                    f.cancelReason ? `cancelled: ${f.cancelReason}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
                {(sendable || checkable) && (
                  <div className="flex flex-wrap gap-2">
                    {sendable && (
                      <Button
                        size="sm"
                        loading={busy === `send-${f.id}`}
                        disabled={!canSend}
                        disabledReason={canSend ? undefined : data.provider?.message}
                        onClick={() =>
                          ask({
                            key: `send-${f.id}`,
                            title: f.status === "failed" ? "Send this funding again?" : "Send this funding to the card provider?",
                            body: `One request to fund the card with ${usd(f.usdCents)} from the company's test balance (the provider's fee, about 1.00 USD, is absorbed by the company). It is never retried automatically; the card is funded only when the provider confirms it.`,
                            fn: () => bitnobAdmin.sendFunding(f.id),
                            done: (r) => (r.sent ? (r.status === "pending" ? ["success", "Sent. Check with the provider to confirm it."] : r.status === "unknown" ? ["info", "No answer from the provider. Check with the provider before anything else."] : ["error", `Refused: ${r.error?.message || r.error?.code || "no reason given"}`]) : ["error", r.blocked || r.code]),
                          })
                        }
                      >
                        {f.status === "failed" ? "Send again" : "Send to card provider"}
                      </Button>
                    )}
                    {checkable && (
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={busy === `check-${f.id}`}
                        onClick={() =>
                          ask({
                            key: `check-${f.id}`,
                            title: "Check with the card provider?",
                            body: "Reads the card's transactions and balance from the card provider (read-only). Nothing is sent.",
                            fn: () => bitnobAdmin.confirmFunding(f.id),
                            done: (r) => (r.confirmed ? ["success", `Confirmed: ${r.amount} USD added; card balance ${r.cardBalance ?? "?"} USD.`] : r.blocked ? ["info", r.blocked] : ["info", `Not confirmed yet (${r.status}).`]),
                          })
                        }
                      >
                        Check with provider
                      </Button>
                    )}
                    {sendable && (
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={busy === `cancel-${f.id}`}
                        onClick={() =>
                          ask({
                            key: `cancel-${f.id}`,
                            title: "Cancel this funding instruction?",
                            body: "Nothing is open at the card provider for it. The instruction stays in the audit log.",
                            needsReason: true,
                            fn: null,
                            id: f.id,
                            done: () => ["success", "Instruction cancelled."],
                          })
                        }
                      >
                        Cancel instruction
                      </Button>
                    )}
                  </div>
                )}
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
              <Button variant="secondary" disabled={Boolean(busy)} onClick={() => setPending(null)}>
                Back
              </Button>
              <Button
                loading={Boolean(busy)}
                disabled={pending.needsReason && reason.trim().length < 5}
                onClick={() => go(pending.needsReason ? () => bitnobAdmin.cancelFunding(pending.id, reason.trim()) : undefined)}
              >
                Confirm
              </Button>
            </div>
          }
        >
          <p className="text-small text-ink">{pending.body}</p>
          {pending.needsReason && <div className="mt-3"><TextInput label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} /></div>}
        </Dialog>
      )}
    </section>
  );
}
