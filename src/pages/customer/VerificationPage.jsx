import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Panel,
  Button,
  Badge,
  Stepper,
  Skeleton,
  ErrorState,
  TextInput,
  SelectInput,
  Checkbox,
  useToast,
} from "@addiscard/ui";
import {
  kycService,
  KYC_STATUS,
  KYC_STATUS_LABEL,
  KYC_STATUS_TONE,
  EDITABLE_STATUSES,
  DOCUMENT_TYPE,
  SLOT_COPY,
  ApiError,
} from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";
import { EvidenceUpload } from "../../components/kyc/EvidenceUpload.jsx";

/**
 * Identity verification, in five steps.
 *
 * Verified once, before the first card. A person reviews what is
 * submitted here — this is not an automated identity check and nothing on
 * this screen contacts Fayda or any registry, which is why the wording
 * never claims it does.
 *
 * The steps mirror the order the customer can actually complete them in:
 * the document first, because it decides which files are needed, then the
 * selfie, then what is written on the document, then how the card will be
 * used, then everything together before it goes.
 */

const STEPS = ["Your document", "Your selfie", "Your details", "Card usage details", "Review and submit"];

const emptyDetails = {
  documentType: DOCUMENT_TYPE.FAYDA,
  givenNames: "",
  surname: "",
  documentNumber: "",
  dateOfBirth: "",
  addressLine: "",
  city: "",
  region: "",
  country: "Ethiopia",
  phone: "",
  occupation: "",
  employmentStatus: "",
  cardPurpose: "",
  annualIncome: "",
  monthlyIncome: "",
  placeOfBirth: "",
};

export default function VerificationPage() {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [consent, setConsent] = useState(false);
  const [problems, setProblems] = useState([]);
  const [form, setForm] = useState(emptyDetails);

  const load = useCallback(async () => {
    const [{ case: record }, options] = await Promise.all([
      kycService.currentCase(),
      kycService.options(),
    ]);
    return { record, options };
  }, []);

  const { data, error, loading, reload } = useAsync(load, []);
  const [record, setRecord] = useState(null);

  const kycCase = record || data?.record || null;
  const options = data?.options || null;

  // Seed the form from the saved case once it arrives, so a customer who
  // comes back does not retype what they already entered.
  useEffect(() => {
    const source = data?.record;
    if (!source) return;
    setForm({ ...emptyDetails, ...source.details, documentType: source.documentType || DOCUMENT_TYPE.FAYDA });
    setConsent(Boolean(source.details?.consentAcceptedAt));
  }, [data?.record]);

  const editable = kycCase ? EDITABLE_STATUSES.includes(kycCase.kycStatus) : true;
  const files = kycCase?.submission?.files || {};
  const requiredSlots = kycCase?.requiredSlots || [];

  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const pick = (name) =>
    (options?.[name] || []).map((value) => ({ value, label: value }));

  /** Saves the current step's answers. Nothing advances until it sticks. */
  async function save(patch) {
    if (!kycCase) return false;
    setSaving(true);
    setProblems([]);
    try {
      const { case: updated } = await kycService.saveDetails(kycCase.id, patch);
      setRecord(updated);
      return true;
    } catch (problem) {
      toast.error(problem instanceof ApiError ? problem.message : "Could not save that.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function startIfNeeded() {
    if (kycCase) return kycCase;
    const { case: created } = await kycService.startCase();
    setRecord(created);
    return created;
  }

  useEffect(() => {
    if (!loading && !error && !data?.record) startIfNeeded().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, data?.record]);

  async function submit() {
    setSaving(true);
    setProblems([]);
    try {
      const { case: updated } = await kycService.submit(kycCase.id);
      setRecord(updated);
      toast.success("Sent for review.");
    } catch (problem) {
      // The backend returns everything that is missing, not just the
      // first thing, so the customer can fix it all in one pass.
      if (problem instanceof ApiError && problem.problems?.length) setProblems(problem.problems);
      else toast.error(problem instanceof ApiError ? problem.message : "Could not submit.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <Skeleton className="mt-6 h-[320px] w-full" />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="mt-6">
          <ErrorState title="Could not load verification" message={error.message} onRetry={reload} />
        </div>
      </>
    );
  }

  // Already with a reviewer, or already decided: the wizard is not the
  // right thing to show. Editing a submission under review is refused by
  // the backend anyway, and offering the form would invite the attempt.
  if (kycCase && !editable) {
    return (
      <>
        <Header />
        <Panel className="mt-6">
          <div className="flex items-center gap-2">
            <Badge tone={KYC_STATUS_TONE[kycCase.kycStatus]}>{KYC_STATUS_LABEL[kycCase.kycStatus]}</Badge>
          </div>
          <p className="mt-3 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
            {kycCase.kycStatus === KYC_STATUS.APPROVED
              ? "Your identity has been verified. You can now make a payment."
              : "A reviewer is looking at your submission. You cannot change it while it is under review."}
          </p>
        </Panel>
      </>
    );
  }

  if (!kycCase) {
    return (
      <>
        <Header />
        <Skeleton className="mt-6 h-[320px] w-full" />
      </>
    );
  }

  const slotsFor = (names) => requiredSlots.filter((slot) => names.includes(slot));
  const documentSlots = slotsFor(["faydaFront", "faydaBack", "passportBiodata"]);
  const selfieSlots = slotsFor(["selfie"]);

  const documentReady = documentSlots.every((slot) => files[slot]);
  const selfieReady = selfieSlots.every((slot) => files[slot]);
  const detailsReady =
    form.givenNames && form.surname && form.documentNumber && form.dateOfBirth &&
    form.addressLine && form.city && form.region && form.country;
  const usageReady =
    form.phone && form.occupation && form.employmentStatus && form.cardPurpose &&
    form.annualIncome && form.monthlyIncome && consent;

  return (
    <>
      <Header />

      <Panel className="mt-6">
        <Stepper title={STEPS[step]} current={step + 1} total={STEPS.length} />

        <div className="mt-5">
          {step === 0 && (
            <>
              <p className="text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
                Choose the document you will send, then upload it.
              </p>

              <fieldset className="mt-4">
                <legend className="text-[13px] font-medium text-ink dark:text-ink-dark">Document type</legend>
                <div className="mt-2 flex flex-col gap-2">
                  {(options?.documentTypes || []).map((option) => (
                    <label key={option.value} className="flex items-center gap-2.5 text-[13.5px]">
                      <input
                        type="radio"
                        name="documentType"
                        value={option.value}
                        checked={form.documentType === option.value}
                        onChange={async () => {
                          setForm((current) => ({ ...current, documentType: option.value }));
                          // Saved immediately: it decides which uploads
                          // are asked for, and switching after uploading
                          // clears files the new document does not use.
                          await save({ documentType: option.value });
                        }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="mt-5 flex flex-col gap-4">
                {documentSlots.map((slot) => (
                  <EvidenceUpload
                    key={slot}
                    caseId={kycCase.id}
                    slot={slot}
                    label={SLOT_COPY[slot]?.label || slot}
                    hint={SLOT_COPY[slot]?.hint}
                    file={files[slot]}
                    onChanged={setRecord}
                  />
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <p className="text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
                Take or choose a clear photo of your face, without a hat or sunglasses, in good light.
              </p>
              {/*
                Called a photo, because that is what it is. It is not a
                liveness check and does not prove anyone was present.
              */}
              <div className="mt-4">
                {selfieSlots.map((slot) => (
                  <EvidenceUpload
                    key={slot}
                    caseId={kycCase.id}
                    slot={slot}
                    label={SLOT_COPY[slot]?.label || slot}
                    hint={SLOT_COPY[slot]?.hint}
                    file={files[slot]}
                    onChanged={setRecord}
                  />
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
                Enter your details exactly as they appear on the document.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <TextInput label="First name" required value={form.givenNames} onChange={set("givenNames")} />
                <TextInput label="Last name" required value={form.surname} onChange={set("surname")} />
              </div>
              <div className="mt-4">
                <TextInput
                  label="ID number"
                  required
                  value={form.documentNumber}
                  onChange={set("documentNumber")}
                  placeholder={
                    form.documentType === DOCUMENT_TYPE.PASSPORT
                      ? "Enter your passport number."
                      : "Enter the FAN number shown on the front of your ID."
                  }
                />
              </div>
              <div className="mt-4">
                <TextInput
                  label="Date of birth"
                  required
                  type="date"
                  value={form.dateOfBirth}
                  onChange={set("dateOfBirth")}
                  hint={`You must be at least ${options?.minimumAge ?? 18} to get a card.`}
                />
              </div>
              <div className="mt-4">
                <TextInput label="Street address" required value={form.addressLine} onChange={set("addressLine")} />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <TextInput label="City" required value={form.city} onChange={set("city")} />
                <TextInput label="Region" required value={form.region} onChange={set("region")} />
                <TextInput label="Country" required value={form.country} onChange={set("country")} />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
                These details are needed to complete your card verification.
              </p>
              <div className="mt-4">
                <TextInput
                  label="Phone number"
                  required
                  inputMode="tel"
                  placeholder="+251"
                  value={form.phone}
                  onChange={set("phone")}
                />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <TextInput label="Occupation" required value={form.occupation} onChange={set("occupation")} />
                <SelectInput
                  label="Employment status"
                  required
                  placeholder="Select an option"
                  options={pick("employmentStatus")}
                  value={form.employmentStatus}
                  onChange={set("employmentStatus")}
                />
              </div>
              <div className="mt-4">
                <SelectInput
                  label="Purpose of the card"
                  required
                  placeholder="Select an option"
                  options={pick("cardPurpose")}
                  value={form.cardPurpose}
                  onChange={set("cardPurpose")}
                />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <SelectInput
                  label="Annual income"
                  required
                  placeholder="Select an option"
                  options={pick("annualIncome")}
                  value={form.annualIncome}
                  onChange={set("annualIncome")}
                />
                <SelectInput
                  label="Monthly income"
                  required
                  placeholder="Select an option"
                  options={pick("monthlyIncome")}
                  value={form.monthlyIncome}
                  onChange={set("monthlyIncome")}
                />
              </div>
              <div className="mt-4">
                <TextInput
                  label="Place of birth (optional)"
                  value={form.placeOfBirth}
                  onChange={set("placeOfBirth")}
                />
              </div>
              <div className="mt-5">
                <Checkbox
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  label="I accept the terms of service for identity verification and card issuance."
                />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <p className="text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
                Check everything before you submit. You cannot change a submission while it is under review.
              </p>

              <dl className="mt-4 rounded-panel border border-line dark:border-line-dark">
                <Row label="Document" value={form.documentType === DOCUMENT_TYPE.PASSPORT ? "Passport" : "Fayda national ID"} />
                <Row label="ID number" value={form.documentNumber} />
                <Row label="Name" value={`${form.givenNames} ${form.surname}`.trim()} />
                <Row label="Date of birth" value={form.dateOfBirth} />
                <Row label="Address" value={[form.addressLine, form.city, form.region, form.country].filter(Boolean).join(", ")} />
                <Row label="Occupation" value={form.occupation} />
                <Row label="Phone number" value={form.phone} />
                <Row label="Employment" value={form.employmentStatus} />
                <Row label="Card purpose" value={form.cardPurpose} />
                <Row label="Annual income" value={form.annualIncome} />
                <Row label="Monthly income" value={form.monthlyIncome} />
                {form.placeOfBirth && <Row label="Place of birth" value={form.placeOfBirth} />}
                <Row label="Terms" value={consent ? "Accepted" : "Not accepted"} />
                <Row
                  label="Files"
                  value={requiredSlots.filter((slot) => files[slot]).map((slot) => SLOT_COPY[slot]?.label || slot).join(", ") || "None"}
                />
              </dl>

              {problems.length > 0 && (
                <div className="mt-4 rounded-panel border border-danger/25 bg-danger/5 px-4 py-3">
                  <p className="text-[13px] font-medium text-danger">Still missing</p>
                  <ul className="mt-1.5 list-disc pl-5 text-[12.5px] text-ink dark:text-ink-dark">
                    {problems.map((problem) => (
                      <li key={problem}>{problem}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || saving}>
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              loading={saving}
              disabled={
                (step === 0 && !documentReady) ||
                (step === 1 && !selfieReady) ||
                (step === 2 && !detailsReady) ||
                (step === 3 && !usageReady)
              }
              onClick={async () => {
                // Saved on the way forward, so a dropped connection later
                // does not cost the customer everything they typed.
                if (step === 2) {
                  const ok = await save({
                    givenNames: form.givenNames,
                    surname: form.surname,
                    documentNumber: form.documentNumber,
                    dateOfBirth: form.dateOfBirth,
                    addressLine: form.addressLine,
                    city: form.city,
                    region: form.region,
                    country: form.country,
                  });
                  if (!ok) return;
                }
                if (step === 3) {
                  const ok = await save({
                    phone: form.phone,
                    occupation: form.occupation,
                    employmentStatus: form.employmentStatus,
                    cardPurpose: form.cardPurpose,
                    annualIncome: form.annualIncome,
                    monthlyIncome: form.monthlyIncome,
                    placeOfBirth: form.placeOfBirth || undefined,
                    consentAccepted: consent,
                  });
                  if (!ok) return;
                }
                setStep((s) => s + 1);
              }}
            >
              Continue
            </Button>
          ) : (
            <Button loading={saving} onClick={submit}>
              Submit for review
            </Button>
          )}
        </div>
      </Panel>
    </>
  );
}

function Header() {
  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">
        Identity verification
      </h1>
      <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
        We verify who you are once, before your first card. A person reviews what you send.
      </p>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line dark:border-line-dark px-4 py-2.5 last:border-b-0">
      <dt className="text-[13px] text-ink-muted dark:text-ink-muted-dark">{label}</dt>
      <dd className="text-right text-[13px] text-ink dark:text-ink-dark">{value || "—"}</dd>
    </div>
  );
}
