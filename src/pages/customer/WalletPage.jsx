import { useCallback, useState } from "react";
import { Receipt, ArrowDownToLine } from "lucide-react";
import { Panel, Button, Badge, Skeleton, ErrorState, EmptyState } from "@addiscard/ui";
import { paymentService, PAYMENT_STATUS_LABEL, PAYMENT_STATUS_TONE, birr } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";
import { PaymentDialog } from "../../components/payments/PaymentDialog.jsx";

const METHOD_LABEL = {
  CBE: "CBE",
  TELEBIRR: "Telebirr",
};

const when = (iso) => (iso ? new Date(iso).toLocaleString() : null);

/** One fact about a payment, shown only when there is something to show. */
function Fact({ label, children }) {
  if (children === null || children === undefined || children === "") return null;
  return (
    <div className="flex gap-1.5">
      <dt className="text-ink-faint">{label}:</dt>
      <dd className="text-ink-muted dark:text-ink-muted-dark">{children}</dd>
    </div>
  );
}

export default function WalletPage() {
  const [payOpen, setPayOpen] = useState(false);
  const [resumeIntent, setResumeIntent] = useState(null);
  const load = useCallback(() => paymentService.listIntents(), []);
  const { data, error, loading, reload } = useAsync(load, []);

  const intents = data?.intents || [];

  const openNew = () => {
    setResumeIntent(null);
    setPayOpen(true);
  };
  const openResume = (intent) => {
    setResumeIntent(intent);
    setPayOpen(true);
  };

  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">Wallet</h1>
      <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
        Pay in birr with CBE or Telebirr, then give us your receipt details.
      </p>

      {/*
        No balance figure is shown. Verified payments are recorded in the
        ledger, but there is no balance view built on it yet, and a figure
        assembled here in the browser would be a number we made up about
        somebody's money.
      */}
      <div className="mt-6 rounded-panel border border-line dark:border-line-dark p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">Balance</p>
        <p className="mt-2 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
          Verified payments are recorded on your account. A balance summary is not shown here yet.
        </p>
        <div className="mt-5">
          <Button icon={ArrowDownToLine} onClick={openNew}>
            Add money
          </Button>
        </div>
      </div>

      <div className="mt-5">
        <Panel title="Payments" description="Each payment, what we checked, and what happens next." padded={false}>
          {loading && (
            <div className="p-5">
              <Skeleton className="h-[72px] w-full" />
            </div>
          )}

          {!loading && error && (
            <div className="p-5">
              <ErrorState title="Could not load your payments" message={error.message} onRetry={reload} />
            </div>
          )}

          {!loading && !error && intents.length === 0 && (
            <EmptyState
              icon={Receipt}
              title="No payments yet"
              description="Start one with Add money, pay it with CBE or Telebirr, then submit your receipt details."
            />
          )}

          {!loading && !error && intents.length > 0 && (
            <ul className="divide-y divide-line dark:divide-line-dark">
              {intents.map((intent) => {
                const last = intent.lastClaim;
                return (
                  <li key={intent.id} className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-line dark:bg-line-dark text-ink-muted">
                        <Receipt size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-medium text-ink dark:text-ink-dark">
                          {METHOD_LABEL[intent.method] || intent.method} · {intent.reference}
                        </p>
                        <p className="text-[12px] text-ink-faint">{new Date(intent.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2.5">
                        <Badge tone={PAYMENT_STATUS_TONE[intent.status] || "neutral"}>
                          {PAYMENT_STATUS_LABEL[intent.status] || intent.status}
                        </Badge>
                        <span className="font-mono text-[13.5px] text-ink dark:text-ink-dark">{birr(intent.amountMinor)}</span>
                      </div>
                    </div>

                    {(intent.message || last || intent.nextAction) && (
                      <div className="mt-3 ml-12 space-y-2 text-[12.5px]">
                        {intent.message ? <p className="text-ink dark:text-ink-dark">{intent.message}</p> : null}
                        {last?.customerMessage ? (
                          <p className="rounded-md bg-amber-50 px-2.5 py-1.5 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                            <strong>From our team:</strong> {last.customerMessage}
                          </p>
                        ) : null}
                        {last ? (
                          <dl className="grid gap-x-5 gap-y-0.5 sm:grid-cols-2">
                            <Fact label="Expected">{birr(intent.amountMinor)}</Fact>
                            <Fact label="You entered">{last.claimedAmountMinor != null ? birr(last.claimedAmountMinor) : null}</Fact>
                            <Fact label="Verified">{intent.verifiedAmountMinor != null ? birr(intent.verifiedAmountMinor) : null}</Fact>
                            <Fact label="Receipt">{last.tokenHint}</Fact>
                            <Fact label="Submitted">{when(last.submittedAt)}</Fact>
                            <Fact label={intent.status === "VERIFIED" ? "Verified at" : "Reviewed"}>{when(last.decidedAt)}</Fact>
                          </dl>
                        ) : null}
                        {intent.nextAction ? (
                          <p className="text-ink-muted dark:text-ink-muted-dark">
                            <strong>Next:</strong> {intent.nextAction}
                          </p>
                        ) : null}
                        {intent.canSubmitReceipt ? (
                          <Button variant="ghost" onClick={() => openResume(intent)}>
                            {last ? "Submit a different receipt" : "Submit receipt details"}
                          </Button>
                        ) : null}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      <PaymentDialog
        open={payOpen}
        resumeIntent={resumeIntent}
        onClose={() => {
          setPayOpen(false);
          setResumeIntent(null);
          reload();
        }}
      />
    </>
  );
}
