import { useCallback, useState } from "react";
import { StatusPill, ErrorState, Skeleton, Button, Dialog, TextInput, useToast, formatDateTime, formatMoney } from "@addiscard/ui";
import { ApiError } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";
import { bitnobAdmin, KYC_STATE, CARD_STATE } from "../../data/bitnobAdmin.js";

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
 * The funding chain: verified ETB payment → allocation (rule, agreed USD,
 * rate basis) → Bitnob funding request → signed confirmation. Administrators
 * can link a payment and record the agreed USD amount (both audited); sending
 * to Bitnob is operator-run, and nothing here sets a balance.
 */
function Funding({ data, onChange }) {
  const toast = useToast();
  const [busy, setBusy] = useState(null);
  const [forms, setForms] = useState({});
  // Every change is confirmed first (both are audited and cannot be undone here).
  const [pending, setPending] = useState(null);
  const run = (key, fn, ok, confirm) => setPending({ key, fn, ok, ...confirm });
  const go = async () => {
    const { key, fn, ok } = pending;
    setBusy(key);
    try {
      await fn();
      toast.success(ok);
      onChange();
    } catch (problem) {
      toast.error(problem instanceof ApiError ? problem.message : "That didn't go through.");
    } finally {
      setBusy(null);
      setPending(null);
    }
  };
  const form = (id) => forms[id] || { usdAmount: "", etbPerUsd: "", rateSource: "" };
  const set = (id, key) => (event) => setForms((f) => ({ ...f, [id]: { ...form(id), [key]: event.target.value } }));
  if (!data.funding.length && !data.verifiedPaymentsNotAllocated.length) return null;

  return (
    <section>
      <h3 className="text-small font-semibold text-ink">Card funding</h3>
      <p className="mt-1 text-caption text-ink-muted">Rule {data.fundingRule.version}: {data.fundingRule.description}</p>
      {data.verifiedPaymentsNotAllocated.length > 0 && (
        <ul className="mt-2 divide-y divide-line rounded-control border border-line">
          {data.verifiedPaymentsNotAllocated.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 text-small">
              <span className="min-w-0 flex-1 text-ink">
                Verified payment {p.reference || p.id} · {p.verifiedAmountMinor != null ? formatMoney(p.verifiedAmountMinor, p.currency) : "amount not recorded"}
              </span>
              <Button
                size="sm"
                variant="secondary"
                loading={busy === `alloc-${p.id}`}
                onClick={() =>
                  run(`alloc-${p.id}`, () => bitnobAdmin.allocate(p.id), "Linked to card funding.", {
                    title: "Allocate this payment to card funding?",
                    body: `Payment ${p.reference || p.id} (${p.verifiedAmountMinor != null ? formatMoney(p.verifiedAmountMinor, p.currency) : "amount not recorded"}) will be linked to this customer's card funding under rule ${data.fundingRule.version}. Nothing is sent to the card provider. A payment can be allocated only once.`,
                  })
                }
              >
                Allocate to card funding
              </Button>
            </li>
          ))}
        </ul>
      )}
      {data.funding.length > 0 && (
        <ul className="mt-2 divide-y divide-line rounded-control border border-line">
          {data.funding.map((f) => {
            const editable = ["awaiting_usd_amount", "ready_to_fund"].includes(f.status);
            const v = form(f.id);
            return (
              <li key={f.id} className="flex flex-col gap-2 px-4 py-3 text-small">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="min-w-0 flex-1 text-ink">
                    {f.paymentReference || f.intentId} · {formatMoney(f.etbReceivedMinor, "ETB")} received · fee {formatMoney(f.etbFeeMinor, "ETB")}
                  </span>
                  <StatusPill tone={f.status === "funded" ? "success" : f.status === "failed" ? "danger" : "warning"}>{f.status}</StatusPill>
                </div>
                <span className="text-caption text-ink-muted">
                  {f.usdCents != null ? `Agreed ${formatMoney(f.usdCents, "USD")} at ${f.rateBasis?.etbPerUsd} ETB/USD (${f.rateBasis?.source})` : "No agreed USD amount yet"}
                  {f.operation ? ` · Bitnob request ${f.operation.status}${f.operation.needsReview ? ` — review: ${f.operation.reviewReason}` : ""}` : ""}
                </span>
                {editable && (
                  <div className="grid gap-2 sm:grid-cols-[1fr_1fr_2fr_auto] sm:items-end">
                    <TextInput label="Agreed USD" inputMode="decimal" value={v.usdAmount} onChange={set(f.id, "usdAmount")} />
                    <TextInput label="ETB per USD" inputMode="decimal" value={v.etbPerUsd} onChange={set(f.id, "etbPerUsd")} />
                    <TextInput label="Rate source" value={v.rateSource} onChange={set(f.id, "rateSource")} />
                    <Button
                      size="sm"
                      loading={busy === `usd-${f.id}`}
                      onClick={() =>
                        run(`usd-${f.id}`, () => bitnobAdmin.recordUsd(f.id, v), "Agreed amount recorded.", {
                          title: "Record the agreed USD amount?",
                          body: `${v.usdAmount || "?"} USD at ${v.etbPerUsd || "?"} ETB/USD (source: ${v.rateSource || "?"}) for ${f.paymentReference || f.intentId}. Recorded exactly as entered and audited. Nothing is sent to the card provider.`,
                        })
                      }
                    >
                      Record
                    </Button>
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
                Cancel
              </Button>
              <Button loading={Boolean(busy)} onClick={go}>
                Confirm
              </Button>
            </div>
          }
        >
          <p className="text-small text-ink">{pending.body}</p>
        </Dialog>
      )}
    </section>
  );
}
