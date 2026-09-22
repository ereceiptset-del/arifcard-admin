import { Link } from "react-router-dom";
import { Users, CreditCard, CheckCircle2, Banknote } from "lucide-react";
import { Panel, Skeleton, ErrorState, EmptyState } from "@addiscard/ui";
import { adminService } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";

const TILES = [
  { key: "customers", label: "Customers", icon: Users, tone: "info", to: "/admin/customers" },
  { key: "cards", label: "Cards", icon: CreditCard, tone: "warn", to: "/admin/cards" },
  { key: "activeCards", label: "Active cards", icon: CheckCircle2, tone: "ok", to: "/admin/cards" },
  { key: "payments", label: "Payments", icon: Banknote, tone: "info", to: "/admin/payments" },
];

const TONE_BG = {
  info: "bg-info/10 text-info",
  warn: "bg-warn/10 text-warn",
  ok: "bg-ok/10 text-ok",
  danger: "bg-danger/10 text-danger",
};

const usd = (value) =>
  Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function OverviewPage() {
  const { data, error, loading, reload } = useAsync(() => adminService.overview(), []);

  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">
        Overview
      </h1>
      <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
        Customers, cards and payments. Demo data, held in this browser.
      </p>

      {loading && (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[104px]" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mt-6">
          <ErrorState title="Could not load the overview" message={error.message} onRetry={reload} />
        </div>
      )}

      {!loading && !error && data && (
        <div className="mt-6 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {TILES.map(({ key, label, icon: Icon, tone, to }) => (
              <Link
                key={key}
                to={to}
                className="rounded-panel border border-line dark:border-line-dark bg-panel dark:bg-panel-dark p-5 transition-colors hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-field ${TONE_BG[tone]}`}>
                  <Icon size={17} />
                </span>
                <p className="mt-3 text-[24px] font-semibold leading-none text-ink dark:text-ink-dark">
                  {data.counts[key] ?? 0}
                </p>
                <p className="mt-1.5 text-[12.5px] text-ink-muted dark:text-ink-muted-dark">
                  {label}
                </p>
              </Link>
            ))}
          </div>

          <Panel title="Wallet balances" description="Across every customer in this browser.">
            <p className="text-[24px] font-semibold leading-none text-ink dark:text-ink-dark tabular-nums">
              {usd(data.totalBalanceUsd)} USD
            </p>
            <p className="mt-2 text-[12.5px] text-ink-faint">
              Simulated. No real funds are held anywhere.
            </p>
          </Panel>

          <Panel title="Recent payments" description="Newest first." padded={false}>
            {data.recentPayments?.length ? (
              <ul className="divide-y divide-line dark:divide-line-dark">
                {data.recentPayments.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-4 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="text-[13.5px] text-ink dark:text-ink-dark">{item.label}</p>
                      <p className="mt-0.5 text-[12px] text-ink-faint">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-[13.5px] tabular-nums ${
                        item.amountUsd < 0 ? "text-ink-muted dark:text-ink-muted-dark" : "text-ok"
                      }`}
                    >
                      {item.amountUsd < 0 ? "" : "+"}
                      {usd(item.amountUsd)} USD
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No payments yet" description="Simulated transactions appear here." />
            )}
          </Panel>
        </div>
      )}
    </>
  );
}
