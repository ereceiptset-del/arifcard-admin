import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { Button, Dialog, TextInput, SelectInput, TextArea, Badge, Panel } from "@addiscard/ui";
import {
  paymentService,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_TONE,
  RETRYABLE_REASONS,
  birr,
  ApiError,
} from "@addiscard/services";

/**
 * Paying by receipt token.
 *
 * Three steps, in the order they actually happen: say what you are about
 * to pay, pay it (with every detail shown read-only so nothing is left to
 * guess), then tell us what you paid and give us the receipt token.
 *
 * The browser decides nothing. It sends the customer's account of the
 * payment and the token — only the token, never a link — and shows
 * whatever the server concluded.
 */

const STEP = { AMOUNT: "amount", PAY: "pay", RESULT: "result" };

const METHOD_LABEL = {
  [PAYMENT_METHOD.CBE]: "Commercial Bank of Ethiopia",
  [PAYMENT_METHOD.TELEBIRR]: "Telebirr",
};

/** Where the customer finds the token, and what it looks like. */
const TOKEN_HELP = {
  [PAYMENT_METHOD.CBE]: {
    label: "CBE receipt code",
    placeholder: "v2-…",
    hint: "The code at the end of your CBE receipt link, starting with v2-. Copy it exactly: capital letters matter. Paste only the code, not the whole link.",
  },
  [PAYMENT_METHOD.TELEBIRR]: {
    label: "Telebirr transaction number",
    placeholder: "Transaction number",
    hint: "The transaction number in your Telebirr confirmation message. Enter only the number, not a link.",
  },
};

function messageFor(err) {
  return err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
}

/** "YYYY-MM-DDTHH:MM" in the browser's own time, for datetime-local. */
function localInputValue(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const when = (iso) => (iso ? new Date(iso).toLocaleString() : "—");

function Row({ label, children, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <span className="shrink-0 text-slate-500 dark:text-slate-400">{label}</span>
      <span className={`text-right ${mono ? "font-mono text-xs break-all" : ""}`}>{children}</span>
    </div>
  );
}

const EMPTY_FORM = {
  payerName: "",
  payerPhone: "",
  payerAccount: "",
  claimedAmountBirr: "",
  claimedPaidAt: "",
  message: "",
  token: "",
};

export function PaymentDialog({ open, onClose, onCompleted, resumeIntent = null }) {
  const [step, setStep] = useState(STEP.AMOUNT);
  const [methods, setMethods] = useState(null);
  const [method, setMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [intent, setIntent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [claim, setClaim] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    setStep(resumeIntent ? STEP.PAY : STEP.AMOUNT);
    setIntent(resumeIntent);
    setClaim(null);
    setForm({ ...EMPTY_FORM, claimedPaidAt: localInputValue() });
    setAmount("");
    setError("");

    paymentService
      .methods()
      .then((data) => {
        if (cancelled) return;
        const list = data.methods || [];
        setMethods(list);
        // Only an available method is preselected. Offering one that is
        // not configured just moves the failure one click later.
        setMethod(list.find((m) => m.available)?.method || "");
      })
      .catch((err) => !cancelled && setError(messageFor(err)));

    return () => {
      cancelled = true;
    };
  }, [open, resumeIntent]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  async function createIntent(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { intent: created } = await paymentService.createIntent({ method, amountBirr: amount });
      setIntent(created);
      setStep(STEP.PAY);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  async function refreshIntent(id) {
    try {
      const { intent: fresh } = await paymentService.getIntent(id);
      setIntent(fresh);
    } catch {
      // The claim result is already on screen; a stale summary is not worth an error.
    }
  }

  async function submitClaim(event) {
    event.preventDefault();
    setError("");

    const token = form.token.trim();
    // The server refuses links too; saying so here saves a round trip.
    if (/[/:?#\s]/.test(token)) {
      setError("Enter only the receipt code, not the link.");
      return;
    }

    setBusy(true);
    try {
      const { claim: checked } = await paymentService.submitClaim(intent.id, {
        payerName: form.payerName.trim(),
        payerPhone: form.payerPhone.trim(),
        payerAccount: form.payerAccount.trim(),
        claimedAmountBirr: form.claimedAmountBirr.trim(),
        // The browser knows its own time zone; the server gets UTC.
        claimedPaidAt: new Date(form.claimedPaidAt).toISOString(),
        message: form.message.trim(),
        token,
      });
      setClaim(checked);
      setStep(STEP.RESULT);
      await refreshIntent(intent.id);
      if (checked.status === PAYMENT_STATUS.VERIFIED) onCompleted?.(checked);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  async function recheck() {
    setBusy(true);
    setError("");
    try {
      const { claim: rechecked } = await paymentService.recheckClaim(claim.id);
      setClaim(rechecked);
      await refreshIntent(intent.id);
      if (rechecked.status === PAYMENT_STATUS.VERIFIED) onCompleted?.(rechecked);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  function submitAnother() {
    setClaim(null);
    setForm((prev) => ({ ...prev, token: "" }));
    setStep(STEP.PAY);
  }

  const available = (methods || []).filter((m) => m.available);
  const unavailable = (methods || []).filter((m) => !m.available);
  const isTelebirr = intent?.method === PAYMENT_METHOD.TELEBIRR;
  const tokenHelp = TOKEN_HELP[intent?.method] || TOKEN_HELP[PAYMENT_METHOD.CBE];

  const formReady =
    form.payerName.trim().length >= 2 &&
    form.claimedAmountBirr.trim() &&
    form.claimedPaidAt &&
    (isTelebirr ? form.payerPhone.trim() : form.payerAccount.trim()) &&
    form.token.trim().length >= 6;

  return (
    <Dialog open={open} onClose={onClose} title="Add money" size="lg">
      {error ? (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      ) : null}

      {step === STEP.AMOUNT ? (
        <form onSubmit={createIntent} className="space-y-4">
          <SelectInput
            id="pay-method"
            label="Pay with"
            required
            placeholder="Choose a method"
            value={method}
            onChange={(event) => setMethod(event.target.value)}
            options={available.map((entry) => ({
              value: entry.method,
              label: METHOD_LABEL[entry.method] || entry.label,
            }))}
            // Named rather than hidden, in the server's own words: a
            // customer expecting Telebirr is told it is not configured,
            // not left wondering whether they missed it.
            hint={unavailable.length > 0 ? unavailable.map((entry) => entry.unavailableReason).filter(Boolean).join(" ") : undefined}
          />

          <TextInput
            id="pay-amount"
            label="Amount in birr"
            required
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            hint="Enter exactly what you will pay. The receipt has to match it to the cent."
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !method || !amount}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Continue
            </Button>
          </div>
        </form>
      ) : null}

      {step === STEP.PAY && intent ? (
        <form onSubmit={submitClaim} className="space-y-5">
          {/* Everything about the payment, read-only, from the server. */}
          <Panel className="text-sm">
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">Payment</p>
            <Row label="Payment ID" mono>{intent.reference}</Row>
            <Row label="Purpose">{intent.purposeLabel}</Row>
            <Row label="Provider">{METHOD_LABEL[intent.method] || intent.methodLabel}</Row>
            <Row label="Amount to pay">
              <span className="font-semibold">{birr(intent.amountMinor)}</span>
            </Row>
            <Row label="Currency">{intent.currency}</Row>
            <Row label="Created">{when(intent.createdAt)}</Row>
            <Row label="Pay by">{when(intent.expiresAt)}</Row>
          </Panel>

          {intent.receiver ? (
            <Panel className="text-sm">
              <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">Pay to</p>
              {intent.receiver.name ? <Row label={isTelebirr ? "Receiver name" : "Account name"}>{intent.receiver.name}</Row> : null}
              <Row label={isTelebirr ? "Telebirr number" : "Account number"} mono>{intent.receiver.account}</Row>
            </Panel>
          ) : null}

          {/* The one instruction that decides whether we can verify
              automatically: our reference in the transfer's reason field
              is what proves the payment belongs to this order. */}
          <div className="rounded-lg border border-brand/30 bg-brand/5 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200">
            Pay exactly <strong>{birr(intent.amountMinor)}</strong> to the account above, and write{" "}
            <strong className="font-mono">{intent.reference}</strong> in the transfer&apos;s reason or remark
            field. Without it, a person has to check your payment by hand, which takes longer.
          </div>

          {intent.lastClaim?.customerMessage ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              <strong>Message from our team:</strong> {intent.lastClaim.customerMessage}
            </p>
          ) : null}

          <div className="space-y-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">After you have paid</p>

            <TextInput
              id="pay-payer-name"
              label="Your full name, as on the payment"
              required
              autoComplete="name"
              value={form.payerName}
              onChange={set("payerName")}
            />

            {isTelebirr ? (
              <TextInput
                id="pay-payer-phone"
                label="Telebirr number you paid from"
                required
                inputMode="tel"
                autoComplete="tel"
                placeholder="09…"
                value={form.payerPhone}
                onChange={set("payerPhone")}
              />
            ) : (
              <TextInput
                id="pay-payer-account"
                label="CBE account number you paid from"
                required
                inputMode="numeric"
                value={form.payerAccount}
                onChange={set("payerAccount")}
              />
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                id="pay-claimed-amount"
                label="Amount you paid (birr)"
                required
                inputMode="decimal"
                placeholder={(intent.amountMinor / 100).toFixed(2)}
                value={form.claimedAmountBirr}
                onChange={set("claimedAmountBirr")}
              />
              <TextInput
                id="pay-claimed-at"
                label="When you paid"
                required
                type="datetime-local"
                max={localInputValue()}
                value={form.claimedPaidAt}
                onChange={set("claimedPaidAt")}
              />
            </div>

            <TextArea
              id="pay-message"
              label="Confirmation message (optional)"
              rows={3}
              maxLength={1000}
              placeholder="You can paste the SMS or confirmation text here."
              value={form.message}
              onChange={set("message")}
              hint="Helps our team if your payment needs a person to check it. It is not used to verify the payment."
            />

            {/* Last, as the brief asks: the one field that identifies the receipt. */}
            <TextInput
              id="pay-token"
              label={tokenHelp.label}
              required
              value={form.token}
              onChange={set("token")}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder={tokenHelp.placeholder}
              hint={tokenHelp.hint}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" disabled={busy || !formReady}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit for verification
            </Button>
          </div>
        </form>
      ) : null}

      {step === STEP.RESULT && claim ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {claim.status === PAYMENT_STATUS.VERIFIED ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            ) : claim.status === PAYMENT_STATUS.REJECTED_EVIDENCE ? (
              <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden="true" />
            ) : (
              <Clock className="h-5 w-5 text-sky-600" aria-hidden="true" />
            )}
            <Badge tone={PAYMENT_STATUS_TONE[claim.status]}>{PAYMENT_STATUS_LABEL[claim.status] || claim.status}</Badge>
          </div>

          {claim.message ? <p className="text-sm text-slate-700 dark:text-slate-200">{claim.message}</p> : null}

          <Panel className="text-sm">
            <Row label="Provider">{METHOD_LABEL[claim.method] || claim.method}</Row>
            <Row label="Payment ID" mono>{intent?.reference}</Row>
            <Row label="Expected amount">{birr(intent?.amountMinor)}</Row>
            <Row label="Amount you entered">{claim.claimedAmountMinor != null ? birr(claim.claimedAmountMinor) : "—"}</Row>
            <Row label="Verified amount">{claim.verifiedAmountMinor != null ? birr(claim.verifiedAmountMinor) : "—"}</Row>
            <Row label="Receipt" mono>{claim.tokenHint || "—"}</Row>
            <Row label="Submitted">{when(claim.submittedAt)}</Row>
            <Row label="Decided">{when(claim.decidedAt)}</Row>
          </Panel>

          {intent?.nextAction ? (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              <strong>Next:</strong> {intent.nextAction}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            {claim.status === PAYMENT_STATUS.VERIFYING && RETRYABLE_REASONS.includes(claim.reasonCode) ? (
              <Button type="button" variant="ghost" onClick={recheck} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Check again
              </Button>
            ) : null}
            {intent?.canSubmitReceipt ? (
              <Button type="button" variant="ghost" onClick={submitAnother} disabled={busy}>
                Submit a different receipt
              </Button>
            ) : null}
            <Button type="button" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}
