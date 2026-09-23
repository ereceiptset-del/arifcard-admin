import { useCallback } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowDownToLine, Clock, AlertTriangle } from "lucide-react";
import { Panel, Button, Badge, Skeleton, ErrorState } from "@addiscard/ui";
import { kycService, KYC_STATUS, KYC_STATUS_LABEL, KYC_STATUS_TONE } from "@addiscard/services";
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../hooks/useAsync.js";

/**
 * The customer's landing screen.
 *
 * Its job is to answer "what do I do next", which for almost everyone is
 * identity verification — nothing else can happen first. Previously this
 * page fetched a dashboard that does not exist and said only that it was
 * unavailable, which told a new customer nothing about the one action
 * open to them.
 *
 * There is still no balance here, and that is not an omission to be
 * filled in later with a placeholder: there is no ledger, so any figure
 * would be one we invented about somebody's money.
 */

/** What the customer should do, for each place they can be. */
const NEXT_STEP = {
  [KYC_STATUS.NOT_SUBMITTED]: {
    icon: ShieldCheck,
    title: "Verify your identity",
    body: "We verify who you are once, before your first card. It takes a few minutes and you will need your Fayda ID or passport.",
    action: { label: "Start verification", to: "/customer/verification" },
  },
  [KYC_STATUS.PENDING]: {
    icon: Clock,
    title: "Your documents are with a reviewer",
    body: "A person is checking what you sent. You cannot change a submission while it is under review — we will email you when there is a decision.",
    action: { label: "See your submission", to: "/customer/verification" },
  },
  [KYC_STATUS.UNDER_REVIEW]: {
    icon: Clock,
    title: "Your documents are being reviewed",
    body: "A reviewer has your submission open. We will email you when there is a decision.",
    action: { label: "See your submission", to: "/customer/verification" },
  },
  [KYC_STATUS.CHANGES_REQUESTED]: {
    icon: AlertTriangle,
    title: "We need something changed",
    body: "A reviewer has asked for a change before we can verify you.",
    action: { label: "See what is needed", to: "/customer/verification" },
  },
  [KYC_STATUS.REJECTED]: {
    icon: AlertTriangle,
    title: "Your verification was not accepted",
    body: "A reviewer could not verify your identity from what was sent. You can send a new submission.",
    action: { label: "See the reason", to: "/customer/verification" },
  },
  [KYC_STATUS.APPROVED]: {
    icon: ArrowDownToLine,
    title: "You are verified",
    body: "You can pay in birr with CBE or Telebirr and submit the receipt number. Funding a card is a separate step and is not available yet.",
    action: { label: "Add money", to: "/customer/wallet" },
  },
};

export default function HomePage() {
  const { user } = useAuth();
  const load = useCallback(() => kycService.currentCase(), []);
  const { data, error, loading, reload } = useAsync(load, []);

  const firstName = (user?.fullName || "there").split(" ")[0];
  const kycStatus = data?.kycStatus || data?.case?.kycStatus || KYC_STATUS.NOT_SUBMITTED;
  const customerReason = data?.case?.customerReason;

  const step = NEXT_STEP[kycStatus] || NEXT_STEP[KYC_STATUS.NOT_SUBMITTED];
  const Icon = step.icon;

  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">
        Welcome, {firstName}
      </h1>
      <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
        A USD card you top up in birr.
      </p>

      {loading && <Skeleton className="mt-6 h-[180px] w-full" />}

      {!loading && error && (
        <div className="mt-6">
          <ErrorState title="Could not load your account" message={error.message} onRetry={reload} />
        </div>
      )}

      {!loading && !error && (
        <>
          <Panel className="mt-6">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[15px] font-semibold text-ink dark:text-ink-dark">{step.title}</h2>
                  <Badge tone={KYC_STATUS_TONE[kycStatus]}>{KYC_STATUS_LABEL[kycStatus]}</Badge>
                </div>
                <p className="mt-1.5 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">{step.body}</p>

                {/* The reviewer's own words, when they asked for something.
                    Paraphrasing it here would risk saying something the
                    reviewer did not mean. */}
                {customerReason && (
                  <p className="mt-3 rounded-panel border border-line dark:border-line-dark px-3 py-2 text-[13px] text-ink dark:text-ink-dark">
                    {customerReason}
                  </p>
                )}

                <div className="mt-4">
                  <Link to={step.action.to}>
                    <Button>{step.action.label}</Button>
                  </Link>
                </div>
              </div>
            </div>
          </Panel>

          <Panel className="mt-5" title="Your balance">
            <p className="text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
              Not available yet. We can check a payment receipt and record it, but crediting a balance is a
              separate step that is not built — so there is no figure to show.
            </p>
          </Panel>
        </>
      )}
    </>
  );
}
