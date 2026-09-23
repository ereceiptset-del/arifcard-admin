import { useState } from "react";
import { Receipt, ArrowDownToLine, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import {
  Panel,
  Button,
  Badge,
  Skeleton,
  ErrorState,
  EmptyState,
  DemoNotice,
  TextInput,
  Dialog,
} from "@addiscard/ui";
import { customerService, isUnavailable } from "@addiscard/services";
import { PaymentDialog } from "../../components/payments/PaymentDialog.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { ServiceHoldNotice } from "../../components/ServiceHoldNotice.jsx";

const money = (value, currency = "USD") =>
  `${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;

const etb = (value) =>
  `${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;

export default function WalletPage() {
  const { data, error, loading, reload } = useAsync(() => customerService.wallet(), []);
  const [topUpOpen, setTopUpOpen] = useState(false);

  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">
        Wallet
      </h1>
      <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
        Add money in birr, then fund your cards in dollars.
      </p>

      {/* Telebirr is the route money would arrive by, so its state belongs
          here rather than only on the dashboard. */}
      <div className="mt-6">
        <ServiceHoldNotice only={["telebirrPayments"]} />
      </div>

      {loading && (
        <div className="mt-6 flex flex-col gap-5">
          <Skeleton className="h-[170px] w-full" />
          <Skeleton className="h-[220px] w-full" />
        </div>
      )}

      {!loading && error && (
        <div className="mt-6">
          {isUnavailable(error) ? (
            <EmptyState title="Your wallet is not available yet" description="There is no wallet behind this screen yet. A balance is not shown, because any number here would not be your money." dashed />
          ) : (
            <ErrorState title="Could not load your wallet" message={error.message} onRetry={reload} />
          )}
        </div>
      )}

      {!loading && !error && data && (
        <div className="mt-6 flex flex-col gap-5">
          <div className="rounded-panel bg-[#101217] dark:bg-[#0D1117] p-6">
            <div className="flex items-center gap-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                Wallet balance
              </p>
              <DemoNotice variant="inline" />
            </div>
            <p className="mt-2 font-mono text-[32px] leading-none text-white">
              {money(data.balance, data.currency)}
            </p>
            <p className="mt-2 text-[12px] text-ink-faint">No real funds.</p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button icon={ArrowDownToLine} onClick={() => setTopUpOpen(true)}>
                Add money
              </Button>
              <Button
                variant="secondary"
                disabled
                disabledReason="Transfers are not part of this prototype."
                className="border-white/15 text-white hover:bg-white/5"
              >
                Send
              </Button>
            </div>
          </div>

          <Panel
            title="Transactions"
            description="Deposits, transfers and card funding."
            padded={false}
          >
            {data.transactions?.length ? (
              <ul className="divide-y divide-line dark:divide-line-dark">
                {data.transactions.map((tx) => {
                  const incoming = tx.amountUsd >= 0;
                  return (
                    <li key={tx.id} className="flex items-center gap-3 px-5 py-4">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          incoming ? "bg-ok/10 text-ok" : "bg-line dark:bg-line-dark text-ink-muted"
                        }`}
                      >
                        {incoming ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-medium text-ink dark:text-ink-dark">
                          {tx.label}
                        </p>
                        <p className="text-[12px] text-ink-faint">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2.5">
                        <Badge tone={tx.status === "completed" ? "ok" : "warn"}>{tx.status}</Badge>
                        <span className="font-mono text-[13.5px] text-ink dark:text-ink-dark">
                          {incoming ? "+" : ""}
                          {money(tx.amountUsd)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                icon={Receipt}
                title="No transactions yet"
                description="Once you add money or fund a card, it will show up here."
              />
            )}
          </Panel>
        </div>
      )}

      <PaymentDialog open={topUpOpen} onClose={() => setTopUpOpen(false)} />
    </>
  );
}
