import { useCallback, useEffect, useRef, useState } from "react";
import { CircleCheck, CircleX, CircleHelp, TriangleAlert, CreditCard, ShieldCheck, Receipt, Building2, History, Loader2, RefreshCw } from "lucide-react";
import { Button, Dialog, StatusPill, Skeleton, Checkbox, formatDateTime, formatMoney } from "@addiscard/ui";
import { ApiError } from "@addiscard/services";
import { bitnobAdmin } from "../../data/bitnobAdmin.js";

/**
 * Card issuance review (administrator).
 *
 * One panel, three steps: REVIEW (everything the backend checked, read-only)
 * → CONFIRM (an explicit acknowledgement) → PROGRESS (the backend's issue,
 * then provider-confirmed states). Every value comes from the backend's
 * review projection (GET /admin/bitnob/issuance/:uid/review); this file
 * decides nothing — not eligibility, not the amount, not the environment.
 * Issuing sends only the customer id; the backend reloads and re-checks
 * everything, records the operation and calls the provider once.
 */

const CHECK_VIEW = {
  pass: { icon: CircleCheck, text: "Passed", className: "text-success" },
  warning: { icon: TriangleAlert, text: "Review", className: "text-warning" },
  blocked: { icon: CircleX, text: "Blocked", className: "text-danger" },
  unknown: { icon: CircleHelp, text: "Unknown", className: "text-neutral" },
};

const OVERALL = {
  ready: { tone: "success", label: "Ready for issuance" },
  review: { tone: "attention", label: "Ready — admin review required" },
  blocked: { tone: "danger", label: "Blocked" },
  unknown: { tone: "neutral", label: "Cannot confirm" },
};

const VERIFICATION_LABEL = {
  APPROVED: "Approved",
  PENDING: "Pending",
  UNDER_REVIEW: "Pending",
  CHANGES_REQUESTED: "Needs correction",
  REJECTED: "Rejected",
  NOT_SUBMITTED: "Not submitted",
};
const PROVIDER_KYC_LABEL = { approved: "Approved", pending: "Pending", submitting: "Pending", rejected: "Rejected", failed: "Failed", unknown: "Outcome unknown", review_required: "Needs review", not_submitted: "Not submitted" };
const DOCUMENT_LABEL = { FAYDA: "Fayda (national ID)", PASSPORT: "Passport" };

/** Safe admin-facing categories for an issue refusal (never a raw provider payload). */
const ISSUE_ERROR = {
  NOT_READY_FOR_ISSUANCE: "The customer is not eligible right now",
  ISSUANCE_IN_PROGRESS: "An issuance request is already in progress",
  SANDBOX_AMOUNT_LIMIT: "Sandbox amount limit exceeded",
  IP_ALLOWLIST_MISMATCH: "Network access unavailable",
  PROVIDER_NOT_AVAILABLE_HERE: "Card provider not set up on this backend",
  INSUFFICIENT_PROVIDER_FUNDS: "Provider funding unavailable",
  KYC_REQUIRED: "Provider Card KYC not approved",
  CARD_ALREADY_EXISTS: "Existing card detected",
  FORBIDDEN: "Only an administrator can issue cards",
};

const usd = (cents) => (cents == null ? null : formatMoney(cents, "USD"));
const etb = (minor) => (minor == null ? null : formatMoney(minor, "ETB"));

export default function CardIssuanceReview({ uid, fallbackName, onClose, onChanged }) {
  const [review, setReview] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("review"); // review | confirm | progress
  const [acknowledged, setAcknowledged] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [issueResult, setIssueResult] = useState(null);
  const pollRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { review: r } = await bitnobAdmin.issuanceReview(uid);
      setReview(r);
      return r;
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : "The review could not be loaded.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [uid]);

  // First load on open (loading already starts true); later reloads go through `load`.
  useEffect(() => {
    let cancelled = false;
    bitnobAdmin
      .issuanceReview(uid)
      .then(({ review: r }) => !cancelled && setReview(r))
      .catch((e) => !cancelled && setLoadError(e instanceof ApiError ? e.message : "The review could not be loaded."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
      clearInterval(pollRef.current);
    };
  }, [uid]);

  // After the request: re-read the review (read-only) until the provider's outcome is known.
  const watch = () => {
    let rounds = 0;
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      rounds += 1;
      const r = await load();
      if (!r || r.card || ["unknown", "failed", "blocked"].includes(r.state) || rounds >= 30) clearInterval(pollRef.current);
    }, 4000);
  };

  const issue = async () => {
    setIssuing(true);
    setStep("progress");
    try {
      const r = await bitnobAdmin.issue(uid);
      setIssueResult(r);
      onChanged?.();
      if (r.cardCreated) watch();
      else await load();
    } catch (e) {
      setIssueResult({ error: e instanceof ApiError ? e : null, code: e?.code || null, message: e instanceof ApiError ? e.message : "The request didn't go through.", problems: e?.problems || [] });
      await load();
    } finally {
      setIssuing(false);
    }
  };

  const name = review?.customer?.displayName || fallbackName || "Customer";
  const sandbox = review?.environment === "sandbox";
  const canIssue = review?.allowedAction === "ISSUE";
  const blockedReasons = (review?.eligibility?.checks || []).filter((c) => c.status === "blocked" || c.status === "unknown");

  const footer =
    step === "review" ? (
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p id="issuance-action-reason" className="min-w-0 flex-1 text-small text-ink-muted">
          {loading && !review
            ? "Loading the backend's checks…"
            : canIssue
              ? "Everything required has passed. You'll confirm once more before anything is sent."
              : blockedReasons.length
                ? `Can't issue: ${blockedReasons[0].detail || `${blockedReasons[0].label} — ${blockedReasons[0].status}.`}${blockedReasons.length > 1 ? ` (+${blockedReasons.length - 1} more above)` : ""}`
                : "Card issuance is not available for this customer."}
        </p>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => setStep("confirm")} disabled={!canIssue} disabledReason="Card issuance is blocked: see the checks above." reasonId="issuance-action-reason">
            Confirm card issuance
          </Button>
        </div>
      </div>
    ) : step === "confirm" ? (
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={() => setStep("review")}>
          Back
        </Button>
        <Button onClick={issue} disabled={!acknowledged} disabledReason="Tick the box to confirm you reviewed the details.">
          Confirm {sandbox ? "sandbox " : ""}card issuance
        </Button>
      </div>
    ) : (
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={issuing}>
          Close
        </Button>
      </div>
    );

  return (
    <Dialog
      open
      size="xl"
      // No closing while the request is being sent: the outcome must be shown.
      onClose={issuing ? () => {} : onClose}
      title={step === "confirm" ? `Confirm ${sandbox ? "sandbox " : ""}card issuance` : step === "progress" ? "Creating virtual card" : "Card issuance review"}
      description={`${name}${review?.customer?.maskedEmail ? ` · ${review.customer.maskedEmail}` : ""}`}
      footer={footer}
    >
      {loading && !review ? (
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading the card issuance review">
          <Skeleton className="h-10 w-2/3 rounded-control" />
          <Skeleton className="h-48 w-full rounded-control" />
          <Skeleton className="h-32 w-full rounded-control" />
        </div>
      ) : loadError && !review ? (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-control border border-line bg-surface-2 p-5">
          <p className="text-body font-semibold text-ink">Card issuance review unavailable</p>
          <p className="text-small text-ink-muted">{loadError} Nothing was sent to the card provider.</p>
          <Button variant="secondary" icon={RefreshCw} onClick={load}>
            Try loading again
          </Button>
        </div>
      ) : step === "confirm" ? (
        <ConfirmStep review={review} name={name} acknowledged={acknowledged} setAcknowledged={setAcknowledged} />
      ) : step === "progress" ? (
        <ProgressStep review={review} issuing={issuing} result={issueResult} />
      ) : (
        <ReviewStep review={review} />
      )}
    </Dialog>
  );
}

/* ------------------------------ review ------------------------------ */

function ReviewStep({ review: r }) {
  const overall = OVERALL[r.eligibility.overall] || OVERALL.unknown;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <EnvironmentBadge review={r} />
        <StatusPill tone={overall.tone}>{overall.label}</StatusPill>
        {r.customer.reference && <span className="text-caption text-ink-muted">Payment {r.customer.reference}</span>}
      </div>

      {r.conflicts.existingCard && (
        <Callout tone="danger" title="Card already exists">
          This customer already has an {r.conflicts.existingCard.status} virtual card ending in •••• {r.conflicts.existingCard.last4 || "—"}. A second card cannot be issued through this workflow.
        </Callout>
      )}
      {r.conflicts.unresolvedOperation && (
        <Callout tone="danger" title="Issuance requires reconciliation">
          A previous card request {r.conflicts.unresolvedOperation.state === "unknown" ? "has an unknown outcome" : "is still in progress"}
          {r.conflicts.unresolvedOperation.since ? ` (since ${formatDateTime(r.conflicts.unresolvedOperation.since)})` : ""}. Reconcile it before starting another
          issuance request — a new request is never sent while the earlier one is open.
        </Callout>
      )}
      {r.sandboxLimit?.exceeded && (
        <Callout tone="warning" title="Sandbox test limit">
          Requested initial card balance: {usd(r.sandboxLimit.requestedCents)}. Current approved sandbox test range: {usd(r.sandboxLimit.minCents)} to{" "}
          {usd(r.sandboxLimit.maxCents)}. This is a sandbox testing restriction ({r.sandboxLimit.source}), not the future production customer limit.
        </Callout>
      )}

      <Section icon={ShieldCheck} title="Card issuance eligibility">
        <ul className="divide-y divide-line" aria-label="Eligibility checks">
          {r.eligibility.checks.map((c) => {
            const v = CHECK_VIEW[c.status] || CHECK_VIEW.unknown;
            const Icon = v.icon;
            return (
              <li key={c.key} className="flex items-start gap-3 px-4 py-2.5">
                <Icon size={18} aria-hidden className={`mt-0.5 shrink-0 ${v.className}`} />
                <span className="min-w-0 flex-1">
                  <span className="block text-small text-ink">{c.label}</span>
                  {c.detail && <span className="block text-caption text-ink-muted">{c.detail}</span>}
                </span>
                <span className={`shrink-0 text-caption font-semibold ${v.className}`}>{v.text}</span>
              </li>
            );
          })}
        </ul>
        <p className="border-t border-line px-4 py-3 text-small font-semibold text-ink">
          Overall: <span className={r.eligibility.overall === "ready" ? "text-success" : r.eligibility.overall === "review" ? "text-warning" : "text-danger"}>{overall.label}</span>
        </p>
      </Section>

      <div className="grid gap-5 md:grid-cols-2">
        <Section icon={ShieldCheck} title="Customer verification">
          <Rows
            rows={[
              ["Arifcard identity verification", VERIFICATION_LABEL[r.verification.arifcardStatus] || r.verification.arifcardStatus],
              ["Document type", DOCUMENT_LABEL[r.verification.documentType] || r.verification.documentType || "—"],
              ["Bitnob Card KYC", PROVIDER_KYC_LABEL[r.verification.providerKycStatus] || r.verification.providerKycStatus],
              ["Consent", r.verification.consent === "recorded" ? "Recorded" : "Missing"],
              ["Provider customer mapping", r.verification.providerCustomerMapping === "available" ? "Available" : "Missing"],
            ]}
          />
        </Section>

        <Section icon={CreditCard} title="Card to be created" badge={<StatusPill tone="info" icon={null}>Preview — card not created yet</StatusPill>}>
          <Rows
            rows={[
              ["Provider", r.cardPreview.provider],
              ["Environment", r.environment ? r.environment[0].toUpperCase() + r.environment.slice(1) : "Not configured"],
              ["Card product", r.cardPreview.product],
              ["Card network", r.cardPreview.network],
              ["Currency", r.cardPreview.currency],
              ["Initial card balance", usd(r.cardPreview.initialBalanceUsdCents) || "USD allocation required"],
              ["Cardholder", r.cardPreview.cardholder || "Name not recorded"],
            ]}
          />
        </Section>
      </div>

      <Section icon={Receipt} title="Payment & pricing">
        {r.payment ? <PaymentRows payment={r.payment} allocation={r.allocation} /> : <p className="px-4 py-3 text-small text-ink-muted">No verified payment for a new card.</p>}
      </Section>

      <Section icon={Building2} title="Provider cost estimate" badge={<StatusPill tone="neutral" icon={null}>Admin only</StatusPill>}>
        <Rows
          rows={[
            ["Bitnob card-creation fee", r.providerCosts.estimateAvailable ? usd(r.providerCosts.creationFeeUsdCents) : "Provider cost not confirmed"],
            ["Initial funding fee", r.providerCosts.estimateAvailable ? usd(r.providerCosts.initialFundingFeeUsdCents) : "Provider cost not confirmed"],
            ["Expected provider-wallet requirement", usd(r.providerCosts.walletRequirementUsdCents) || "Provider cost not confirmed"],
            ["Fee source", r.providerCosts.source],
          ]}
        />
        <p className="border-t border-line px-4 py-2.5 text-caption text-ink-muted">Charged to the company's provider wallet. Separate from the Arifcard customer service fee.</p>
      </Section>

      {r.activity.length > 0 && (
        <Section icon={History} title="Activity">
          <ol className="flex flex-col gap-2 px-4 py-3">
            {r.activity.map((a) => (
              <li key={a.key} className="flex items-baseline justify-between gap-3 text-small">
                <span className="flex items-center gap-2 text-ink">
                  <CircleCheck size={14} aria-hidden className="shrink-0 text-success" />
                  {a.label}
                </span>
                <time dateTime={a.at} className="shrink-0 text-caption text-ink-muted">
                  {formatDateTime(a.at)}
                </time>
              </li>
            ))}
            {r.allowedAction === "ISSUE" && (
              <li className="flex items-center gap-2 text-small text-ink-muted">
                <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-neutral" />
                Awaiting admin issuance confirmation
              </li>
            )}
          </ol>
        </Section>
      )}
    </div>
  );
}

function PaymentRows({ payment: p, allocation }) {
  const q = p.pricing;
  const pct = q?.feePercentage != null ? ` (${q.feePercentage}%)` : "";
  const rows = [];
  if (q?.pricingModel === "deducted") {
    rows.push(["Customer total payment", etb(p.totalPaidEtbMinor)]);
    rows.push(["Exchange rate", q.etbPerUsd ? `1 USD = ${Number(q.etbPerUsd).toFixed(2)} ETB` : "—"]);
    rows.push(["Converted", usd(q.convertedUsdCents)]);
    rows.push([`Arifcard service fee${pct}`, q.serviceFeeUsdCents != null ? `− ${usd(q.serviceFeeUsdCents)}` : "—"]);
    if (q.cardCreationFeeUsdCents) rows.push(["Arifcard card creation fee", `− ${usd(q.cardCreationFeeUsdCents)}`]);
  } else if (q) {
    rows.push(["Base card funding amount", etb(q.baseEtbMinor)]);
    rows.push([`Arifcard service fee${pct}`, etb(q.serviceFeeEtbMinor)]);
    rows.push(["Customer total payment", etb(p.totalPaidEtbMinor)]);
  } else {
    rows.push(["Customer total payment", etb(p.totalPaidEtbMinor)]);
    rows.push(["Pricing", "Older payment without a price snapshot"]);
  }
  rows.push(["Payment status", "Verified"]);
  rows.push(["Payment method", p.method || "—"]);
  rows.push(["Payment reference", p.reference || "—"]);
  if (p.bankTransaction) rows.push(["Bank transaction", p.bankTransaction]);
  rows.push(["Payment verified at", formatDateTime(p.verifiedAt) || "—"]);
  if (q?.pricingPolicyVersion) rows.push(["Pricing policy", `${q.pricingPolicyVersion}${q.pricingModel === "deducted" ? " (fees deducted)" : ""}`]);
  return (
    <>
      <Rows rows={rows} />
      <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-2 px-4 py-3">
        <span className="text-small font-semibold text-ink">Approved initial card credit</span>
        <span className="text-body font-semibold tabular-nums text-ink">{usd(allocation.approvedUsdCents) || "USD allocation required"}</span>
      </div>
      {allocation.source === "configured" && <p className="px-4 py-2 text-caption text-warning">Older payment without a price: the configured sandbox amount is used.</p>}
    </>
  );
}

/* ------------------------------ confirm ------------------------------ */

function ConfirmStep({ review: r, name, acknowledged, setAcknowledged }) {
  return (
    <div className="flex flex-col gap-5">
      <EnvironmentBadge review={r} />
      <Rows
        bordered
        rows={[
          ["Customer", name],
          ["Provider", "Bitnob"],
          ["Environment", (r.environment || "not configured").toUpperCase()],
          ["Card", `${r.cardPreview.product} · ${r.cardPreview.network}`],
          ["Initial card balance", usd(r.cardPreview.initialBalanceUsdCents)],
        ]}
      />
      <p className="text-small text-ink">
        This creates <strong>one external provider operation</strong>. The backend re-checks everything first and sends a single request; it is never retried
        automatically.
      </p>
      <Checkbox
        id="issuance-acknowledge"
        checked={acknowledged}
        onChange={(checked) => setAcknowledged(Boolean(checked))}
        label="I reviewed the customer, payment and provider eligibility."
      />
    </div>
  );
}

/* ------------------------------ progress / result ------------------------------ */

function ProgressStep({ review: r, issuing, result }) {
  if (result?.error || result?.code === "SANDBOX_AMOUNT_LIMIT") {
    return (
      <Callout tone="danger" title={ISSUE_ERROR[result.code] || "Card issuance blocked"}>
        {result.message} Nothing was sent to the card provider.
        {result.problems?.length > 0 && (
          <ul className="mt-2 list-disc pl-5">
            {result.problems.map((p) => (
              <li key={p.code}>{p.message || p.code}</li>
            ))}
          </ul>
        )}
      </Callout>
    );
  }
  if (r?.card && result?.cardCreated) {
    return (
      <Callout tone="success" title="Card created successfully">
        {r.card.brand === "visa" ? "Visa" : r.card.brand} •••• {r.card.last4} · Status: {r.card.status === "active" ? "Active" : r.card.status}
        {r.card.balanceUsd != null ? ` · Balance: ${r.card.balanceUsd} USD` : ""}
        {r.card.activatedAt ? ` · Confirmed ${formatDateTime(r.card.activatedAt)}` : ""}. Confirmed by the card provider.
      </Callout>
    );
  }
  if (result && !result.cardCreated) {
    if (result.state === "unknown") {
      return (
        <Callout tone="danger" title="Issuance status unknown">
          The provider may have received the request, but the final outcome could not be confirmed. Do not create another card: reconciliation is required (the
          provider's signed event or a read settles it).
        </Callout>
      );
    }
    if (result.state === "failed") {
      return (
        <Callout tone="danger" title="The card provider refused the card">
          {result.providerMessage ? `Reason: ${result.providerMessage}. ` : ""}Nothing was created.
        </Callout>
      );
    }
    return (
      <Callout tone="danger" title={ISSUE_ERROR[result.code] || "Card issuance blocked"}>
        {result.blocked || "The request was stopped before anything was sent."} Nothing was created.
      </Callout>
    );
  }
  const unknownNow = r?.state === "unknown";
  const steps = [
    { label: "Eligibility confirmed by the backend", done: Boolean(result) || !issuing },
    { label: "Issuance operation recorded", done: Boolean(result?.cardCreated) },
    { label: "Request sent to the card provider", done: Boolean(result?.cardCreated) },
    { label: "Waiting for provider confirmation", done: Boolean(r?.card), current: Boolean(result?.cardCreated) && !r?.card },
  ];
  return (
    <div className="flex flex-col gap-4" aria-live="polite">
      <EnvironmentBadge review={r} />
      {unknownNow ? (
        <Callout tone="danger" title="Issuance status unknown">
          The outcome could not be confirmed. Do not create another card: reconciliation is required.
        </Callout>
      ) : (
        <ol className="flex flex-col gap-3 rounded-control border border-line p-4">
          {steps.map((s) => (
            <li key={s.label} className="flex items-center gap-3 text-small">
              {s.done ? (
                <CircleCheck size={18} aria-hidden className="shrink-0 text-success" />
              ) : s.current || issuing ? (
                <Loader2 size={18} aria-hidden className="shrink-0 animate-spin text-info motion-reduce:animate-none" />
              ) : (
                <span aria-hidden className="inline-block h-4 w-4 shrink-0 rounded-full border border-line-strong" />
              )}
              <span className={s.done ? "text-ink" : "text-ink-muted"}>
                {s.label}
                <span className="sr-only">{s.done ? " — done" : " — in progress"}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
      <p className="text-caption text-ink-muted">The card shows as active only after the card provider confirms it. You can close this; the queue keeps the status.</p>
    </div>
  );
}

/* ------------------------------ pieces ------------------------------ */

function EnvironmentBadge({ review: r }) {
  if (!r) return null;
  return r.environment === "sandbox" ? (
    <StatusPill tone="info">{r.environmentLabel}</StatusPill>
  ) : r.environment ? (
    <StatusPill tone="danger">{r.environmentLabel}</StatusPill>
  ) : (
    <StatusPill tone="neutral">Environment not configured</StatusPill>
  );
}

function Section({ icon: Icon, title, badge, children }) {
  return (
    <section className="overflow-hidden rounded-control border border-line bg-surface-1">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-2 px-4 py-2.5">
        <h3 className="flex items-center gap-2 text-body font-semibold text-ink">
          <Icon size={15} aria-hidden className="shrink-0 text-ink-muted" />
          {title}
        </h3>
        {badge}
      </header>
      {children}
    </section>
  );
}

function Rows({ rows, bordered = false }) {
  return (
    <dl className={`divide-y divide-line ${bordered ? "rounded-control border border-line" : ""}`}>
      {rows.map(([label, value]) => (
        <div key={label} className="flex flex-col gap-0.5 px-4 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <dt className="text-small text-ink-muted">{label}</dt>
          <dd className="min-w-0 break-words text-small font-medium tabular-nums text-ink sm:text-right">{value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

function Callout({ tone, title, children }) {
  const style = { danger: "border-danger bg-danger-tint", warning: "border-warning bg-warning-tint", success: "border-success bg-success-tint" }[tone] || "border-line bg-surface-2";
  const Icon = tone === "success" ? CircleCheck : TriangleAlert;
  const iconClass = { danger: "text-danger", warning: "text-warning", success: "text-success" }[tone] || "text-ink-muted";
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={`flex gap-3 rounded-control border p-4 ${style}`}>
      <Icon size={20} aria-hidden className={`mt-0.5 shrink-0 ${iconClass}`} />
      <div className="min-w-0 text-small text-ink">
        <p className="font-semibold">{title}</p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}
