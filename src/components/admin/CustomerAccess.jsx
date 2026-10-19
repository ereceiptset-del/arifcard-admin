import { useCallback, useRef, useState } from "react";
import { ShieldAlert, ShieldCheck, ShieldOff, Info } from "lucide-react";
import { Button, Dialog, TextArea, StatusPill, Skeleton, ErrorState, useToast, formatDateTime } from "@addiscard/ui";
import { ApiError } from "@addiscard/services";
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../hooks/useAsync.js";
import { customerAccessApi, ACCOUNT_STATUS_LABEL, ACCOUNT_STATUS_TONE } from "../../data/customerAccess.js";
import SecurityActions from "./SecurityActions.jsx";
import DeletionPanel from "./DeletionPanel.jsx";

/**
 * User management for one customer: whether they can use Arifcard, and
 * the two administrator actions that change it.
 *
 *   Temporarily disable — reversible; sessions are revoked; payments,
 *                         cards, KYC and provider records stay exactly as
 *                         they are. The customer sees a generic message,
 *                         never the reason.
 *   Re-enable           — restores access only; re-runs nothing.
 *
 * Security actions (hard suspension and lifting it) are the owner's, in
 * their own section (SecurityActions.jsx).
 *
 * Permanent deletion lives in its own danger zone (DeletionPanel.jsx):
 * requests and an eligibility preview everywhere; the staged purge is
 * offered only where the server says it can start (an approved retention
 * policy and execution enabled — the local emulators only today). The
 * backend re-checks role, state and version on every call; these dialogs
 * are explanation, not security.
 */

const MIN_REASON = 10;
const errorText = (e, fallback) => (e instanceof ApiError ? e.message : fallback);

const AUTH_LABEL = { available: "Can sign in", disabled: "Disabled in Firebase Authentication", "awaiting email verification": "Email not confirmed yet", deleted: "Sign-in account deleted" };

export default function CustomerAccess({ uid, summary, onChanged }) {
  const { user } = useAuth();
  const isAdmin = Boolean(user?.isOwner) || ["owner", "admin"].includes(user?.staffRole);
  const isOwner = Boolean(user?.isOwner);
  const load = useCallback(() => customerAccessApi.account(uid), [uid]);
  const { data, error, loading, reload, setData } = useAsync(load, [uid]);
  const account = data?.account;
  const [dialog, setDialog] = useState(null);
  const headingRef = useRef(null);

  // The server answers a change with the account as it now is; a refused
  // (stale) change re-reads it. Either way focus lands on this section,
  // since the button that opened the dialog is replaced by its opposite.
  const done = (result) => {
    if (result?.account) setData({ account: result.account });
    else reload();
    onChanged?.(result?.account || null);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  if (loading && !account) return <Skeleton className="h-56 w-full rounded-panel" />;
  if (error && !account) return <ErrorState title="We couldn't load account access" error={error} onRetry={reload} />;
  if (!account) return null;

  const restricted = account.arifcardAccess !== "active";
  const adminOnly = "Only an administrator can change account access.";

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="access-heading" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 id="access-heading" ref={headingRef} tabIndex={-1} className="text-h3 text-ink focus:outline-none">
            Account access
          </h3>
          <StatusPill tone={ACCOUNT_STATUS_TONE[account.accountStatus] || "attention"}>{ACCOUNT_STATUS_LABEL[account.accountStatus] || "Unrecognised status"}</StatusPill>
        </div>
        <dl className="divide-y divide-line rounded-control border border-line">
          <Row label="Arifcard access" value={restricted ? "Restricted — customer services are blocked" : "Active"} />
          <Row label="Sign-in (Firebase Authentication)" value={AUTH_LABEL[account.firebaseAuth] || account.firebaseAuth} />
          <Row label="Last signed in" value={account.lastSignInAt ? formatDateTime(account.lastSignInAt) : "Not recorded"} />
          <Row label="Created" value={account.createdAt ? formatDateTime(account.createdAt) : "Not recorded"} />
          {account.disabledAt && <Row label="Last disabled" value={`${formatDateTime(account.disabledAt)}${account.disabledBy ? ` by ${account.disabledBy}` : ""}`} />}
          {account.accountStatus === "TEMPORARILY_DISABLED" && account.disabledReason && <Row label="Internal reason" value={account.disabledReason} />}
          {account.enabledAt && <Row label="Last re-enabled" value={`${formatDateTime(account.enabledAt)}${account.enabledBy ? ` by ${account.enabledBy}` : ""}`} />}
        </dl>
        {account.accountStatus === "TEMPORARILY_DISABLED" && (
          <p className="flex gap-2 text-caption text-ink-muted">
            <Info size={14} aria-hidden className="mt-0.5 shrink-0" />
            The internal reason is for staff only. The customer sees a general message asking them to contact support.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {account.actions?.disable && (
            <Button variant="secondary" icon={ShieldOff} disabled={!isAdmin} disabledReason={adminOnly} onClick={() => setDialog("disable")}>
              Temporarily disable account
            </Button>
          )}
          {account.actions?.enable && (
            <Button variant="primary" icon={ShieldCheck} disabled={!isAdmin} disabledReason={adminOnly} onClick={() => setDialog("enable")}>
              Re-enable account
            </Button>
          )}
          {!account.actions?.disable && !account.actions?.enable && (
            <p className="text-small text-ink-muted">No access change is available in this state.</p>
          )}
        </div>
      </section>

      <SecurityActions uid={uid} summary={summary} account={account} isOwner={isOwner} onDone={done} />

      <DeletionPanel uid={uid} summary={summary} account={account} isAdmin={isAdmin} isOwner={isOwner} onDone={done} />

      {dialog && (
        <AccessDialog kind={dialog} uid={uid} summary={summary} expectedVersion={account.version} onClose={() => setDialog(null)} onDone={done} />
      )}
    </div>
  );
}

const COPY = {
  disable: {
    title: "Temporarily disable account",
    action: "Disable account",
    variant: "danger",
    effects: [
      "The customer is signed out everywhere and cannot use Arifcard services: cards, payments, top-ups, verification and settings.",
      "They can still sign in to see that the account is disabled, contact support and sign out.",
      "Payments, cards, card balances, KYC and provider records are not changed, cancelled or refunded.",
      "Nothing is sent to the card provider, and no email is sent.",
      "It can be re-enabled at any time. The action and your reason are kept in the audit log.",
    ],
    success: "Account temporarily disabled. The customer's sessions were signed out.",
  },
  enable: {
    title: "Re-enable account",
    action: "Re-enable account",
    variant: "primary",
    effects: [
      "The customer can use Arifcard services again from their next request.",
      "Nothing is re-run: no re-verification, no card action, no payment change and no email.",
      "KYC, payments and cards are exactly as they were. The action and your reason are kept in the audit log.",
    ],
    success: "Account re-enabled.",
  },
};

function AccessDialog({ kind, uid, summary, expectedVersion, onClose, onDone }) {
  const toast = useToast();
  const copy = COPY[kind];
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);
  const trimmed = reason.trim();

  const submit = async () => {
    setBusy(true);
    setProblem(null);
    try {
      const result = await customerAccessApi[kind](uid, { reason: trimmed, note: note.trim(), expectedVersion });
      toast.success(kind === "disable" && result?.sessionsRevoked === false ? "Account disabled. Signing out existing sessions didn't complete; access is still blocked on every request." : copy.success);
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

  return (
    <Dialog
      open
      size="md"
      onClose={busy ? () => {} : onClose}
      title={copy.title}
      description={summary}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant={copy.variant} loading={busy} disabled={trimmed.length < MIN_REASON} disabledReason={`Give a reason of at least ${MIN_REASON} characters.`} onClick={submit}>
            {copy.action}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-small font-medium text-ink">What this does</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-small text-ink-soft">
            {copy.effects.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
        <TextArea label="Reason" required rows={3} value={reason} onChange={(e) => setReason(e.target.value)} hint={`At least ${MIN_REASON} characters. Staff only — never shown to the customer.`} maxLength={500} />
        {kind === "disable" && <TextArea label="Internal note (optional)" rows={2} value={note} onChange={(e) => setNote(e.target.value)} hint="Staff only." maxLength={1000} />}
        {problem && (
          <p role="alert" className="flex gap-2 rounded-control border border-danger bg-danger-tint px-3 py-2 text-small text-danger">
            <ShieldAlert size={16} aria-hidden className="mt-0.5 shrink-0" />
            {problem}
          </p>
        )}
      </div>
    </Dialog>
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
