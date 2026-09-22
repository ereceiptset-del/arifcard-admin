import { useCallback, useEffect, useRef, useState } from "react";
import { ShieldCheck, Upload, X, Clock, BadgeCheck, AlertTriangle, CircleX, FileText } from "lucide-react";
import {
  Panel,
  Button,
  Badge,
  Skeleton,
  ErrorState,
  EmptyState,
  TextInput,
  Checkbox,
  DemoNotice,
  useToast,
} from "@addiscard/ui";
import {
  kycService,
  ApiError,
  KYC_STATUS,
  KYC_STATUS_LABEL,
  KYC_STATUS_TONE,
  EDITABLE_STATUSES,
  EVIDENCE_SLOTS,
  ACCEPTED_TYPES,
} from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";

const ACCEPT_ATTR = ACCEPTED_TYPES.join(",");

const formatBytes = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

/**
 * One evidence slot.
 *
 * The file goes straight from the browser to Cloud Storage through a
 * signed URL, so progress is real rather than a spinner, and a failure can
 * be retried without re-entering anything else.
 */
function EvidenceField({ slot, label, required, file, caseId, disabled, onChanged }) {
  const toast = useToast();
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");

  const upload = async (chosen) => {
    setError("");
    if (!ACCEPTED_TYPES.includes(chosen.type)) {
      setError("Upload a JPEG, PNG or PDF.");
      return;
    }

    setProgress(0);
    try {
      const ticket = await kycService.requestUpload(caseId, {
        slot,
        contentType: chosen.type,
        declaredBytes: chosen.size,
      });

      await kycService.uploadToSignedUrl({
        uploadUrl: ticket.uploadUrl,
        file: chosen,
        contentType: chosen.type,
        onProgress: setProgress,
      });

      // The backend re-reads the stored bytes and validates them; only a
      // proven-good object is recorded.
      const { case: updated } = await kycService.finalizeUpload(caseId, {
        slot,
        fileId: ticket.fileId,
        path: ticket.path,
        contentType: chosen.type,
        name: chosen.name,
      });
      onChanged(updated);
      toast.success(`${label} uploaded.`);
    } catch (problem) {
      setError(problem instanceof ApiError ? problem.message : problem.message || "Upload failed.");
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async () => {
    setError("");
    try {
      const { case: updated } = await kycService.removeUpload(caseId, slot);
      onChanged(updated);
    } catch (problem) {
      setError(problem instanceof ApiError ? problem.message : "Could not remove that file.");
    }
  };

  const busy = progress !== null;

  return (
    <div className="rounded-field border border-line dark:border-line-dark p-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-medium text-ink dark:text-ink-dark">
          {label}
          {required && <span className="ml-1 text-danger">*</span>}
        </span>
        {file && <span className="text-[12px] text-ink-faint">{formatBytes(file.size)}</span>}
      </div>

      {file ? (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-field bg-panel-muted dark:bg-white/5 px-3 py-2.5">
          <span className="flex min-w-0 items-center gap-2">
            <FileText size={15} className="shrink-0 text-ink-faint" />
            <span className="truncate text-[13px] text-ink dark:text-ink-dark">
              {file.name || "Uploaded"}
            </span>
          </span>
          {!disabled && (
            <button
              type="button"
              onClick={remove}
              aria-label={`Remove ${label}`}
              className="shrink-0 rounded p-1 text-ink-faint transition-colors hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              <X size={15} />
            </button>
          )}
        </div>
      ) : (
        <div className="mt-3">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_ATTR}
            className="sr-only"
            id={`upload-${slot}`}
            disabled={disabled || busy}
            onChange={(event) => event.target.files?.[0] && upload(event.target.files[0])}
          />
          <label
            htmlFor={`upload-${slot}`}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-field border border-dashed px-4 py-4 text-[13px] transition-colors ${
              disabled || busy
                ? "cursor-not-allowed border-line text-ink-faint"
                : "border-line-strong dark:border-line-strong-dark text-ink-muted dark:text-ink-muted-dark hover:border-brand/60 hover:text-brand"
            }`}
          >
            <Upload size={15} />
            {busy ? `Uploading… ${progress}%` : "Choose a file"}
          </label>
        </div>
      )}

      {busy && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-panel-muted dark:bg-white/10">
          <div className="h-full bg-brand transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-[12.5px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** Read-only view once a submission is with a reviewer or decided. */
function StatusView({ record, onStartOver }) {
  const decidedAt = record.decidedAt ? new Date(record.decidedAt).toLocaleString() : null;

  if (record.kycStatus === KYC_STATUS.APPROVED) {
    return (
      <Panel>
        <div className="py-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ok/10 text-ok">
            <BadgeCheck size={22} />
          </span>
          <h2 className="text-[16px] font-semibold text-ink dark:text-ink-dark">
            Your identity check was approved
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
            Approved by the Arifcard team{decidedAt ? ` on ${decidedAt}` : ""}. This covers
            Arifcard&apos;s own review — it is not a government identity confirmation, and it does
            not approve a card with any issuing partner.
          </p>
        </div>
      </Panel>
    );
  }

  if ([KYC_STATUS.PENDING, KYC_STATUS.UNDER_REVIEW].includes(record.kycStatus)) {
    return (
      <Panel>
        <div className="py-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-info/10 text-info">
            <Clock size={22} />
          </span>
          <h2 className="text-[16px] font-semibold text-ink dark:text-ink-dark">
            {record.kycStatus === KYC_STATUS.UNDER_REVIEW
              ? "Someone is reviewing your documents"
              : "Your documents are waiting for review"}
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
            {record.submittedAt ? `Submitted ${new Date(record.submittedAt).toLocaleString()}. ` : ""}
            We will email you when it is decided. You cannot change a submission while it is being
            reviewed.
          </p>
        </div>
      </Panel>
    );
  }

  const rejected = record.kycStatus === KYC_STATUS.REJECTED;
  return (
    <Panel>
      <div className="py-6">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              rejected ? "bg-danger/10 text-danger" : "bg-warn/10 text-warn"
            }`}
          >
            {rejected ? <CircleX size={20} /> : <AlertTriangle size={20} />}
          </span>
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold text-ink dark:text-ink-dark">
              {rejected ? "Your identity check was not approved" : "We need something changed"}
            </h2>
            {record.customerReason && (
              <div className="mt-3 rounded-field border border-warn/30 bg-warn/5 px-4 py-3">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-warn">
                  What to change
                </p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink dark:text-ink-dark">
                  {record.customerReason}
                </p>
              </div>
            )}
            {decidedAt && <p className="mt-3 text-[12px] text-ink-faint">Reviewed {decidedAt}.</p>}
            <div className="mt-5">
              <Button onClick={onStartOver}>Upload again</Button>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

export default function VerificationPage() {
  const toast = useToast();
  const { data, error, loading, reload, setData } = useAsync(() => kycService.currentCase(), []);
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [details, setDetails] = useState({});
  const [consent, setConsent] = useState(false);
  const [problems, setProblems] = useState([]);

  const record = data?.case || null;
  const status = record?.kycStatus || data?.kycStatus || KYC_STATUS.NOT_SUBMITTED;
  const editable = EDITABLE_STATUSES.includes(status);
  const files = record?.submission?.files || {};

  useEffect(() => {
    if (record?.details) setDetails(record.details);
  }, [record?.id, record?.details]);

  // While a submission is with a reviewer, refresh so the decision appears
  // without the customer having to reload.
  const awaitingDecision = [KYC_STATUS.PENDING, KYC_STATUS.UNDER_REVIEW].includes(status);
  useEffect(() => {
    if (!awaitingDecision) return undefined;
    const timer = setInterval(reload, 20000);
    const onFocus = () => reload();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [awaitingDecision, reload]);

  const applyCase = useCallback((updated) => setData((prev) => ({ ...prev, case: updated })), [setData]);

  const start = async () => {
    setStarting(true);
    try {
      const { case: created } = await kycService.startCase();
      applyCase(created);
      setResuming(true);
    } catch (problem) {
      toast.error(problem instanceof ApiError ? problem.message : "Could not start verification.");
    } finally {
      setStarting(false);
    }
  };

  const saveField = async (field, value) => {
    const next = { ...details, [field]: value };
    setDetails(next);
    try {
      const { case: updated } = await kycService.saveDetails(record.id, { [field]: value });
      applyCase(updated);
    } catch (problem) {
      toast.error(problem instanceof ApiError ? problem.message : "Could not save that.");
    }
  };

  const acceptConsent = async (checked) => {
    setConsent(checked);
    try {
      const { case: updated } = await kycService.saveDetails(record.id, { consentAccepted: checked });
      applyCase(updated);
    } catch (problem) {
      toast.error(problem instanceof ApiError ? problem.message : "Could not record consent.");
    }
  };

  const submit = async () => {
    setSaving(true);
    setProblems([]);
    try {
      const { case: updated } = await kycService.submit(record.id);
      applyCase(updated);
      setResuming(false);
      toast.success("Submitted. We will email you when it is reviewed.");
    } catch (problem) {
      if (problem instanceof ApiError && problem.problems?.length) setProblems(problem.problems);
      else toast.error(problem instanceof ApiError ? problem.message : "Could not submit.");
    } finally {
      setSaving(false);
    }
  };

  const showForm = editable && (resuming || status === KYC_STATUS.NOT_SUBMITTED) && record;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">
            Identity verification
          </h1>
          <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
            We check who you are once, before you can add money or get a card.
          </p>
        </div>
        <Badge tone={KYC_STATUS_TONE[status]}>{KYC_STATUS_LABEL[status]}</Badge>
      </div>

      <div className="mt-6 flex flex-col gap-5">
        <DemoNotice>
          Your documents are reviewed by a member of the Arifcard team. Nothing is checked against a
          government registry, and approval here is not a card issuer&apos;s approval.
        </DemoNotice>

        {loading && <Skeleton className="h-[320px] w-full" />}

        {!loading && error && (
          <ErrorState title="Could not load your verification" message={error.message} onRetry={reload} />
        )}

        {!loading && !error && !record && (
          <Panel>
            <div className="py-8 text-center">
              <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                <ShieldCheck size={22} />
              </span>
              <h2 className="text-[16px] font-semibold text-ink dark:text-ink-dark">
                Verify your identity
              </h2>
              <p className="mx-auto mt-1.5 max-w-md text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
                Upload the front and back of your Fayda ID and confirm a few details.
              </p>
              <div className="mt-6">
                <Button loading={starting} onClick={start}>
                  Start
                </Button>
              </div>
            </div>
          </Panel>
        )}

        {!loading && !error && record && !showForm && (
          <StatusView
            record={{ ...record, kycStatus: status }}
            onStartOver={async () => {
              await start();
              setResuming(true);
            }}
          />
        )}

        {showForm && (
          <>
            <Panel title="Your details" description="Exactly as they appear on your ID.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextInput
                  label="Given names"
                  required
                  value={details.givenNames || ""}
                  onChange={(event) => setDetails({ ...details, givenNames: event.target.value })}
                  onBlur={(event) => saveField("givenNames", event.target.value)}
                />
                <TextInput
                  label="Surname"
                  required
                  value={details.surname || ""}
                  onChange={(event) => setDetails({ ...details, surname: event.target.value })}
                  onBlur={(event) => saveField("surname", event.target.value)}
                />
                <TextInput
                  label="Fayda number"
                  required
                  value={details.faydaNumber || ""}
                  onChange={(event) => setDetails({ ...details, faydaNumber: event.target.value })}
                  onBlur={(event) => saveField("faydaNumber", event.target.value)}
                />
                <TextInput
                  label="Date of birth"
                  type="date"
                  required
                  value={details.dateOfBirth || ""}
                  onChange={(event) => saveField("dateOfBirth", event.target.value)}
                />
              </div>
            </Panel>

            <Panel
              title="Your documents"
              description="JPEG, PNG or PDF, up to 10 MB each. Only Arifcard staff reviewing your case can see them."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {EVIDENCE_SLOTS.map(({ slot, label, required }) => (
                  <EvidenceField
                    key={slot}
                    slot={slot}
                    label={label}
                    required={required}
                    file={files[slot]}
                    caseId={record.id}
                    disabled={saving}
                    onChanged={applyCase}
                  />
                ))}
              </div>
              <p className="mt-4 text-[12px] text-ink-faint">
                The passport page and photo are optional extra evidence. Your photo is an ordinary
                upload, not a liveness check.
              </p>
            </Panel>

            <Panel>
              <Checkbox
                label="I confirm these documents are mine and agree to Arifcard reviewing them to verify my identity."
                checked={Boolean(details.consentAcceptedAt) || consent}
                onChange={acceptConsent}
              />

              {problems.length > 0 && (
                <div className="mt-4 rounded-field border border-danger/30 bg-danger/5 px-4 py-3">
                  <p className="text-[12.5px] font-semibold text-danger">Still to do</p>
                  <ul className="mt-1.5 list-inside list-disc text-[13px] text-ink dark:text-ink-dark">
                    {problems.map((problem) => (
                      <li key={problem}>{problem}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-5 flex justify-end">
                <Button loading={saving} onClick={submit}>
                  Submit for review
                </Button>
              </div>
            </Panel>
          </>
        )}

        {!loading && !error && !record && data?.kycStatus === KYC_STATUS.NOT_SUBMITTED && (
          <EmptyState
            title="Nothing submitted yet"
            description="Once you submit, this page shows where your check has got to."
            dashed
          />
        )}
      </div>
    </>
  );
}
