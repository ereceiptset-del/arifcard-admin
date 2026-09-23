import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button, Dialog, TextInput, SelectInput, Badge, Panel } from "@addiscard/ui";
import {
  paymentService,
  PAYMENT_METHOD,
  CLAIM_STATUS,
  CLAIM_STATUS_LABEL,
  CLAIM_STATUS_TONE,
  RETRYABLE,
  birr,
  ApiError,
} from "@addiscard/services";

/**
 * Paying by receipt token.
 *
 * Three steps, in the order they actually happen: say what you are about
 * to pay, go and pay it, then bring back the receipt number.
 *
 * The wording throughout avoids implying that a matched receipt has
 * credited anything. It has not — verification and allocation are
 * separate, and only the first is built. Telling someone their money had
 * arrived when it had not would be the single worst thing this screen
 * could do.
 */

const STEP = { AMOUNT: "amount", PAY: "pay", RESULT: "result" };

const METHOD_LABEL = {
  [PAYMENT_METHOD.CBE]: "Commercial Bank of Ethiopia",
  [PAYMENT_METHOD.TELEBIRR]: "Telebirr",
};

/** Where the customer finds the number we are asking for. */
const TOKEN_HINT = {
  [PAYMENT_METHOD.CBE]: "The receipt number from your CBE transfer confirmation.",
  [PAYMENT_METHOD.TELEBIRR]: "The receipt number from your Telebirr confirmation message.",
};

export function PaymentDialog({ open, onClose, onCompleted }) {
  const [step, setStep] = useState(STEP.AMOUNT);
  const [methods, setMethods] = useState(null);
  const [method, setMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [intent, setIntent] = useState(null);
  const [token, setToken] = useState("");
  const [claim, setClaim] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    setStep(STEP.AMOUNT);
    setIntent(null);
    setClaim(null);
    setToken("");
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
  }, [open]);

  const messageFor = (err) =>
    err instanceof ApiError ? err.message : "Something went wrong. Please try again.";

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

  async function submitToken(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { claim: checked } = await paymentService.submitClaim(intent.id, token.trim());
      setClaim(checked);
      setStep(STEP.RESULT);
      if (checked.status === CLAIM_STATUS.VERIFIED) onCompleted?.(checked);
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
      if (rechecked.status === CLAIM_STATUS.VERIFIED) onCompleted?.(rechecked);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  const available = (methods || []).filter((m) => m.available);
  const unavailable = (methods || []).filter((m) => !m.available);

  return (
    <Dialog open={open} onClose={onClose} title="Add money">
      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
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
            // Named rather than hidden: a customer who expects to see
            // their bank should be told it is not ready, not left
            // wondering whether they missed it.
            hint={
              unavailable.length > 0
                ? `Not available yet: ${unavailable
                    .map((entry) => METHOD_LABEL[entry.method] || entry.label)
                    .join(", ")}`
                : undefined
            }
          />

          <TextInput
            id="pay-amount"
            label="Amount in birr"
            required
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            hint="Enter exactly what you will pay. The receipt has to match it."
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

      {step === STEP.PAY ? (
        <form onSubmit={submitToken} className="space-y-4">
          <Panel className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Amount</span>
              <span className="font-semibold">{birr(intent.amountMinor)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Method</span>
              <span>{METHOD_LABEL[intent.method] || intent.method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Your reference</span>
              <span className="font-mono text-xs">{intent.reference}</span>
            </div>
          </Panel>

          {/* Deliberately explicit that we cannot see the payment
              ourselves. Arifcard has no merchant access to either
              provider, and implying otherwise would set up a wait for
              something that is never going to happen on its own. */}
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Pay {birr(intent.amountMinor)} using {METHOD_LABEL[intent.method] || intent.method}, then enter the
            receipt number below. We cannot see your payment until you give us the number.
          </p>

          <TextInput
            id="pay-token"
            label="Receipt number"
            required
            value={token}
            onChange={(event) => setToken(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            hint={TOKEN_HINT[intent.method]}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" disabled={busy || token.trim().length < 6}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Check receipt
            </Button>
          </div>
        </form>
      ) : null}

      {step === STEP.RESULT && claim ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {claim.status === CLAIM_STATUS.VERIFIED ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            )}
            <Badge tone={CLAIM_STATUS_TONE[claim.status]}>{CLAIM_STATUS_LABEL[claim.status]}</Badge>
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-200">{claim.message}</p>

          {claim.observed ? (
            <Panel className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Receipt amount</span>
                <span className="font-semibold">
                  {claim.observed.amountBirr} {claim.observed.currency}
                </span>
              </div>
              {claim.observed.payeeName ? (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Paid to</span>
                  <span>{claim.observed.payeeName}</span>
                </div>
              ) : null}
              {claim.observed.paidAt ? (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Paid at</span>
                  <span>{new Date(claim.observed.paidAt).toLocaleString()}</span>
                </div>
              ) : null}
            </Panel>
          ) : null}

          {claim.status === CLAIM_STATUS.VERIFIED ? (
            // Says precisely what has happened. The receipt checked out;
            // the money has not been added to anything, because nothing
            // in this system adds money yet.
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              We have matched your receipt and recorded it. Funding your card is a separate step and is not
              available yet — we will not take another payment for this receipt.
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            {RETRYABLE.includes(claim.status) ? (
              <>
                <Button type="button" variant="ghost" onClick={recheck} disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Check again
                </Button>
                <Button type="button" variant="ghost" onClick={() => setStep(STEP.PAY)} disabled={busy}>
                  Edit number
                </Button>
              </>
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
