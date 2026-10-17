import { useCallback, useEffect, useState } from "react";
import { Archive, ArchiveRestore, Ban, History, MoreHorizontal, Trash2, ShieldAlert, ShieldCheck, Info } from "lucide-react";
import { Dropdown, Dialog, Button, TextArea, TextInput, SelectInput, Skeleton, StatusPill, buttonClasses, useToast, formatDateTime } from "@addiscard/ui";
import { ApiError } from "@addiscard/services";
import { recordsApi, DELETE_REASONS, AUDIT_ACTION_LABEL } from "../../data/records.js";

/**
 * Record management for one row: a "More" menu listing only the actions
 * the backend says are allowed now, and the dialogs behind them.
 *
 *   Archive   neutral   — hides from the default list; history preserved
 *   Restore   primary   — shows it again; nothing is re-run
 *   Cancel    warning   — funding instructions not yet sent
 *   Delete    red       — owner only, after a preview, typed DELETE,
 *                         a reason and the password
 *
 * The backend re-checks everything on every action; these dialogs are
 * explanation, not security.
 */

const errorText = (e, fallback) => (e instanceof ApiError ? e.message : fallback);

export function RecordActions({ type, id, actions, summary, onChanged, align = "right" }) {
  const [dialog, setDialog] = useState(null);
  if (!actions) return null;
  const items = [
    actions.archive?.allowed && { label: "Archive", icon: Archive, onSelect: () => setDialog("archive") },
    actions.restore?.allowed && { label: "Restore", icon: ArchiveRestore, onSelect: () => setDialog("restore") },
    actions.cancel?.allowed && { label: "Cancel instruction", icon: Ban, onSelect: () => setDialog("cancel") },
    { label: "View history", icon: History, onSelect: () => setDialog("history") },
    actions.delete?.allowed && { label: "Permanently delete…", icon: Trash2, tone: "danger", divider: true, onSelect: () => setDialog("delete") },
  ].filter(Boolean);

  return (
    // Clicks and keys stay inside: the row behind opens a drawer on click.
    <span className="inline-flex" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <Dropdown
        align={align}
        label={`More actions for ${summary}`}
        items={items}
        trigger={
          <span className="inline-flex items-center gap-1.5">
            <MoreHorizontal size={16} aria-hidden />
            More
          </span>
        }
        buttonClassName={buttonClasses({ variant: "secondary", size: "sm" })}
      />
      <RecordDialog type={type} id={id} kind={dialog} summary={summary} onClose={() => setDialog(null)} onSwitch={setDialog} onDone={onChanged} />
    </span>
  );
}

/** One open dialog of the five. */
export function RecordDialog({ type, id, kind, summary, onClose, onSwitch, onDone }) {
  if (!kind) return null;
  if (kind === "history") return <HistoryDialog type={type} id={id} summary={summary} onClose={onClose} />;
  if (kind === "delete") return <DeleteDialog type={type} id={id} summary={summary} onClose={onClose} onSwitch={onSwitch} onDone={onDone} />;
  return <ReasonDialog kind={kind} type={type} id={id} summary={summary} onClose={onClose} onDone={onDone} />;
}

const REASON_COPY = {
  archive: {
    title: "Archive record",
    action: "Archive record",
    variant: "secondary",
    min: 10,
    effects: [
      "It leaves the default active list and its counts.",
      "It stays available under Archived, with who archived it and why.",
      "Payments, decisions and provider history are preserved exactly as they are.",
      "It can be restored later if its state still allows it.",
    ],
  },
  restore: {
    title: "Restore record",
    action: "Restore record",
    variant: "primary",
    min: 10,
    effects: ["It shows in the active list again.", "Nothing is re-run: no re-verification, no allocation, no card action and no customer email."],
  },
  cancel: {
    title: "Cancel funding instruction",
    action: "Cancel instruction",
    variant: "secondary",
    min: 5,
    effects: ["The instruction is marked cancelled and will never be sent.", "Nothing was sent to the card provider for it, so nothing there changes.", "The verified payment it was for is unchanged."],
  },
};

function ReasonDialog({ kind, type, id, summary, onClose, onDone }) {
  const toast = useToast();
  const copy = REASON_COPY[kind];
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);
  const trimmed = reason.trim();
  const tooShort = trimmed.length < copy.min;

  const submit = async () => {
    setBusy(true);
    setProblem(null);
    try {
      await recordsApi[kind](type, id, trimmed);
      toast.success(kind === "archive" ? "Archived. Find it under Archived." : kind === "restore" ? "Restored." : "Instruction cancelled.");
      onDone?.();
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
          <Button variant={copy.variant} loading={busy} disabled={tooShort} disabledReason={`Give a reason of at least ${copy.min} characters.`} onClick={submit}>
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
        <TextArea label="Reason" required rows={3} value={reason} onChange={(e) => setReason(e.target.value)} hint={`At least ${copy.min} characters. Kept in the audit log.`} maxLength={500} />
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

const DEP_LABEL = {
  submissions: "Submissions",
  submittedSubmissions: "Submitted submissions",
  storageObjects: "Private files in Storage",
  internalNotes: "Internal notes",
  providerKyc: "Card provider KYC records",
  notifications: "Customer notifications",
  claims: "Receipts submitted",
  allocations: "Bank transactions allocated",
  ledgerEntries: "Ledger entries",
  fundingInstruction: "Funding instructions",
  cardIssuance: "Card issuance records",
  quotes: "Price quotes",
};

function DeleteDialog({ type, id, summary, onClose, onSwitch, onDone }) {
  const toast = useToast();
  const [preview, setPreview] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [reasonCode, setReasonCode] = useState("");
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      setPreview((await recordsApi.preview(type, id)).preview);
    } catch (e) {
      setLoadError(errorText(e, "The eligibility check didn't load."));
    }
  }, [type, id]);

  useEffect(() => {
    let cancelled = false;
    recordsApi
      .preview(type, id)
      .then((r) => !cancelled && setPreview(r.preview))
      .catch((e) => !cancelled && setLoadError(errorText(e, "The eligibility check didn't load.")));
    return () => {
      cancelled = true;
    };
  }, [type, id]);

  const ready = reasonCode && reason.trim().length >= 10 && password && typed === "DELETE";

  const submit = async () => {
    setBusy(true);
    setProblem(null);
    try {
      await recordsApi.remove(type, id, { reason: reason.trim(), reasonCode, confirm: typed, password });
      setPassword("");
      toast.success("Permanently deleted. A tombstone and the audit entries remain.");
      onDone?.();
      onClose();
    } catch (e) {
      setPassword("");
      setProblem(errorText(e, "The deletion didn't go through. Check the record before trying again."));
    } finally {
      setBusy(false);
    }
  };

  const deps = Object.entries(preview?.dependencies || {}).filter(([k, v]) => typeof v === "number" && DEP_LABEL[k]);
  const linked = deps.reduce((n, [k, v]) => (["storageObjects", "submissions", "internalNotes", "quotes"].includes(k) ? n : n + v), 0);

  if (!preview) {
    return (
      <Dialog open size="md" onClose={onClose} title="Checking deletion eligibility" description={summary}>
        {loadError ? (
          <div role="alert" className="flex flex-col items-start gap-3">
            <p className="text-small text-danger">{loadError}</p>
            <Button variant="secondary" size="sm" onClick={load}>
              Try again
            </Button>
          </div>
        ) : (
          <div aria-busy="true" className="flex flex-col gap-2">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}
      </Dialog>
    );
  }

  if (!preview.canDelete) {
    return (
      <Dialog
        open
        size="md"
        onClose={onClose}
        title="This record can't be deleted"
        description={summary}
        footer={
          <>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            {preview.canArchive && (
              <Button variant="secondary" icon={Archive} onClick={() => onSwitch("archive")}>
                Archive record
              </Button>
            )}
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col gap-2">
            {preview.blockers.map((b) => (
              <li key={b.code} className="flex gap-2 rounded-control border border-line bg-surface-2 px-3 py-2 text-small text-ink">
                <ShieldAlert size={16} aria-hidden className="mt-0.5 shrink-0 text-warning" />
                <span>{b.message}</span>
              </li>
            ))}
          </ul>
          {deps.length > 0 && <Dependencies deps={deps} />}
          {preview.canArchive && <p className="text-small text-ink-soft">Use Archive instead: it hides the record from the active list and keeps its history.</p>}
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      open
      size="lg"
      onClose={busy ? () => {} : onClose}
      title={`Permanently delete ${preview.label.toLowerCase()}`}
      description={summary}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="destructive" icon={Trash2} loading={busy} disabled={!ready} disabledReason="Choose a reason, explain it, enter your password and type DELETE." onClick={submit}>
            Permanently delete
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-small font-medium text-ink">This will remove</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-small text-ink-soft">
              {preview.plannedActions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-small font-medium text-ink">This will not</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-small text-ink-soft">
              {preview.willNot.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
        <dl className="grid grid-cols-1 gap-2 rounded-control border border-line bg-surface-2 p-3 text-small sm:grid-cols-3">
          <div>
            <dt className="text-ink-muted">Eligibility</dt>
            <dd className="mt-0.5">
              <StatusPill tone="success" icon={ShieldCheck}>
                Safe to delete
              </StatusPill>
            </dd>
          </div>
          <div>
            <dt className="text-ink-muted">Linked records</dt>
            <dd className="mt-0.5 font-medium text-ink tabular-nums">{linked}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Environment</dt>
            <dd className="mt-0.5 font-medium text-ink">{String(preview.environment || "").toLowerCase() === "sandbox" ? "Sandbox" : preview.environment === "live" ? "Live data" : preview.environment}</dd>
          </div>
        </dl>
        {deps.length > 0 && <Dependencies deps={deps} />}
        <SelectInput label="Why is it being deleted?" required value={reasonCode} onChange={(e) => setReasonCode(e.target.value)} options={DELETE_REASONS} placeholder="Choose a reason" />
        <TextArea label="Explain" required rows={2} value={reason} onChange={(e) => setReason(e.target.value)} hint="At least 10 characters. Kept in the audit log." maxLength={500} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Your password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} hint="Confirms it's you; checked by the server." />
          <TextInput label='Type "DELETE"' required value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} hint="Exactly as shown, in capitals." />
        </div>
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

function Dependencies({ deps }) {
  return (
    <div>
      <p className="text-small font-medium text-ink">Linked records</p>
      <dl className="mt-1.5 divide-y divide-line rounded-control border border-line">
        {deps.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 px-3 py-2 text-small">
            <dt className="text-ink-soft">{DEP_LABEL[k]}</dt>
            <dd className="font-medium tabular-nums text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function HistoryDialog({ type, id, summary, onClose }) {
  const [state, setState] = useState({ loading: true });
  useEffect(() => {
    let cancelled = false;
    recordsApi
      .status(type, id)
      .then((r) => !cancelled && setState({ record: r.record }))
      .catch((e) => !cancelled && setState({ error: errorText(e, "The history didn't load.") }));
    return () => {
      cancelled = true;
    };
  }, [type, id]);
  const r = state.record;
  return (
    <Dialog open size="md" onClose={onClose} title="Record history" description={summary} footer={<Button variant="secondary" onClick={onClose}>Close</Button>}>
      {state.loading && <Skeleton className="h-24 w-full" />}
      {state.error && <p role="alert" className="text-small text-danger">{state.error}</p>}
      {r && (
        <div className="flex flex-col gap-4">
          {r.archived && (
            <p className="flex gap-2 rounded-control border border-line bg-surface-2 px-3 py-2 text-small text-ink">
              <Info size={16} aria-hidden className="mt-0.5 shrink-0 text-ink-muted" />
              <span>
                Archived {formatDateTime(r.archivedAt) || ""}
                {r.archivedBy ? ` by ${r.archivedBy}` : ""}
                {r.archiveReason ? ` — “${r.archiveReason}”` : ""}
              </span>
            </p>
          )}
          {r.history.length === 0 ? (
            <p className="text-small text-ink-muted">No audit entries for this record yet.</p>
          ) : (
            <ol className="flex flex-col divide-y divide-line rounded-control border border-line">
              {r.history.map((h, k) => (
                <li key={`${h.action}-${h.at}-${k}`} className="px-3 py-2.5 text-small">
                  <p className="font-medium text-ink">{AUDIT_ACTION_LABEL[h.action] || h.action}</p>
                  <p className="text-caption text-ink-muted">
                    {formatDateTime(h.at) || "Time not recorded"}
                    {h.actor ? ` · ${h.actor}` : ""}
                  </p>
                  {h.reason && <p className="mt-1 text-ink-soft">{h.reason}</p>}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </Dialog>
  );
}

/**
 * Detail-page section: archive state, the archive/restore action, and a
 * "Check deletion eligibility" that explains — never a dominant red button.
 */
export function RecordDangerZone({ type, id, summary, onChanged }) {
  const [state, setState] = useState({ loading: true });
  const [dialog, setDialog] = useState(null);
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    let cancelled = false;
    recordsApi
      .status(type, id)
      .then((r) => !cancelled && setState({ record: r.record }))
      .catch((e) => !cancelled && setState({ error: errorText(e, "Record management didn't load.") }));
    return () => {
      cancelled = true;
    };
  }, [type, id, nonce]);
  const r = state.record;
  const caps = r?.capabilities;
  const done = () => {
    setNonce((n) => n + 1);
    onChanged?.();
  };
  return (
    <section aria-labelledby={`dz-${id}`} className="rounded-panel border border-line bg-surface-1 p-5">
      <h2 id={`dz-${id}`} className="text-body font-semibold text-ink">
        Record management
      </h2>
      {state.loading && <Skeleton className="mt-3 h-16 w-full" />}
      {state.error && <p role="alert" className="mt-2 text-small text-danger">{state.error}</p>}
      {caps && (
        <div className="mt-3 flex flex-col divide-y divide-line">
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-small font-medium text-ink">{r.archived ? "Archived" : "Archive this record"}</p>
              <p className="text-small text-ink-muted">
                {r.archived
                  ? `Hidden from the active list${r.archivedBy ? ` by ${r.archivedBy}` : ""}${r.archiveReason ? ` — “${r.archiveReason}”` : ""}.`
                  : "Removes it from the active queue while preserving its history."}
              </p>
            </div>
            {r.archived ? (
              <Button size="sm" icon={ArchiveRestore} onClick={() => setDialog("restore")} disabled={!caps.restore.allowed} disabledReason={caps.restore.blockers[0]?.message}>
                Restore
              </Button>
            ) : (
              <Button size="sm" variant="secondary" icon={Archive} onClick={() => setDialog("archive")} disabled={!caps.archive.allowed} disabledReason={caps.archive.blockers[0]?.message}>
                Archive
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-small font-medium text-ink">Permanent deletion</p>
              <p className="text-small text-ink-muted">Only for eligible drafts, unpaid and test records. The check explains what applies to this one.</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="ghost" icon={History} onClick={() => setDialog("history")}>
                History
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setDialog("delete")}>
                Check deletion eligibility
              </Button>
            </div>
          </div>
        </div>
      )}
      <RecordDialog type={type} id={id} kind={dialog} summary={summary} onClose={() => setDialog(null)} onSwitch={setDialog} onDone={done} />
    </section>
  );
}

export default RecordActions;
