import { Users } from "lucide-react";
import { Panel, Table, ErrorState, EmptyState, Skeleton } from "@addiscard/ui";
import { adminService, isUnavailable } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";

export default function CustomersPage() {
  const { data, error, loading, reload } = useAsync(() => adminService.customers(), []);

  const columns = [
    {
      key: "fullName",
      header: "Customer",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink dark:text-ink-dark">{row.fullName}</p>
          <p className="truncate text-[12px] text-ink-faint">{row.email}</p>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    { key: "cardCount", header: "Cards", align: "right" },
    {
      key: "balanceUsd",
      header: "Wallet",
      align: "right",
      render: (row) => (
        <span className="tabular-nums">
          {Number(row.balanceUsd || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          USD
        </span>
      ),
    },
  ];

  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">
        Customers
      </h1>
      <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
        Everyone with an account.
      </p>

      <div className="mt-6">
        {error && !loading ? (
          isUnavailable(error) ? (
            <EmptyState title="The customer list is not available yet" description="There is no customer directory behind this screen. No records are invented to fill it." dashed />
          ) : (
            <ErrorState title="Could not load customers" message={error.message} onRetry={reload} />
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
                caption="Demo customers"
                columns={columns}
                rows={data?.customers || []}
                empty={<EmptyState icon={Users} title="No customers yet" />}
              />
            )}
          </Panel>
        )}
      </div>
    </>
  );
}
