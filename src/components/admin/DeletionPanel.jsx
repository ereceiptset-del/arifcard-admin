import { useCallback, useEffect, useState } from "react";
import { ShieldAlert, SearchCheck, FileX, RotateCcw, Undo2, Trash2, CheckCircle2, CircleDashed, XCircle } from "lucide-react";
import { Button, Dialog, TextArea, TextInput, SelectInput, StatusPill, useToast, formatDateTime } from "@addiscard/ui";
import { ApiError } from "@addiscard/services";
import {
  customerAccessApi,
  DEPENDENCY_LABEL,
  DELETE_CUSTOMER_PHRASE,
  DELETION_REASONS,
  DELETION_STAGE_LABEL,
  DELETION_OP_LABEL,
} from "../../data/customerAccess.js";

/**
 * Danger zone: permanent deletion.
 *
 * In production this is a review tool: an administrator records a
 * deletion request (the customer is restricted while it is reviewed),
 * re-checks it, or withdraws it; anyone may read the eligibility preview.
 * The irreversible purge is offered ONLY when the server says it can start
 * — an approved retention policy and execution enabled, which today is
 * true on the local emulators alone — and then only to the owner, with a
 * password and a typed phrase. The server re-checks everything.
 */
const MIN_REASON = 10;
const NOT_ENABLED = "Permanent deletion is not yet enabled. This preview identifies records and policy requirements that must be resolved first.";
const errorText = (e, fallback) => (e instanceof ApiError ? e.message : fallback);

export default function DeletionPanel({ uid, summary, account, isAdmin, isOwner, onDone }) {
  const [preview, setPreview] = useState(null);
  const [operation, setOperation] = useState(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);
  const [dialog, setDialog] = useState(null);
  const toast = useToast();

  const check = useCallback(async () => {
    setBusy(true);
    setProblem(null);
    try {
      setPreview((await customerAccessApi.deletionPreview(uid)).preview);
    } catch (e) {
      setProblem(errorText(e, "The eligibility check didn't load. Nothing was changed."));
    } finally {
      setBusy(false);
    }
  }, [uid]);

  // An operation exists once deletion has started: show its progress.
  const loadOperation = useCallback(async () => {
    try {
      setOperation((await customerAccessApi.deletionOperation(uid)).operation);
    } catch {
      setOperation(null);
    }
  }, [uid]);
  const started = Boolean(account.deletionOperationId) || ["DELETION_IN_PROGRESS", "PERMANENTLY_DELETED"].includes(account.accountStatus);
  useEffect(() => {
    if (started && isAdmin) loadOperation();
  }, [started, isAdmin, loadOperation, account.version]);

  const review = async () => {
    setBusy(true);
    setProblem(null);
    try {
      const result = await customerAccessApi.reviewDeletion(uid, { expectedVersion: account.version });
      setPreview(result.preview);
      toast.success(result.toStatus === "DELETION_BLOCKED" ? "Reviewed: deletion is blocked until the listed items are resolved." : "Reviewed: no case blockers.");
      onDone(result);
    } catch (e) {
      setProblem(errorText(e, "The review didn't go through. Nothing was changed."));
    } finally {
      setBusy(false);
    }
  };

  const after = (result) => {
    if (result?.operation) setOperation(result.operation);
    setPreview(null);
    onDone(result);
  };

  const failed = operation && ["DELETION_FAILED", "RECONCILIATION_REQUIRED"].includes(operation.status);
  const canExecute = preview?.canStartDeletion === true && isOwner;
  const actions = account.actions || {};

  return (
    <section aria-labelledby="danger-heading" className="rounded-control border border-danger p-4">
      <h3 id="danger-heading" className="text-h3 text-danger">
        Danger zone: permanent deletion
      </h3>
      <p className="mt-1 text-small text-ink-soft">{preview?.canStartDeletion ? "Deletion can start on this server. It cannot be undone." : NOT_ENABLED}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" icon={SearchCheck} loading={busy && !dialog} disabled={!isAdmin} disabledReason="Only an administrator can check deletion eligibility." onClick={check}>
          Check deletion eligibility
        </Button>
        {actions.requestDeletion && (
          <Button variant="secondary" icon={FileX} disabled={!isAdmin} disabledReason="Only an administrator can record a deletion request." onClick={() => setDialog("request")}>
            Record deletion request
          </Button>
        )}
        {actions.reviewDeletion && (
          <Button variant="secondary" icon={RotateCcw} loading={busy} disabled={!isAdmin} disabledReason="Only an administrator can review a deletion request." onClick={review}>
            Re-check request
          </Button>
        )}
        {actions.cancelDeletion && (
          <Button variant="ghost" icon={Undo2} disabled={!isAdmin} disabledReason="Only an administrator can withdraw a deletion request." onClick={() => setDialog("cancel")}>
            Withdraw deletion request
          </Button>
        )}
        {canExecute && (
          <Button variant="danger" icon={Trash2} onClick={() => setDialog("execute")}>
            Run staged deletion
          </Button>
        )}
        {failed && isOwner && (
          <Button variant="danger" icon={RotateCcw} onClick={() => setDialog("resume")}>
            Resume deletion
          </Button>
        )}
      </div>

      {problem && (
        <p role="alert" className="mt-3 text-small text-danger">
          {problem}
        </p>
      )}

      {operation && <OperationProgress operation={operation} />}

      {preview && (
        <div className="mt-4 flex flex-col gap-4" aria-live="polite">
          <p role="status" className="rounded-control border border-line bg-surface-2 px-3 py-2 text-small font-medium text-ink">
            {preview.canStartDeletion ? "Eligible for deletion." : "Not eligible: deletion cannot start."} Nothing was changed.
          </p>
          <p className="text-caption text-ink-muted">
            Retention policy {preview.policyVersion} ({preview.policyStatus === "APPROVED" ? "approved" : "draft — not approved"}). Execution on this server:{" "}
            {preview.execution?.enabled ? "enabled (local emulators only)" : "disabled"}.
          </p>
          {preview.blockers.length > 0 && (
            <div>
              <p className="text-small font-medium text-ink">Blocked by</p>
              <ul className="mt-1.5 flex flex-col gap-1.5">
                {preview.blockers.map((b) => (
                  <li key={b.code} className="flex gap-2 text-small text-ink">
                    <ShieldAlert size={16} aria-hidden className="mt-0.5 shrink-0 text-danger" />
                    {b.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className="text-small font-medium text-ink">Records found</p>
            <dl className="mt-1.5 divide-y divide-line rounded-control border border-line">
              {Object.entries(preview.dependencies).map(([key, value]) => (
                <Row key={key} label={DEPENDENCY_LABEL[key] || key} value={value == null ? "Unavailable" : String(value)} />
              ))}
            </dl>
            <p className="mt-1.5 text-caption text-ink-muted">Payments, receipts, cards, transactions, provider and audit records are kept, with personal details removed — never deleted.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-small font-medium text-ink">An approved deletion would</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-small text-ink-soft">
                {preview.plannedActions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-small font-medium text-ink">It would never</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-small text-ink-soft">
                {preview.willNot.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {dialog === "request" && <ReasonDialog kind="request" uid={uid} summary={summary} expectedVersion={account.version} onClose={() => setDialog(null)} onDone={after} />}
      {dialog === "cancel" && <ReasonDialog kind="cancel" uid={uid} summary={summary} expectedVersion={account.version} onClose={() => setDialog(null)} onDone={after} />}
      {dialog === "execute" && <ExecuteDialog uid={uid} summary={summary} expectedVersion={account.version} onClose={() => setDialog(null)} onDone={after} />}
      {dialog === "resume" && <ExecuteDialog resume uid={uid} summary={summary} expectedVersion={account.version} onClose={() => setDialog(null)} onDone={after} />}
    </section>
  );
}

function OperationProgress({ operation }) {
  const done = new Set(operation.completedStages);
  return (
    <div className="mt-4 rounded-control border border-line p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-small font-medium text-ink">Deletion operation</p>
        <StatusPill tone={operation.status === "DELETION_COMPLETED" ? "neutral" : operation.status === "IN_PROGRESS" ? "attention" : "danger"}>
          {DELETION_OP_LABEL[operation.status] || operation.status}
        </StatusPill>
      </div>
      <ol className="mt-2 flex flex-col gap-1.5">
        {Object.entries(DELETION_STAGE_LABEL).map(([stage, label]) => {
          const failedHere = operation.failedAction === stage && operation.status !== "DELETION_COMPLETED";
          const Icon = done.has(stage) ? CheckCircle2 : failedHere ? XCircle : CircleDashed;
          return (
            <li key={stage} className={`flex items-center gap-2 text-small ${failedHere ? "text-danger" : done.has(stage) ? "text-ink" : "text-ink-muted"}`}>
              <Icon size={16} aria-hidden className="shrink-0" />
              {label}
              <span className="sr-only">{done.has(stage) ? " — done" : failedHere ? " — failed" : " — pending"}</span>
              {failedHere && operation.safeErrorCategory && <span className="text-caption">({operation.safeErrorCategory})</span>}
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-caption text-ink-muted">
        {operation.startedAt ? `Started ${formatDateTime(operation.startedAt)}` : ""}
        {operation.completedAt ? `. Completed ${formatDateTime(operation.completedAt)}` : ""}. Reference {operation.opaqueDeletedCustomerRef}.
      </p>
    </div>
  );
}

const REASON_COPY = {
  request: {
    title: "Record deletion request",
    action: "Record request",
    effects: [
      "The customer is restricted while the request is reviewed: they see that deletion was requested, support and sign out — nothing else.",
      "Nothing is deleted. Payments, cards, KYC and provider records are unchanged.",
      "The request can be withdrawn until deletion starts.",
    ],
    call: (uid, body) => customerAccessApi.requestDeletion(uid, body),
    success: "Deletion request recorded.",
  },
  cancel: {
    title: "Withdraw deletion request",
    action: "Withdraw request",
    effects: ["The account returns to the state it was in before the request (active or temporarily disabled).", "Nothing is re-run."],
    call: (uid, body) => customerAccessApi.cancelDeletion(uid, body),
    success: "Deletion request withdrawn.",
  },
};

function ReasonDialog({ kind, uid, summary, expectedVersion, onClose, onDone }) {
  const copy = REASON_COPY[kind];
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);
  const submit = async () => {
    setBusy(true);
    setProblem(null);
    try {
      const result = await copy.call(uid, { reason: reason.trim(), expectedVersion });
      toast.success(copy.success);
      onDone(result);
      onClose();
    } catch (e) {
      setProblem(errorText(e, "That didn't go through. Nothing was changed; try again."));
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
          <Button variant="primary" loading={busy} disabled={reason.trim().length < MIN_REASON} disabledReason={`Give a reason of at least ${MIN_REASON} characters.`} onClick={submit}>
            {copy.action}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ul className="list-disc space-y-1 pl-5 text-small text-ink-soft">
          {copy.effects.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
        <TextArea label="Reason" required rows={3} value={reason} onChange={(e) => setReason(e.target.value)} hint={`At least ${MIN_REASON} characters. Staff only, kept in the audit log.`} maxLength={500} />
        <Problem text={problem} />
      </div>
    </Dialog>
  );
}

/** Owner only. Shown only when the server says deletion can start (never in production today). */
function ExecuteDialog({ resume = false, uid, summary, expectedVersion, onClose, onDone }) {
  const toast = useToast();
  const [reasonCode, setReasonCode] = useState("");
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);
  const ready = (resume || (reasonCode && reason.trim().length >= MIN_REASON)) && password && typed === DELETE_CUSTOMER_PHRASE;

  const submit = async () => {
    setBusy(true);
    setProblem(null);
    try {
      const result = resume
        ? await customerAccessApi.resumeDeletion(uid, { password, confirm: typed })
        : await customerAccessApi.executeDeletion(uid, { reasonCode, reason: reason.trim(), password, confirm: typed, expectedVersion });
      const op = result.operation;
      toast[op?.status === "DELETION_COMPLETED" ? "success" : "info"](
        op?.status === "DELETION_COMPLETED" ? "Deletion completed." : `Deletion stopped: ${DELETION_OP_LABEL[op?.status] || op?.status}. Nothing reports success until every stage is done.`
      );
      onDone(result);
      onClose();
    } catch (e) {
      setProblem(errorText(e, "That didn't go through; check the operation's state before trying again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open
      size="lg"
      onClose={busy ? () => {} : onClose}
      title={resume ? "Resume staged deletion" : "Run staged deletion"}
      description={summary}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" loading={busy} disabled={!ready} disabledReason="Complete every field and type the phrase." onClick={submit}>
            {resume ? "Resume deletion" : "Delete customer"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ul className="list-disc space-y-1 pl-5 text-small text-ink-soft">
          <li>Revokes access, deletes personal data and the approved identity files, de-identifies retained payment, card, provider and audit records, removes the sign-in account and keeps a tombstone without personal data.</li>
          <li>Runs in stages and records each one; a failure stops it for reconciliation — it never reports success early. {resume ? "Completed stages are not repeated." : ""}</li>
          <li>Card-provider records are the provider's and are not deleted by this.</li>
          <li>It cannot be undone.</li>
        </ul>
        {!resume && (
          <>
            <SelectInput label="Reason" required value={reasonCode} onChange={(e) => setReasonCode(e.target.value)} options={DELETION_REASONS} placeholder="Choose a reason" />
            <TextArea label="Details" required rows={2} value={reason} onChange={(e) => setReason(e.target.value)} hint={`At least ${MIN_REASON} characters. Kept in the audit log.`} maxLength={500} />
          </>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Your password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} hint="Confirms it's you; checked by the server." />
          <TextInput label={`Type "${DELETE_CUSTOMER_PHRASE}"`} required value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} hint="Exactly as shown, in capitals." />
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
