import { useState } from "react";
import { ShieldAlert, Lock, LockOpen } from "lucide-react";
import { Button, Dialog, TextArea, TextInput, SelectInput, useToast, formatDateTime } from "@addiscard/ui";
import { ApiError } from "@addiscard/services";
import {
  customerAccessApi,
  HARD_SUSPEND_PHRASE,
  LIFT_SUSPENSION_PHRASE,
  HARD_SUSPENSION_REASONS,
  HARD_SUSPENSION_REASON_LABEL,
} from "../../data/customerAccess.js";

/**
 * Security actions — the owner's emergency controls, kept apart from the
 * everyday disable/re-enable and from the deletion danger zone.
 *
 *   Hard suspend         — Firebase sign-in disabled, every session
 *                          revoked, every service blocked. For suspected
 *                          compromise, severe fraud, a legal hold.
 *   Lift hard suspension — back to ACTIVE or TEMPORARILY_DISABLED, after
 *                          review; a fresh sign-in is required.
 *
 * Owner only, password re-entered, a phrase typed, the version the screen
 * showed sent along. The backend re-checks all of it; nothing here is
 * security, it is explanation and friction.
 */
const MIN_REASON = 10;
const errorText = (e, fallback) => (e instanceof ApiError ? e.message : fallback);

export default function SecurityActions({ uid, summary, account, isOwner, onDone }) {
  const [dialog, setDialog] = useState(null);
  const suspended = account.accountStatus === "HARD_SUSPENDED";
  const ownerOnly = "Only the account owner can take security actions.";

  return (
    <section aria-labelledby="security-heading" className="rounded-control border border-line-strong p-4">
      <h3 id="security-heading" className="text-h3 text-ink">
        Security actions
      </h3>
      <p className="mt-1 text-small text-ink-soft">
        For suspected compromise, severe fraud or a legal hold. Use temporary disable for everyday restrictions.
      </p>
      {suspended && (
        <dl className="mt-3 divide-y divide-line rounded-control border border-line">
          <Row label="Suspended" value={account.suspendedAt ? `${formatDateTime(account.suspendedAt)}${account.suspendedBy ? ` by ${account.suspendedBy}` : ""}` : "Not recorded"} />
          <Row label="Reason (staff only)" value={HARD_SUSPENSION_REASON_LABEL[account.suspensionReasonCode] || account.suspensionReasonCode || "Not recorded"} />
          {account.suspensionReason && <Row label="Details (staff only)" value={account.suspensionReason} />}
        </dl>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {account.actions?.hardSuspend && (
          <Button variant="danger" icon={Lock} disabled={!isOwner} disabledReason={ownerOnly} onClick={() => setDialog("suspend")}>
            Hard Suspend Account
          </Button>
        )}
        {account.actions?.liftSuspension && (
          <Button variant="secondary" icon={LockOpen} disabled={!isOwner} disabledReason={ownerOnly} onClick={() => setDialog("lift")}>
            Lift Hard Suspension
          </Button>
        )}
        {!account.actions?.hardSuspend && !account.actions?.liftSuspension && <p className="text-small text-ink-muted">No security action applies in this state.</p>}
      </div>
      {dialog === "suspend" && <SuspendDialog uid={uid} summary={summary} expectedVersion={account.version} onClose={() => setDialog(null)} onDone={onDone} />}
      {dialog === "lift" && <LiftDialog uid={uid} summary={summary} expectedVersion={account.version} onClose={() => setDialog(null)} onDone={onDone} />}
    </section>
  );
}

function useSubmit(onDone, onClose) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);
  const submit = async (call, success) => {
    setBusy(true);
    setProblem(null);
    try {
      const result = await call();
      toast.success(success(result));
      onDone(result);
      onClose();
    } catch (e) {
      const stale = e instanceof ApiError && ["STALE_ACCOUNT_STATE", "INVALID_ACCOUNT_STATE"].includes(e.code);
      setProblem(stale ? "This account changed since you opened it. Close this dialog to see its current state." : errorText(e, "That didn't go through. Nothing was changed; try again."));
      if (stale) onDone();
    } finally {
      setBusy(false);
    }
  };
  return { busy, problem, submit };
}

function SuspendDialog({ uid, summary, expectedVersion, onClose, onDone }) {
  const [reasonCode, setReasonCode] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [password, setPassword] = useState("");
  const [typed, setTyped] = useState("");
  const { busy, problem, submit } = useSubmit(onDone, onClose);
  const ready = reasonCode && reason.trim().length >= MIN_REASON && password && typed === HARD_SUSPEND_PHRASE;

  return (
    <Dialog
      open
      size="lg"
      onClose={busy ? () => {} : onClose}
      title="Hard suspend customer"
      description={summary}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={busy}
            disabled={!ready}
            disabledReason="Choose a reason, explain it, enter your password and type the phrase."
            onClick={() =>
              submit(
                () => customerAccessApi.hardSuspend(uid, { reasonCode, reason: reason.trim(), note: note.trim() || undefined, password, confirm: typed, expectedVersion }),
                (r) => (r?.authDisabled === false ? "Suspended. Disabling sign-in didn't complete; access is still refused on every request." : "Account hard-suspended. Sign-in is disabled and sessions were revoked.")
              )
            }
          >
            Hard Suspend Account
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-small font-medium text-ink">This security action will</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-small text-ink-soft">
              <li>disable Firebase Authentication access;</li>
              <li>revoke active sessions;</li>
              <li>block all Arifcard customer services;</li>
              <li>prevent the customer from entering the restricted dashboard;</li>
              <li>preserve financial, card, provider and audit history.</li>
            </ul>
          </div>
          <div>
            <p className="text-small font-medium text-ink">This action will not</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-small text-ink-soft">
              <li>reverse payments;</li>
              <li>close cards automatically;</li>
              <li>reverse transactions;</li>
              <li>cancel provider operations;</li>
              <li>delete customer data.</li>
            </ul>
          </div>
        </div>
        <p className="text-caption text-ink-muted">At sign-in the customer sees only “Invalid email or password”; the reason is never shown to them.</p>
        <SelectInput label="Reason" required value={reasonCode} onChange={(e) => setReasonCode(e.target.value)} options={HARD_SUSPENSION_REASONS} placeholder="Choose a reason" />
        <TextArea label="Details" required rows={3} value={reason} onChange={(e) => setReason(e.target.value)} hint={`At least ${MIN_REASON} characters. Staff only, kept in the audit log.`} maxLength={500} />
        <TextArea label="Internal note (optional)" rows={2} value={note} onChange={(e) => setNote(e.target.value)} hint="Staff only." maxLength={1000} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Your password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} hint="Confirms it's you; checked by the server." />
          <TextInput label={`Type "${HARD_SUSPEND_PHRASE}"`} required value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} hint="Exactly as shown, in capitals." />
        </div>
        <Problem text={problem} />
      </div>
    </Dialog>
  );
}

function LiftDialog({ uid, summary, expectedVersion, onClose, onDone }) {
  const [targetStatus, setTargetStatus] = useState("");
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [typed, setTyped] = useState("");
  const { busy, problem, submit } = useSubmit(onDone, onClose);
  const ready = targetStatus && reason.trim().length >= MIN_REASON && password && typed === LIFT_SUSPENSION_PHRASE;

  return (
    <Dialog
      open
      size="md"
      onClose={busy ? () => {} : onClose}
      title="Lift hard suspension"
      description={summary}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={busy}
            disabled={!ready}
            disabledReason="Choose the state, explain it, enter your password and type the phrase."
            onClick={() =>
              submit(
                () => customerAccessApi.liftSuspension(uid, { targetStatus, reason: reason.trim(), password, confirm: typed, expectedVersion }),
                () => (targetStatus === "ACTIVE" ? "Suspension lifted. The customer can sign in again." : "Suspension lifted to temporarily disabled.")
              )
            }
          >
            Lift Hard Suspension
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ul className="list-disc space-y-1 pl-5 text-small text-ink-soft">
          <li>Sign-in is re-enabled and every old session ends: the customer signs in afresh.</li>
          <li>Nothing is re-run: no KYC re-approval, no payment re-verification, no card or provider action, no balance change.</li>
          <li>Refused if a deletion operation exists for this customer.</li>
        </ul>
        <SelectInput
          label="Return the account to"
          required
          value={targetStatus}
          onChange={(e) => setTargetStatus(e.target.value)}
          options={[
            { value: "ACTIVE", label: "Active — full access" },
            { value: "TEMPORARILY_DISABLED", label: "Temporarily disabled — restricted page only" },
          ]}
          placeholder="Choose after review"
        />
        <TextArea label="Reason" required rows={3} value={reason} onChange={(e) => setReason(e.target.value)} hint={`At least ${MIN_REASON} characters. Staff only, kept in the audit log.`} maxLength={500} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Your password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} hint="Confirms it's you; checked by the server." />
          <TextInput label={`Type "${LIFT_SUSPENSION_PHRASE}"`} required value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} hint="Exactly as shown, in capitals." />
        </div>
        <Problem text={problem} />
      </div>
    </Dialog>
  );
}

function Problem({ text }) {
  if (!text) return null;
  return (
    <p role="alert" className="flex gap-2 rounded-control border border-danger bg-danger-tint px-3 py-2 text-small text-danger">
      <ShieldAlert size={16} aria-hidden className="mt-0.5 shrink-0" />
      {text}
    </p>
  );
}

function Row({ label, value }) {
  return (
    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-4 px-4 py-2.5">
      <dt className="text-small text-ink-muted">{label}</dt>
      <dd className="min-w-0 break-words text-right text-small text-ink">{value}</dd>
    </div>
  );
}
