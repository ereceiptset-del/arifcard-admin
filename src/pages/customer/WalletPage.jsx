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
import { customerService, ApiError, isUnavailable } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";

const money = (value, currency = "USD") =>
  `${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;

const etb = (value) =>
  `${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;

/**
 * Top-up quote dialog.
 *
 * The breakdown deliberately shows funding amount, exchange rate, service
 * fee, fixed fee and total on separate lines rather than one bundled
 * figure, so it is obvious what is being charged and why.
 *
 * Confirming is disabled: there is no payment rail in this prototype, and
 * a button that appeared to move money would be misleading.
 */
function TopUpDialog({ open, onClose }) {
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const close = () => {
    setAmount("");
    setQuote(null);
    setError("");
    onClose();
  };

  const getQuote = async (event) => {
    event.preventDefault();
    setError("");
    setQuote(null);

    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    setLoading(true);
    try {
      setQuote(await customerService.quote({ amountUsd: parsed }));
    } catch (problem) {
      setError(problem instanceof ApiError ? problem.message : "Could not fetch a quote.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Add money"
      description="See what a top-up would cost."
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Close
          </Button>
          <Button
            disabled
            disabledReason="This prototype has no payment rail — no money can move."
          >
            Confirm top-up
          </Button>
        </>
      }
    >
      <DemoNotice className="mb-4">
        The rate and fees below are invented for the prototype. Nothing is charged and no funds
        move.
      </DemoNotice>

      <form onSubmit={getQuote} className="flex items-end gap-2" noValidate>
        <TextInput
          label="Amount to fund"
          type="number"
          inputMode="decimal"
          min="1"
          step="1"
          placeholder="50"
          hint="In US dollars."
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          error={error}
          className="flex-1"
        />
        <Button type="submit" loading={loading} className="mb-[26px]">
          Get quote
        </Button>
      </form>

      {quote && (
        <dl className="mt-5 rounded-panel border border-line dark:border-line-dark">
          <Row label="Funding amount" value={money(quote.fundingAmountUsd)} />
          <Row label="Exchange rate" value={`1 USD = ${quote.rateEtbPerUsd} ETB`} />
          <Row label="Subtotal" value={etb(quote.subtotalEtb)} />
          <Row label={`Service fee (${quote.serviceFeePercent}%)`} value={etb(quote.serviceFeeEtb)} />
          <Row label="Fixed fee" value={etb(quote.fixedFeeEtb)} />
          <Row label="Total to pay" value={etb(quote.totalEtb)} emphasis />
          <div className="px-4 py-3">
            <p className="text-[12px] text-ink-faint">{quote.disclaimer}</p>
          </div>
        </dl>
      )}
    </Dialog>
  );
}

function Row({ label, value, emphasis }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 border-b border-line dark:border-line-dark px-4 py-2.5 last:border-b-0 ${
        emphasis ? "bg-panel-muted dark:bg-white/[0.03]" : ""
      }`}
    >
      <dt className={`text-[13px] ${emphasis ? "font-semibold text-ink dark:text-ink-dark" : "text-ink-muted dark:text-ink-muted-dark"}`}>
        {label}
      </dt>
      <dd className={`font-mono text-[13px] ${emphasis ? "font-semibold text-ink dark:text-ink-dark" : "text-ink dark:text-ink-dark"}`}>
        {value}
      </dd>
    </div>
  );
}

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

      <TopUpDialog open={topUpOpen} onClose={() => setTopUpOpen(false)} />
    </>
  );
}
