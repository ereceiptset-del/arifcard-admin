import { useCallback, useEffect, useState } from "react";
import { ShieldAlert, SearchCheck, FileX, RotateCcw, Undo2, Trash2, CheckCircle2, CircleDashed, XCircle, BadgeCheck } from "lucide-react";
import { Button, Dialog, TextArea, TextInput, SelectInput, StatusPill, useToast, formatDateTime } from "@addiscard/ui";
import { ApiError } from "@addiscard/services";
import {
  customerAccessApi,
  DEPENDENCY_LABEL,
  DELETE_CUSTOMER_PHRASE,
  DELETION_REASONS,
  DELETION_STAGE_LABEL,
  DELETION_OP_LABEL,
  DELETION_FEATURE_ENABLED,
  PROVIDER_ACTION_OPTIONS,
  PROVIDER_ACTION_LABEL,
  ACCOUNT_HISTORY_LABEL,
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

  const approve = async () => {
    setBusy(true);
    setProblem(null);
    try {
      const result = await customerAccessApi.approveDeletion(uid, { expectedVersion: account.version });
      setPreview(result.preview);
      toast.success("Deletion request approved. Execution still needs an approved retention policy and the owner.");
      onDone(result);
    } catch (e) {
      setProblem(errorText(e, "The approval didn't go through. Nothing was changed."));
      // Show what blocks it: the eligibility list, grouped, right below.
      if (e instanceof ApiError && e.code === "DELETION_BLOCKED") {
        try {
          setPreview((await customerAccessApi.deletionPreview(uid)).preview);
        } catch {
          /* the message above already names the items */
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const failed = operation && ["DELETION_FAILED", "RECONCILIATION_REQUIRED"].includes(operation.status);
  const canExecute = preview?.canStartDeletion === true && isOwner;
  const actions = account.actions || {};

  // Deletion hidden: nothing to show — except a way to withdraw a request left over from earlier.
  if (!DELETION_FEATURE_ENABLED) {
    if (!actions.cancelDeletion) return null;
    return (
      <section aria-labelledby="open-request-heading" className="rounded-control border border-line-strong p-4">
        <h3 id="open-request-heading" className="text-h3 text-ink">
          Open deletion request
        </h3>
        <p className="mt-1 text-small text-ink-soft">
          Account deletion is turned off. This account still has a deletion request from earlier, which keeps it restricted. Withdraw it to return the
          account to its previous state.
        </p>
        <Button className="mt-3" variant="secondary" icon={Undo2} disabled={!isAdmin} disabledReason="Only an administrator can withdraw a deletion request." onClick={() => setDialog("cancel")}>
          Withdraw deletion request
        </Button>
        {dialog === "cancel" && <ReasonDialog kind="cancel" uid={uid} summary={summary} expectedVersion={account.version} onClose={() => setDialog(null)} onDone={after} />}
      </section>
    );
  }

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
        {actions.approveDeletion && (
          <Button variant="secondary" icon={BadgeCheck} loading={busy} disabled={!isAdmin} disabledReason="Only an administrator can approve a deletion request." onClick={approve}>
            Approve deletion request
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

      {operation && <OperationProgress operation={operation} uid={uid} isAdmin={isAdmin} onChanged={setOperation} />}
      {isAdmin && <AccountHistory uid={uid} version={account.version} />}

      {preview && (
        <div className="mt-4 flex flex-col gap-4" aria-live="polite">
          <p role="status" className="rounded-control border border-line bg-surface-2 px-3 py-2 text-small font-medium text-ink">
            {preview.canStartDeletion ? "Eligible for deletion." : "Not eligible: deletion cannot start."} Nothing was changed.
          </p>
          {preview.request?.requestedAt && (
            <p className="text-small text-ink">
              Requested {formatDateTime(preview.request.requestedAt)} {preview.request.source === "customer" ? "by the customer in the app" : preview.request.requestedBy ? `by ${preview.request.requestedBy}` : ""}.{" "}
              {preview.request.approvedAt ? `Approved ${formatDateTime(preview.request.approvedAt)}${preview.request.approvedBy ? ` by ${preview.request.approvedBy}` : ""}.` : "Not approved yet."}
            </p>
          )}
          <p className="text-caption text-ink-muted">
            Retention policy {preview.policyVersion} ({preview.policyStatus === "APPROVED" ? "approved" : "draft — not approved"}). Execution on this server:{" "}
            {preview.execution?.enabled ? "enabled (local emulators only)" : "disabled"}.
          </p>
          <BlockerGroup
            title="Resolve before approval"
            hint="About this customer. Approval is refused until each is resolved."
            items={preview.blockers.filter((b) => (b.scope || "case") === "case")}
            tone="text-danger"
          />
          <BlockerGroup title="Steps still to do" items={preview.blockers.filter((b) => b.scope === "step")} tone="text-ink-muted" />
          <BlockerGroup
            title="Not available on this server yet"
            hint="Final deletion also needs an approved retention policy and deletion switched on. These do not stop recording or approving a request."
            items={preview.blockers.filter((b) => b.scope === "policy")}
            tone="text-ink-muted"
          />
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

function BlockerGroup({ title, hint, items, tone }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-small font-medium text-ink">{title}</p>
      {hint && <p className="text-caption text-ink-muted">{hint}</p>}
      <ul className="mt-1.5 flex flex-col gap-1.5">
        {items.map((b) => (
          <li key={b.code} className="flex gap-2 text-small text-ink">
            <ShieldAlert size={16} aria-hidden className={`mt-0.5 shrink-0 ${tone}`} />
            {b.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

function OperationProgress({ operation, uid, isAdmin, onChanged }) {
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
      {operation.notification && (
        <p className="mt-2 text-caption text-ink-muted">
          Customer email: {operation.notification.sent ? "sent" : `not sent (${operation.notification.category || "unknown"})`}.
        </p>
      )}
      {operation.providerActions?.length > 0 && (
        <div className="mt-3">
          <p className="text-small font-medium text-ink">Provider-held records</p>
          <p className="text-caption text-ink-muted">Local deletion does not remove these. Submit a request through the provider's own channel, then record the outcome here.</p>
          <ul className="mt-2 flex flex-col gap-2">
            {operation.providerActions.map((a) => (
              <ProviderAction key={`${a.provider}-${a.reference}`} action={a} uid={uid} isAdmin={isAdmin} onChanged={onChanged} />
            ))}
          </ul>
        </div>
      )}
      <p className="mt-2 text-caption text-ink-muted">
        {operation.startedAt ? `Started ${formatDateTime(operation.startedAt)}` : ""}
        {operation.completedAt ? `. Completed ${formatDateTime(operation.completedAt)}` : ""}. Reference {operation.opaqueDeletedCustomerRef}.
      </p>
    </div>
  );
}

function ProviderAction({ action, uid, isAdmin, onChanged }) {
  const toast = useToast();
  const [status, setStatus] = useState("");
  const [evidence, setEvidence] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);
  const needsEvidence = ["CONFIRMED_DELETED", "PROVIDER_RETAINS"].includes(status);
  const save = async () => {
    setBusy(true);
    setProblem(null);
    try {
      const { operation } = await customerAccessApi.recordProviderAction(uid, { provider: action.provider, reference: action.reference, status, evidence: evidence.trim() || undefined });
      toast.success("Provider outcome recorded.");
      onChanged(operation);
    } catch (e) {
      setProblem(errorText(e, "That didn't go through. Nothing was changed."));
    } finally {
      setBusy(false);
    }
  };
  return (
    <li className="rounded-control border border-line p-3">
      <p className="text-small text-ink">
        {action.provider} ({action.kind === "CARD_PROVIDER" ? "card provider" : action.kind}) · {PROVIDER_ACTION_LABEL[action.status] || action.status}
        {action.required ? " · required by policy" : " · tracked"}
      </p>
      {action.evidence && <p className="mt-1 text-caption text-ink-muted">Evidence: {action.evidence}</p>}
      {isAdmin && action.status !== "CONFIRMED_DELETED" && (
        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <SelectInput label="Outcome" value={status} onChange={(e) => setStatus(e.target.value)} options={PROVIDER_ACTION_OPTIONS} placeholder="Choose" />
          <TextInput label={needsEvidence ? "Evidence (required)" : "Evidence (optional)"} value={evidence} onChange={(e) => setEvidence(e.target.value)} />
          <Button variant="secondary" loading={busy} disabled={!status || (needsEvidence && evidence.trim().length < 10)} disabledReason="Choose the outcome; confirmation needs evidence." onClick={save}>
            Record
          </Button>
        </div>
      )}
      {problem && (
        <p role="alert" className="mt-2 text-small text-danger">
          {problem}
        </p>
      )}
    </li>
  );
}

function AccountHistory({ uid, version }) {
  const [history, setHistory] = useState(null);
  useEffect(() => {
    let live = true;
    customerAccessApi
      .accountHistory(uid)
      .then((r) => live && setHistory(r.history || []))
      .catch(() => live && setHistory([]));
    return () => {
      live = false;
    };
  }, [uid, version]);
  if (!history || history.length === 0) return null;
  return (
    <div className="mt-4">
      <p className="text-small font-medium text-ink">Account history</p>
      <ol className="mt-1.5 divide-y divide-line rounded-control border border-line">
        {history.map((h, i) => (
          <li key={`${h.at}-${i}`} className="px-3 py-2 text-small">
            <span className="font-medium text-ink">{ACCOUNT_HISTORY_LABEL[h.action] || h.action}</span>
            <span className="text-ink-muted">
              {" "}
              · {h.at ? formatDateTime(h.at) : "time not recorded"}
              {h.actorName ? ` · ${h.actorName}` : ""}
            </span>
            {h.reason && <p className="text-caption text-ink-muted">{h.reason}</p>}
          </li>
        ))}
      </ol>
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
