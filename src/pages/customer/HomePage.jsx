import { Link } from "react-router-dom";
import { ArrowDownToLine, Send, Plus, CreditCard } from "lucide-react";
import {
  Panel,
  Button,
  Badge,
  Skeleton,
  ErrorState,
  EmptyState,
  DemoNotice,
} from "@addiscard/ui";
import { customerService, isUnavailable, CARD_STATUS_LABEL, CARD_STATUS_TONE } from "@addiscard/services";
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../hooks/useAsync.js";
import { ServiceHoldNotice } from "../../components/ServiceHoldNotice.jsx";

function BalancePanel({ balance, currency }) {
  const formatted = Number(balance).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="rounded-panel bg-[#101217] dark:bg-[#0D1117] p-6">
      <div className="flex items-center gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
          Wallet balance
        </p>
        <DemoNotice variant="inline" />
      </div>
      <p className="mt-2 font-mono text-[32px] leading-none text-white">
        {formatted} <span className="text-[26px]">{currency}</span>
      </p>
      <p className="mt-2 text-[12px] text-ink-faint">No real funds.</p>

      <div className="mt-6 flex flex-wrap gap-2.5">
        <Link
          to="/wallet"
          className="inline-flex items-center gap-2 rounded-field bg-brand px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-hover transition-colors"
        >
          <ArrowDownToLine size={15} />
          Add money
        </Link>
        <Link
          to="/wallet"
          className="inline-flex items-center gap-2 rounded-field border border-white/15 px-4 py-2.5 text-[13px] font-semibold text-white hover:border-white/30 transition-colors"
        >
          <Send size={15} />
          Send
        </Link>
      </div>
    </div>
  );
}

function CardSummary({ cards, canCreate }) {
  if (!cards?.length) {
    return (
      <Panel padded={false}>
        <EmptyState
          icon={CreditCard}
          title="No cards yet"
          description="Create a virtual card and pay online anywhere the network is accepted."
          action={
            canCreate ? (
              <Link
                to="/cards"
                className="inline-flex items-center gap-1.5 rounded-field bg-brand px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-hover transition-colors"
              >
                <Plus size={15} />
                Create a card
              </Link>
            ) : (
              <Button disabled disabledReason="Verify your identity first" icon={Plus}>
                Create a card
              </Button>
            )
          }
        />
      </Panel>
    );
  }

  return (
    <Panel title="Your cards">
      <ul className="flex flex-col gap-3">
        {cards.map((card) => (
          <li key={card.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[14px] text-ink dark:text-ink-dark">
                •••• {card.last4}
              </p>
              <p className="text-[12px] text-ink-faint">Expires {card.expiry}</p>
            </div>
            <Badge tone={CARD_STATUS_TONE[card.status]}>{CARD_STATUS_LABEL[card.status]}</Badge>
          </li>
        ))}
      </ul>
      <Link
        to="/cards"
        className="mt-4 inline-block text-[13px] font-semibold text-brand hover:text-brand-hover"
      >
        Manage cards
      </Link>
    </Panel>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const { data, error, loading, reload } = useAsync(() => customerService.overview(), []);

  const firstName = (user?.fullName || "there").split(" ")[0];

  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">
        Welcome, {firstName}
      </h1>

      <div className="mt-6">
        <ServiceHoldNotice />
      </div>

      {loading && (
        <div className="mt-6 flex flex-col gap-5">
          <Skeleton className="h-[86px] w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <Skeleton className="h-[196px] lg:col-span-3" />
            <Skeleton className="h-[196px] lg:col-span-2" />
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="mt-6">
          {isUnavailable(error) ? (
            <EmptyState
              title="Your dashboard is not available yet"
              description="The wallet and cards this page shows are not built. Nothing is displayed rather than figures that are not yours."
              dashed
            />
          ) : (
            <ErrorState
              title="Could not load your dashboard"
              message={error.message}
              onRetry={reload}
            />
          )}
        </div>
      )}

      {!loading && !error && data && (
        <div className="mt-6 flex flex-col gap-5">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-3">
              <BalancePanel balance={data.wallet.balance} currency={data.wallet.currency} />
            </div>
            <div className="lg:col-span-2">
              <CardSummary cards={data.cards} canCreate />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
