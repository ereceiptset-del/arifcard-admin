import { CreditCard } from "lucide-react";
import { Panel, Table, Badge, ErrorState, EmptyState, Skeleton, DemoNotice } from "@addiscard/ui";
import { adminService, CARD_STATUS_LABEL, CARD_STATUS_TONE, isUnavailable } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";

export default function CardsPage() {
  const { data, error, loading, reload } = useAsync(() => adminService.cards(), []);

  const columns = [
    {
      key: "ownerName",
      header: "Owner",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink dark:text-ink-dark">{row.ownerName}</p>
          <p className="truncate text-[12px] text-ink-faint">{row.ownerEmail}</p>
        </div>
      ),
    },
    {
      key: "last4",
      header: "Card",
      render: (row) => <span className="font-mono">•••• {row.last4}</span>,
    },
    { key: "expiry", header: "Expires" },
    {
      key: "balanceUsd",
      header: "Balance",
      align: "right",
      render: (row) => (
        <span className="font-mono">{Number(row.balanceUsd).toFixed(2)} USD</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      render: (row) => (
        <Badge tone={CARD_STATUS_TONE[row.status]}>{CARD_STATUS_LABEL[row.status]}</Badge>
      ),
    },
  ];

  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">
        Cards
      </h1>
      <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
        Every card issued to a customer.
      </p>

      <div className="mt-6 flex flex-col gap-5">
        <DemoNotice>
          There is no card system behind this screen yet. No card number exists, nothing was
          issued, and no payment network is involved.
        </DemoNotice>

        {error && !loading ? (
          isUnavailable(error) ? (
            <EmptyState title="Card records are not available yet" description="There is no card system behind this screen. No records are invented to fill it." dashed />
          ) : (
            <ErrorState title="Could not load cards" message={error.message} onRetry={reload} />
          )
        ) : (
          <Panel padded={false}>
            {loading ? (
              <div className="flex flex-col gap-2 p-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-11 w-full" />
                ))}
              </div>
            ) : (
              <Table
                caption="Cards"
                columns={columns}
                rows={data?.cards || []}
                empty={
                  <EmptyState
                    icon={CreditCard}
                    title="No cards yet"
                    description="Cards appear here once a verified customer creates one."
                  />
                }
              />
            )}
          </Panel>
        )}
      </div>
    </>
  );
}
