import { Banknote } from "lucide-react";
import { Panel, Table, Badge, ErrorState, EmptyState, Skeleton, DemoNotice } from "@addiscard/ui";
import { adminService } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";

export default function PaymentsPage() {
  const { data, error, loading, reload } = useAsync(() => adminService.payments(), []);

  const columns = [
    {
      key: "ownerName",
      header: "Customer",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink dark:text-ink-dark">{row.ownerName}</p>
          <p className="truncate text-[12px] text-ink-faint">{row.ownerEmail}</p>
        </div>
      ),
    },
    { key: "label", header: "Description" },
    {
      key: "createdAt",
      header: "Date",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "amountUsd",
      header: "Amount",
      align: "right",
      render: (row) => (
        <span className="font-mono">
          {row.amountUsd >= 0 ? "+" : ""}
          {Number(row.amountUsd).toFixed(2)} USD
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      render: (row) => (
        <Badge tone={row.status === "completed" ? "ok" : "warn"}>{row.status}</Badge>
      ),
    },
  ];

  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">
        Payments
      </h1>
      <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
        Simulated wallet and card funding activity across all demo customers.
      </p>

      <div className="mt-6 flex flex-col gap-5">
        <DemoNotice>
          No payment processor sits behind any of these rows. They are records invented for the
          prototype, and no money has moved.
        </DemoNotice>

        {error && !loading ? (
          <ErrorState title="Could not load payments" message={error.message} onRetry={reload} />
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
                caption="Simulated payments"
                columns={columns}
                rows={data?.payments || []}
                empty={
                  <EmptyState
                    icon={Banknote}
                    title="No payment activity"
                    description="Wallet and card funding records will appear here."
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
