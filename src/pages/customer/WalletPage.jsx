import { useCallback, useState } from "react";
import { Receipt, ArrowDownToLine } from "lucide-react";
import { Panel, Button, Badge, Skeleton, ErrorState, EmptyState } from "@addiscard/ui";
import {
  paymentService,
  INTENT_STATUS,
  birr,
} from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";
import { PaymentDialog } from "../../components/payments/PaymentDialog.jsx";

const METHOD_LABEL = {
  CBE: "CBE",
  TELEBIRR: "Telebirr",
};

const INTENT_TONE = {
  [INTENT_STATUS.AWAITING_CLAIM]: "warn",
  [INTENT_STATUS.CLAIMED]: "ok",
  [INTENT_STATUS.CANCELLED]: "neutral",
  [INTENT_STATUS.EXPIRED]: "neutral",
};

const INTENT_LABEL = {
  [INTENT_STATUS.AWAITING_CLAIM]: "Waiting for receipt",
  [INTENT_STATUS.CLAIMED]: "Receipt matched",
  [INTENT_STATUS.CANCELLED]: "Cancelled",
  [INTENT_STATUS.EXPIRED]: "Expired",
};

export default function WalletPage() {
  const [payOpen, setPayOpen] = useState(false);
  const load = useCallback(() => paymentService.listIntents(), []);
  const { data, error, loading, reload } = useAsync(load, []);

  const intents = data?.intents || [];

  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">Wallet</h1>
      <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
        Pay in birr with CBE or Telebirr, then tell us the receipt number.
      </p>

      {/*
        No balance is shown, and this is not an oversight to be filled in
        later with a placeholder. There is no ledger behind this screen, so
        any figure here would be a number we made up about somebody's
        money. The empty state says which of the two it is.
      */}
      <div className="mt-6 rounded-panel border border-line dark:border-line-dark p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">Balance</p>
        <p className="mt-2 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
          Not available yet. We can check a payment receipt and record it, but crediting a balance is a
          separate step that is not built — so there is no figure to show.
        </p>
        <div className="mt-5">
          <Button icon={ArrowDownToLine} onClick={() => setPayOpen(true)}>
            Add money
          </Button>
        </div>
      </div>

      <div className="mt-5">
        <Panel
          title="Payments"
          description="What you told us you would pay, and whether the receipt matched."
          padded={false}
        >
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
              description="Start one with Add money, pay it with CBE or Telebirr, then enter the receipt number."
            />
          )}

          {!loading && !error && intents.length > 0 && (
            <ul className="divide-y divide-line dark:divide-line-dark">
              {intents.map((intent) => (
                <li key={intent.id} className="flex items-center gap-3 px-5 py-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-line dark:bg-line-dark text-ink-muted">
                    <Receipt size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-ink dark:text-ink-dark">
                      {METHOD_LABEL[intent.method] || intent.method} · {intent.reference}
                    </p>
                    <p className="text-[12px] text-ink-faint">
                      {new Date(intent.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5">
                    <Badge tone={INTENT_TONE[intent.status] || "neutral"}>
                      {INTENT_LABEL[intent.status] || intent.status}
                    </Badge>
                    <span className="font-mono text-[13.5px] text-ink dark:text-ink-dark">
                      {birr(intent.amountMinor)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <PaymentDialog
        open={payOpen}
        onClose={() => {
          setPayOpen(false);
          reload();
        }}
      />
    </>
  );
}
