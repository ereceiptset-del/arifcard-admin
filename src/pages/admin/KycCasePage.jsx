import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, TriangleAlert, X, Lock, ImageOff, FileText, ZoomIn, ZoomOut, RotateCw, Columns2, RefreshCw } from "lucide-react";
import {
  Panel,
  Button,
  StatusPill,
  Skeleton,
  ErrorState,
  EmptyState,
  Dialog,
  TextArea,
  SelectInput,
  Spinner,
  Timeline,
  useToast,
  formatDateTime,
} from "@addiscard/ui";
import { adminService, ApiError, KYC_STATUS, KYC_STATUS_LABEL, KYC_STATUS_TONE, EVIDENCE_SLOTS, KYC_METHOD_LABEL } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";

/**
 * KYC review workspace: documents, what the customer entered, and the
 * decision, side by side from 1280 px (stacked below).
 *
 * The reviewer is the decision-maker. There are no automated findings in
 * the backend, so none are shown. Approving needs no customer-facing
 * reason; asking for changes and rejecting do, because a decision the
 * customer cannot act on is not a useful one. The internal note is
 * optional and never leaves staff.
 */

const DECIDABLE = [KYC_STATUS.PENDING, KYC_STATUS.UNDER_REVIEW];
const MIN_REASON = 10;

const DECISIONS = [
  { value: "approve", label: "Approve", icon: Check },
  { value: "request_changes", label: "Ask for changes", icon: TriangleAlert },
  { value: "reject", label: "Reject", icon: X },
];

const REASON_CODES = {
  approve: [{ value: "APPROVED", label: "Documents check out" }],
  request_changes: [
    { value: "DOCUMENT_UNREADABLE", label: "Document is unreadable" },
    { value: "DOCUMENT_INCOMPLETE", label: "Document is incomplete or cut off" },
    { value: "DETAILS_MISMATCH", label: "Details do not match the document" },
    { value: "OTHER", label: "Something else" },
  ],
  reject: [
    { value: "DOCUMENT_EXPIRED", label: "Document has expired" },
    { value: "SUSPECTED_ALTERATION", label: "Document appears altered" },
    { value: "DETAILS_MISMATCH", label: "Details do not match the document" },
    { value: "OTHER", label: "Something else" },
  ],
};

/**
 * One evidence file through a short-lived signed URL, fetched per view.
 * Nothing is written to browser storage, and the link expires in minutes,
 * so it cannot be shared or reused later. `nonce` refetches an expired link.
 */
function useEvidence(caseId, slot, nonce) {
  const [state, setState] = useState({ url: null, error: null, loading: true });
  useEffect(() => {
    let cancelled = false;
    setState({ url: null, error: null, loading: true });
    adminService
      .kycEvidence(caseId, slot)
      .then((data) => !cancelled && setState({ url: data.url, error: null, loading: false }))
      .catch((problem) => !cancelled && setState({ url: null, error: problem, loading: false }));
    return () => {
      cancelled = true;
    };
  }, [caseId, slot, nonce]);
  return state;
}

function EvidenceImage({ caseId, slot, label, meta, zoom = 1, rotation = 0, nonce, onReload, tall = true }) {
  const state = useEvidence(caseId, slot, nonce);
  const isPdf = meta?.contentType === "application/pdf";
  const box = tall ? "h-[420px]" : "h-56";

  return (
    <figure className="min-w-0">
      <div className={`relative flex ${box} items-center justify-center overflow-auto rounded-control border border-line bg-surface-2`}>
        {state.loading && <Spinner size={20} />}
        {!state.loading && state.error && (
          <div className="flex flex-col items-center gap-2 text-center text-ink-muted">
            <ImageOff size={20} aria-hidden />
            <p className="text-small">This file couldn't be loaded. Links expire after a few minutes.</p>
            <Button size="sm" variant="secondary" icon={RefreshCw} onClick={onReload}>
              Load again
            </Button>
          </div>
        )}
        {!state.loading && state.url && isPdf && (
          <a href={state.url} target="_blank" rel="noreferrer noopener" className="flex min-h-11 flex-col items-center justify-center gap-2 px-4 text-small text-link hover:underline">
            <FileText size={22} aria-hidden />
            Open the PDF in a new tab
          </a>
        )}
        {!state.loading && state.url && !isPdf && (
          <img
            src={state.url}
            alt={label}
            style={{ transform: `rotate(${rotation}deg) scale(${zoom})` }}
            className="max-h-full max-w-full object-contain transition-transform duration-200"
          />
        )}
      </div>
      <figcaption className="mt-1.5 flex items-baseline justify-between gap-3 text-caption text-ink-muted">
        <span className="font-medium text-ink-soft">{label}</span>
        {meta?.name && <span className="truncate">{meta.name}</span>}
      </figcaption>
    </figure>
  );
}

function DocumentViewer({ caseId, files }) {
  const slots = EVIDENCE_SLOTS.filter(({ slot }) => files[slot]);
  const [active, setActive] = useState(slots[0]?.slot);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [sideBySide, setSideBySide] = useState(false);
  const [nonce, setNonce] = useState(0);

  if (slots.length === 0) return <p className="text-small text-ink-muted">Nothing was uploaded.</p>;
  const current = slots.find((s) => s.slot === active) || slots[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {!sideBySide ? (
          <div role="group" aria-label="Document" className="flex flex-wrap gap-1.5">
            {slots.map(({ slot, label }) => (
              <button
                key={slot}
                type="button"
                aria-pressed={current.slot === slot}
                onClick={() => {
                  setActive(slot);
                  setZoom(1);
                  setRotation(0);
                }}
                className={`min-h-11 rounded-full border px-3 text-small font-medium ${
                  current.slot === slot ? "border-accent bg-accent-soft text-accent-ink" : "border-line-strong bg-surface-1 text-ink-soft hover:bg-surface-2"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-small text-ink-muted">All documents</span>
        )}
        <div className="flex gap-1">
          {!sideBySide && (
            <>
              <IconButton label="Zoom out" icon={ZoomOut} disabled={zoom <= 1} onClick={() => setZoom((z) => Math.max(1, z - 0.5))} />
              <IconButton label="Zoom in" icon={ZoomIn} disabled={zoom >= 3} onClick={() => setZoom((z) => Math.min(3, z + 0.5))} />
              <IconButton label="Rotate" icon={RotateCw} onClick={() => setRotation((r) => (r + 90) % 360)} />
            </>
          )}
          {slots.length > 1 && <IconButton label={sideBySide ? "One at a time" : "Side by side"} icon={Columns2} pressed={sideBySide} onClick={() => setSideBySide((v) => !v)} />}
        </div>
      </div>

      {sideBySide ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {slots.map(({ slot, label }) => (
            <EvidenceImage key={slot} caseId={caseId} slot={slot} label={label} meta={files[slot]} nonce={nonce} onReload={() => setNonce((n) => n + 1)} tall={false} />
          ))}
        </div>
      ) : (
        <EvidenceImage caseId={caseId} slot={current.slot} label={current.label} meta={files[current.slot]} zoom={zoom} rotation={rotation} nonce={nonce} onReload={() => setNonce((n) => n + 1)} />
      )}
      <p className="text-caption text-ink-muted">Links are issued to you alone and expire in minutes.</p>
    </div>
  );
}

function IconButton({ label, icon: Icon, onClick, disabled = false, pressed }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-control border text-ink-soft disabled:opacity-40 ${
        pressed ? "border-accent bg-accent-soft text-accent-ink" : "border-line-strong bg-surface-1 hover:bg-surface-2"
      }`}
    >
      <Icon size={17} aria-hidden />
    </button>
  );
}

function DecisionForm({ busy, onSubmit }) {
  const [decision, setDecision] = useState("approve");
  const [reasonCode, setReasonCode] = useState("APPROVED");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const needsReason = decision !== "approve";

  const choose = (value) => {
    setDecision(value);
    setReasonCode(REASON_CODES[value][0].value);
    setError("");
  };

  const review = (event) => {
    event.preventDefault();
    if (needsReason && reason.trim().length < MIN_REASON) {
      setError(`Give the customer a reason of at least ${MIN_REASON} characters.`);
      return;
    }
    setConfirming(true);
  };

  const label = DECISIONS.find((d) => d.value === decision).label;

  return (
    <form onSubmit={review} className="flex flex-col gap-4">
      <fieldset>
        <legend className="text-small font-medium text-ink">Decision</legend>
        <div className="mt-2 grid gap-2">
          {DECISIONS.map(({ value, label: text, icon: Icon }) => (
            <label
              key={value}
              className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-control border px-3 ${
                decision === value ? (value === "reject" ? "border-danger bg-danger-tint" : "border-accent bg-accent-soft") : "border-line-strong bg-surface-1 hover:bg-surface-2"
              }`}
            >
              <input type="radio" name="decision" value={value} checked={decision === value} onChange={() => choose(value)} className="h-4 w-4 accent-accent" />
              <Icon size={16} aria-hidden className={value === "reject" ? "text-danger" : value === "request_changes" ? "text-warning" : "text-success"} />
              <span className="text-small font-medium text-ink">{text}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <SelectInput label="Reason code" required value={reasonCode} onChange={(event) => setReasonCode(event.target.value)} options={REASON_CODES[decision]} placeholder="Choose a reason" />

      {needsReason && (
        <TextArea
          label="Message to the customer"
          required
          rows={4}
          maxLength={1000}
          hint={`At least ${MIN_REASON} characters. Shown to them word for word.`}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          error={error}
        />
      )}

      <TextArea label="Internal note (optional)" rows={3} maxLength={1000} hint="Staff only. The customer never sees this." value={note} onChange={(event) => setNote(event.target.value)} />

      <Button type="submit" variant={decision === "reject" ? "destructive" : "primary"} loading={busy}>
        Record decision
      </Button>
      <p className="text-caption text-ink-muted">
        {decision === "approve"
          ? "This records Arifcard's own review. It is not a government confirmation and does not approve a card."
          : "The customer sees your message and can submit again."}
      </p>

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={`${label}?`}
        description="A decided case can't be changed. The customer's email is queued straight away."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirming(false)} disabled={busy}>
              Go back
            </Button>
            <Button
              variant={decision === "reject" ? "destructive" : "primary"}
              loading={busy}
              onClick={async () => {
                const ok = await onSubmit({ decision, reasonCode, customerReason: reason.trim(), internalNote: note.trim() });
                setConfirming(false);
                if (ok) {
                  setReason("");
                  setNote("");
                }
              }}
            >
              {label}
            </Button>
          </>
        }
      >
        <dl className="flex flex-col gap-2 text-small">
          <div className="flex justify-between gap-3">
            <dt className="text-ink-muted">Reason code</dt>
            <dd className="font-medium text-ink">{REASON_CODES[decision].find((r) => r.value === reasonCode)?.label}</dd>
          </div>
          {needsReason && (
            <div>
              <dt className="text-ink-muted">Message to the customer</dt>
              <dd className="mt-1 rounded-control bg-surface-2 px-3 py-2 text-ink">{reason.trim()}</dd>
            </div>
          )}
        </dl>
      </Dialog>
    </form>
  );
}

function NoteForm({ caseId, onAdded }) {
  const toast = useToast();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const add = async (event) => {
    event.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    try {
      await adminService.addNote(caseId, body.trim());
      setBody("");
      toast.success("Internal note added.");
      onAdded();
    } catch (problem) {
      toast.error(problem instanceof ApiError ? problem.message : "We couldn't add the note. Try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={add} className="flex flex-col gap-2 border-t border-line px-4 py-4 sm:px-6">
      <TextArea label="Add an internal note" rows={2} maxLength={1000} value={body} onChange={(event) => setBody(event.target.value)} hint="Staff only." />
      <Button type="submit" variant="secondary" size="sm" loading={busy} disabled={!body.trim()} className="self-start">
        Add note
      </Button>
    </form>
  );
}

export default function KycCasePage() {
  const { caseId } = useParams();
  const toast = useToast();
  const { data, error, loading, reload, setData } = useAsync(() => adminService.kycCase(caseId), [caseId]);
  const [busy, setBusy] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const record = data?.case || null;
  const decidable = record ? DECIDABLE.includes(record.kycStatus) : false;

  const claim = async () => {
    setClaiming(true);
    try {
      const { case: updated } = await adminService.claimCase(caseId);
      setData((current) => ({ ...current, case: updated }));
      toast.success("You're now reviewing this case.");
    } catch (problem) {
      toast.error(problem instanceof ApiError ? problem.message : "We couldn't claim this case. Try again.");
    } finally {
      setClaiming(false);
    }
  };

  const decide = async (payload) => {
    setBusy(true);
    try {
      const response = await adminService.decide(caseId, payload);
      setData({ case: response.case, notification: response.notification });
      // Deliberately not "the customer has been notified": the email is
      // only queued at this point. The panel reports what happened.
      toast.success("The customer's email is queued.", "Decision recorded");
      return true;
    } catch (problem) {
      toast.error(problem instanceof ApiError ? problem.message : "We couldn't save the decision. Try again.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-5">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_360px]">
          <Skeleton className="h-[480px] w-full rounded-panel" />
          <Skeleton className="h-[480px] w-full rounded-panel" />
          <Skeleton className="h-[480px] w-full rounded-panel" />
        </div>
      </div>
    );
  }
  if (error) return <ErrorState title="We couldn't load this case" error={error} onRetry={reload} />;
  if (!record) return <EmptyState headingLevel={1} title="Case not found" description="No case exists with that ID." />;

  const details = record.details || {};
  const files = record.submission?.files || {};
  const previous = (record.submissionHistory || []).filter((sub) => sub.id !== record.currentSubmissionId);

  const timeline = [
    { title: "Case started", time: record.createdAt, state: "done" },
    ...previous.map((sub, index) => ({ title: `Earlier submission ${previous.length - index}`, time: sub.submittedAt || sub.createdAt, state: "done" })),
    { title: `Submitted (v${record.version || 1})`, time: record.submittedAt, state: record.submittedAt ? "done" : "todo" },
    record.decision
      ? {
          title: `Decision: ${KYC_STATUS_LABEL[record.kycStatus] || record.kycStatus}`,
          time: record.decision.decidedAt,
          detail: record.decision.reviewerName ? `By ${record.decision.reviewerName}` : null,
          state: record.kycStatus === KYC_STATUS.APPROVED ? "done" : "failed",
        }
      : { title: record.kycStatus === KYC_STATUS.UNDER_REVIEW ? "Being reviewed" : "Waiting for a reviewer", state: "current" },
    data?.notification
      ? { title: data.notification.status === "sent" ? "Email accepted by the mail server" : `Email ${data.notification.status}`, state: data.notification.status === "failed" ? "failed" : data.notification.status === "sent" ? "done" : "current" }
      : null,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to="/kyc" className="inline-flex min-h-11 items-center gap-1.5 text-small font-medium text-ink-soft hover:text-ink">
          <ArrowLeft size={16} aria-hidden />
          Back to the queue
        </Link>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-h1 text-ink">{record.customer?.name || "Name not given"}</h1>
            <p className="mt-1 text-small text-ink-muted">
              <span className="break-all">{record.customer?.email}</span>
              <span className="mx-2" aria-hidden>
                /
              </span>
              Case {record.id}, version {record.version || 1}
            </p>
          </div>
          <span aria-live="polite">
            <StatusPill tone={KYC_STATUS_TONE[record.kycStatus]}>{KYC_STATUS_LABEL[record.kycStatus]}</StatusPill>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_360px]">
        <Panel title="Documents">
          <DocumentViewer caseId={record.id} files={files} />
        </Panel>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel title="Submitted details" padded={false}>
            <dl className="divide-y divide-line">
              <Row label="Document" value={record.documentType === "PASSPORT" ? "Passport" : "Fayda national ID"} />
              <Row label="Method" value={KYC_METHOD_LABEL[record.method] || record.method} />
              <Row label="First name" value={details.givenNames} />
              <Row label="Last name" value={details.surname} />
              {/* Named for the document in hand. Older cases still carry faydaNumber. */}
              <Row label={record.documentType === "PASSPORT" ? "Passport number" : "FAN number"} value={details.documentNumber || details.faydaNumber} />
              <Row label="Date of birth" value={details.dateOfBirth} />
              {details.placeOfBirth && <Row label="Place of birth" value={details.placeOfBirth} />}
              <Row label="Address" value={[details.addressLine, details.city, details.region, details.country].filter(Boolean).join(", ")} />
              <Row label="Phone number" value={details.phone} />
              <Row label="Occupation" value={details.occupation} />
              <Row label="Employment" value={details.employmentStatus} />
              <Row label="Card purpose" value={details.cardPurpose} />
              <Row label="Annual income" value={details.annualIncome} />
              <Row label="Monthly income" value={details.monthlyIncome} />
              <Row label="Consent given" value={details.consentAcceptedAt ? formatDateTime(details.consentAcceptedAt) : "Not given"} />
              <Row label="Submitted" value={record.submittedAt ? formatDateTime(record.submittedAt) : "Not submitted"} />
            </dl>
          </Panel>

          <Panel title="Internal notes" description="Staff only. Kept in a separate record the customer's screens never read." padded={false}>
            {record.internalNotes?.length ? (
              <ul className="divide-y divide-line">
                {record.internalNotes.map((note) => (
                  <li key={note.id} className="px-4 py-3 sm:px-6">
                    <p className="text-small text-ink">{note.body}</p>
                    <p className="mt-1 text-caption text-ink-muted">
                      {note.authorName || "Staff"}, {note.createdAt ? formatDateTime(note.createdAt) : "time not recorded"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex items-center gap-2 px-4 pb-4 text-small text-ink-muted sm:px-6">
                <Lock size={14} aria-hidden /> No internal notes yet.
              </p>
            )}
            <NoteForm caseId={record.id} onAdded={reload} />
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-6 xl:sticky xl:top-20">
          <Panel title={decidable ? "Your decision" : "Decision"}>
            {decidable ? (
              <>
                {record.kycStatus === KYC_STATUS.PENDING && (
                  <div className="mb-4 rounded-control bg-surface-2 px-3 py-3">
                    <p className="text-small text-ink-soft">Claim this case so other reviewers know you're on it.</p>
                    <Button size="sm" className="mt-2" loading={claiming} onClick={claim}>
                      Start review
                    </Button>
                  </div>
                )}
                <DecisionForm busy={busy} onSubmit={decide} />
              </>
            ) : (
              <div className="flex flex-col gap-3 text-small">
                <p className="text-ink">
                  {record.decision?.reviewerName ? `Decided by ${record.decision.reviewerName}` : "Decided"}
                  {record.decision?.decidedAt ? `, ${formatDateTime(record.decision.decidedAt)}` : ""}.
                </p>
                {record.decision?.reasonCode && <p className="text-ink-soft">Reason code: {record.decision.reasonCode}</p>}
                {(record.decision?.customerReason || record.customerReason) && (
                  <div>
                    <p className="text-caption text-ink-muted">Sent to the customer, word for word</p>
                    <p className="mt-1 rounded-control bg-surface-2 px-3 py-2 text-ink">{record.decision?.customerReason || record.customerReason}</p>
                  </div>
                )}
                <p className="text-caption text-ink-muted">A decided case can't be changed. The customer submits again, which creates a new version.</p>
              </div>
            )}
          </Panel>

          <Panel title="Timeline">
            <Timeline items={timeline} />
            {data?.notification?.status === "sent" && (
              <p className="mt-3 text-caption text-ink-muted">The mail server accepted the message. That doesn't confirm it reached their inbox.</p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-4 py-2.5 sm:px-6">
      <dt className="text-small text-ink-muted">{label}</dt>
      <dd className="min-w-0 break-words text-small text-ink">{value || <span className="text-ink-muted">Not provided</span>}</dd>
    </div>
  );
}
