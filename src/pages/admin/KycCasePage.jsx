import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, AlertTriangle, X, Lock, Maximize2, ImageOff, FileText, Mail } from "lucide-react";
import {
  Panel,
  Button,
  Badge,
  Skeleton,
  ErrorState,
  EmptyState,
  Dialog,
  TextArea,
  SelectInput,
  Spinner,
  useToast,
} from "@addiscard/ui";
import {
  adminService,
  ApiError,
  KYC_STATUS,
  KYC_STATUS_LABEL,
  KYC_STATUS_TONE,
  EVIDENCE_SLOTS,
  KYC_METHOD_LABEL,
} from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";

const DECIDABLE = [KYC_STATUS.PENDING, KYC_STATUS.UNDER_REVIEW];
const MIN_REASON = 10;

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
 * Loads one evidence file through a short-lived signed URL.
 *
 * The URL is fetched per view and the bytes come straight from Cloud
 * Storage. Nothing is written to browser storage, and the link expires in
 * minutes, so it cannot be shared or reused later.
 */
function EvidenceViewer({ caseId, slot, label, meta }) {
  const [state, setState] = useState({ url: null, error: null, loading: true });
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState({ url: null, error: null, loading: true });

    adminService
      .kycEvidence(caseId, slot)
      .then((data) => !cancelled && setState({ url: data.url, error: null, loading: false, meta: data }))
      .catch((problem) => !cancelled && setState({ url: null, error: problem, loading: false }));

    return () => {
      cancelled = true;
    };
  }, [caseId, slot]);

  const isPdf = meta?.contentType === "application/pdf";

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-medium text-ink dark:text-ink-dark">{label}</span>
        {meta?.name && <span className="truncate text-[12px] text-ink-faint">{meta.name}</span>}
      </div>

      <div className="relative overflow-hidden rounded-field border border-line dark:border-line-dark bg-panel-muted dark:bg-[#141823]">
        {state.loading && (
          <div className="flex h-44 items-center justify-center text-brand">
            <Spinner size={20} />
          </div>
        )}

        {!state.loading && state.error && (
          <div className="flex h-44 flex-col items-center justify-center gap-2 text-ink-faint">
            <ImageOff size={20} />
            <p className="text-[12.5px]">Could not load this file.</p>
          </div>
        )}

        {!state.loading && state.url && isPdf && (
          <a
            href={state.url}
            target="_blank"
            rel="noreferrer noopener"
            className="flex h-44 flex-col items-center justify-center gap-2 text-ink-muted dark:text-ink-muted-dark hover:text-brand"
          >
            <FileText size={22} />
            <span className="text-[12.5px]">Open PDF</span>
          </a>
        )}

        {!state.loading && state.url && !isPdf && (
          <>
            <img src={state.url} alt={label} className="h-44 w-full object-contain" />
            <button
              type="button"
              onClick={() => setZoom(true)}
              aria-label={`Enlarge ${label}`}
              className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-field bg-black/60 text-white transition-colors hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
            >
              <Maximize2 size={14} />
            </button>
          </>
        )}
      </div>

      <Dialog open={zoom} onClose={() => setZoom(false)} title={label} size="lg">
        {state.url && <img src={state.url} alt={label} className="w-full rounded-field" />}
      </Dialog>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line dark:border-line-dark px-4 py-2.5 last:border-b-0">
      <dt className="w-[45%] shrink-0 text-[13px] text-ink-muted dark:text-ink-muted-dark">{label}</dt>
      <dd className="min-w-0 flex-1 text-[13.5px] text-ink dark:text-ink-dark">{value || "—"}</dd>
    </div>
  );
}

/**
 * Decision dialog.
 *
 * Approving needs no customer-facing reason. Requesting changes and
 * rejecting both do, because a decision the customer cannot act on is not
 * a useful decision. The internal note is optional and never leaves staff.
 */
function DecisionDialog({ open, decision, busy, onClose, onConfirm }) {
  const [reasonCode, setReasonCode] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setReasonCode(REASON_CODES[decision]?.[0]?.value || "");
    setReason("");
    setNote("");
    setError("");
  }, [open, decision]);

  const needsReason = decision !== "approve";
  const titles = {
    approve: "Approve this identity check",
    request_changes: "Ask for changes",
    reject: "Reject this identity check",
  };

  const confirm = () => {
    if (needsReason && reason.trim().length < MIN_REASON) {
      setError(`Give the customer a reason of at least ${MIN_REASON} characters.`);
      return;
    }
    onConfirm({ reasonCode, customerReason: reason.trim(), internalNote: note.trim() });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={titles[decision] || "Record a decision"}
      description={
        decision === "approve"
          ? "This records Arifcard's own review. It is not a government confirmation and does not approve a card."
          : "The customer sees your reason and can submit again."
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant={decision === "reject" ? "danger" : "primary"} loading={busy} onClick={confirm}>
            Confirm
          </Button>
        </>
      }
    >
      <SelectInput
        label="Reason code"
        required
        value={reasonCode}
        onChange={(event) => setReasonCode(event.target.value)}
        options={REASON_CODES[decision] || []}
      />

      {needsReason && (
        <div className="mt-4">
          <TextArea
            label="Message to the customer"
            required
            rows={4}
            hint={`At least ${MIN_REASON} characters. Shown to them word for word.`}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            error={error}
          />
        </div>
      )}

      <div className="mt-4">
        <TextArea
          label="Internal note (optional)"
          rows={3}
          hint="Staff only. The customer never sees this."
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>
    </Dialog>
  );
}

export default function KycCasePage() {
  const { caseId } = useParams();
  const toast = useToast();
  const { data, error, loading, reload, setData } = useAsync(() => adminService.kycCase(caseId), [caseId]);

  const [decision, setDecision] = useState(null);
  const [busy, setBusy] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const record = data?.case || null;
  const decidable = record ? DECIDABLE.includes(record.kycStatus) : false;

  const claim = async () => {
    setClaiming(true);
    try {
      const { case: updated } = await adminService.claimCase(caseId);
      setData({ case: updated });
      toast.success("You are now reviewing this case.");
    } catch (problem) {
      toast.error(problem instanceof ApiError ? problem.message : "Could not claim this case.");
    } finally {
      setClaiming(false);
    }
  };

  const decide = async (payload) => {
    setBusy(true);
    try {
      const response = await adminService.decide(caseId, { decision, ...payload });
      setData({ case: response.case, notification: response.notification });
      setDecision(null);
      // Deliberately not "the customer has been notified": the email is
      // only queued at this point. The panel below reports what happened.
      toast.success("Decision saved. The customer's email is queued.");
    } catch (problem) {
      toast.error(problem instanceof ApiError ? problem.message : "Could not save the decision.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[220px] w-full" />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Could not load this case" message={error.message} onRetry={reload} />;
  }

  if (!record) {
    return <EmptyState title="Case not found" description="No case exists with that id." />;
  }

  const details = record.details || {};
  const files = record.submission?.files || {};

  return (
    <>
      <Link
        to="/kyc"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted dark:text-ink-muted-dark transition-colors hover:text-brand"
      >
        <ArrowLeft size={15} />
        Back to the queue
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">
            {record.customer?.name || "Unknown customer"}
          </h1>
          <p className="mt-1 text-[13px] text-ink-muted dark:text-ink-muted-dark">
            {record.customer?.email} · Case {record.id} · v{record.version || 1}
          </p>
        </div>
        <Badge tone={KYC_STATUS_TONE[record.kycStatus]}>{KYC_STATUS_LABEL[record.kycStatus]}</Badge>
      </div>

      <div className="mt-6 flex flex-col gap-5">
        {record.kycStatus === KYC_STATUS.PENDING && (
          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
                Claim this case so other reviewers know you are on it.
              </p>
              <Button loading={claiming} onClick={claim}>
                Start review
              </Button>
            </div>
          </Panel>
        )}

        <Panel title="Documents" description="Links expire in minutes and are issued to you alone.">
          {Object.keys(files).length === 0 ? (
            <p className="text-[13px] text-ink-muted dark:text-ink-muted-dark">Nothing was uploaded.</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {EVIDENCE_SLOTS.filter(({ slot }) => files[slot]).map(({ slot, label }) => (
                <EvidenceViewer
                  key={slot}
                  caseId={record.id}
                  slot={slot}
                  label={label}
                  meta={files[slot]}
                />
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Details the customer gave" padded={false}>
          <dl>
            <Row
              label="Document"
              value={record.documentType === "PASSPORT" ? "Passport" : "Fayda national ID"}
            />
            <Row label="First name" value={details.givenNames} />
            <Row label="Last name" value={details.surname} />
            {/* Named for the document in hand. Cases created before the
                field was renamed still carry faydaNumber. */}
            <Row
              label={record.documentType === "PASSPORT" ? "Passport number" : "FAN number"}
              value={details.documentNumber || details.faydaNumber}
            />
            <Row label="Date of birth" value={details.dateOfBirth} />
            {details.placeOfBirth && <Row label="Place of birth" value={details.placeOfBirth} />}
            <Row
              label="Address"
              value={[details.addressLine, details.city, details.region, details.country]
                .filter(Boolean)
                .join(", ")}
            />
            <Row label="Phone number" value={details.phone} />
            <Row label="Occupation" value={details.occupation} />
            <Row label="Employment" value={details.employmentStatus} />
            <Row label="Card purpose" value={details.cardPurpose} />
            <Row label="Annual income" value={details.annualIncome} />
            <Row label="Monthly income" value={details.monthlyIncome} />
            <Row label="Method" value={KYC_METHOD_LABEL[record.method] || record.method} />
            <Row
              label="Terms accepted"
              value={details.consentAcceptedAt ? new Date(details.consentAcceptedAt).toLocaleString() : "Not given"}
            />
          </dl>
        </Panel>

        {record.customerReason && (
          <Panel title="Sent to the customer" description="This wording is shown to them word for word.">
            <p className="text-[13.5px] leading-relaxed text-ink dark:text-ink-dark">
              {record.customerReason}
            </p>
          </Panel>
        )}

        <Panel title="Internal notes" description="Staff only. Never sent to the customer." padded={false}>
          <div className="flex items-center gap-2 border-b border-line dark:border-line-dark px-5 py-3">
            <Lock size={13} className="text-ink-faint" />
            <span className="text-[12px] text-ink-faint">
              Kept in a separate record the customer&apos;s own screens never read.
            </span>
          </div>
          {record.internalNotes?.length ? (
            <ul className="divide-y divide-line dark:divide-line-dark">
              {record.internalNotes.map((note) => (
                <li key={note.id} className="px-5 py-3.5">
                  <p className="text-[13.5px] text-ink dark:text-ink-dark">{note.body}</p>
                  <p className="mt-1 text-[12px] text-ink-faint">
                    {note.authorName} · {note.createdAt ? new Date(note.createdAt).toLocaleString() : ""}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-5 text-[13px] text-ink-muted dark:text-ink-muted-dark">
              No internal notes yet.
            </p>
          )}
        </Panel>

        {data?.notification && (
          <Panel title="Customer email" description="Sent separately. The decision stands either way.">
            <div className="flex flex-wrap items-center gap-3">
              <Mail size={15} className="text-ink-faint" />
              <Badge tone={data.notification.status === "sent" ? "ok" : data.notification.status === "failed" ? "danger" : "neutral"}>
                {data.notification.status === "sent" ? "Accepted by mail server" : data.notification.status}
              </Badge>
              {data.notification.attempts > 1 && (
                <span className="text-[12px] text-ink-faint">{data.notification.attempts} attempts</span>
              )}
            </div>
            {data.notification.status === "sent" && (
              <p className="mt-3 text-[12.5px] text-ink-faint">
                The mail server accepted the message. That is not the same as confirming it reached
                their inbox.
              </p>
            )}
          </Panel>
        )}

        <Panel title="Decision">
          {decidable ? (
            <>
              <p className="text-[13px] text-ink-muted dark:text-ink-muted-dark">
                Asking for changes or rejecting needs a reason the customer can act on.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Button icon={Check} disabled={busy} onClick={() => setDecision("approve")}>
                  Approve
                </Button>
                <Button
                  variant="secondary"
                  icon={AlertTriangle}
                  disabled={busy}
                  onClick={() => setDecision("request_changes")}
                >
                  Ask for changes
                </Button>
                <Button variant="danger" icon={X} disabled={busy} onClick={() => setDecision("reject")}>
                  Reject
                </Button>
              </div>
            </>
          ) : (
            <div className="text-[13.5px] text-ink dark:text-ink-dark">
              <p>
                Decided by <strong>{record.decision?.reviewerName || "—"}</strong>
                {record.decision?.decidedAt
                  ? ` on ${new Date(record.decision.decidedAt).toLocaleString()}`
                  : ""}
                {record.decision?.reasonCode ? ` — ${record.decision.reasonCode}` : ""}.
              </p>
              <p className="mt-1.5 text-[13px] text-ink-muted dark:text-ink-muted-dark">
                A decided case cannot be changed. The customer submits again, which creates a new
                version.
              </p>
            </div>
          )}
        </Panel>
      </div>

      <DecisionDialog
        open={Boolean(decision)}
        decision={decision}
        busy={busy}
        onClose={() => setDecision(null)}
        onConfirm={decide}
      />
    </>
  );
}
