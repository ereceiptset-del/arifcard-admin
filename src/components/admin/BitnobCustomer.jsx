import { useCallback } from "react";
import { StatusPill, ErrorState, Skeleton, formatDateTime } from "@addiscard/ui";
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
  const { data, error, loading } = useAsync(load, [uid]);
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

      {(data.cards.length > 0 || data.cardOperations.length > 0 || data.topUpRequests.length > 0) && (
        <section>
          <h3 className="text-small font-semibold text-ink">Card history</h3>
          <ul className="mt-2 divide-y divide-line rounded-control border border-line">
            {data.cards.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-small">
                <span className="min-w-0 flex-1 text-ink">Card {c.last4 ? `ending ${c.last4}` : "(no digits yet)"}{c.amountUsd ? ` · initial ${c.amountUsd} USD (sandbox)` : ""}</span>
                <StatusPill tone={c.status === "active" ? "success" : c.status === "failed" ? "danger" : "warning"}>{c.status}</StatusPill>
                {c.needsReview && <StatusPill tone="attention">Needs review</StatusPill>}
              </li>
            ))}
            {data.cardOperations.map((op) => (
              <li key={op.id} className="flex flex-wrap items-center gap-x-3 px-4 py-2.5 text-small">
                <span className="min-w-0 flex-1 text-ink">Set card {op.action}</span>
                <StatusPill tone={op.status === "done" ? "success" : op.status === "failed" ? "danger" : "warning"}>{op.status}</StatusPill>
              </li>
            ))}
            {data.topUpRequests.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-x-3 px-4 py-2.5 text-small">
                <span className="min-w-0 flex-1 text-ink">Top-up request · {(t.amountCents / 100).toFixed(2)} {t.currency}</span>
                <StatusPill tone="info">{t.status}</StatusPill>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
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
