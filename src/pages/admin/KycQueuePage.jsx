import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Panel, Table, Badge, Skeleton, ErrorState, EmptyState, TextInput } from "@addiscard/ui";
import { adminService, KYC_STATUS, KYC_STATUS_LABEL, KYC_STATUS_TONE } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";

const FILTERS = [
  { value: "all", label: "All" },
  { value: KYC_STATUS.PENDING, label: "Waiting" },
  { value: KYC_STATUS.UNDER_REVIEW, label: "Being reviewed" },
  { value: KYC_STATUS.CHANGES_REQUESTED, label: "Changes requested" },
  { value: KYC_STATUS.APPROVED, label: "Approved" },
  { value: KYC_STATUS.REJECTED, label: "Not approved" },
];

export default function KycQueuePage() {
  // Filter state lives in the URL so a reviewer can bookmark or share the
  // exact view they are working from.
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") || "all";
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const { data, error, loading, reload } = useAsync(
    () => adminService.kycCases({ status, q: searchParams.get("q") || undefined }),
    [status, searchParams.get("q")]
  );

  const applyQuery = (value) => {
    setQuery(value);
    const next = new URLSearchParams(searchParams);
    if (value) next.set("q", value);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  };

  const setStatus = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete("status");
    else next.set("status", value);
    setSearchParams(next, { replace: true });
  };

  const columns = [
    {
      key: "customer",
      header: "Customer",
      render: (row) => (
        <Link to={`/admin/kyc/${row.id}`} className="block min-w-0">
          <p className="truncate font-medium text-ink dark:text-ink-dark">
            {row.customer?.name || "Unknown"}
          </p>
          <p className="truncate text-[12px] text-ink-faint">{row.customer?.email}</p>
        </Link>
      ),
    },
    { key: "method", header: "Method", render: (row) => (row.method === "MANUAL_FAYDA" ? "Manual Fayda" : row.method) },
    {
      key: "submittedAt",
      header: "Submitted",
      render: (row) => (row.submittedAt ? new Date(row.submittedAt).toLocaleDateString() : "—"),
    },
    { key: "version", header: "Version", align: "right", render: (row) => `v${row.version || 1}` },
    {
      key: "kycStatus",
      header: "Status",
      align: "right",
      render: (row) => (
        <Badge tone={KYC_STATUS_TONE[row.kycStatus] || "neutral"}>
          {KYC_STATUS_LABEL[row.kycStatus] || row.kycStatus}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">
        Identity review
      </h1>
      <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
        Manual review of documents customers uploaded.
      </p>

      <div className="mt-6 flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatus(filter.value)}
              className={`rounded-field px-3 py-1.5 text-[12.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                status === filter.value
                  ? "bg-brand text-white"
                  : "bg-panel-muted dark:bg-white/5 text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <TextInput
          label="Search"
          placeholder="Name, email or case ID"
          value={query}
          onChange={(event) => applyQuery(event.target.value)}
        />

        {loading && <Skeleton className="h-[280px] w-full" />}

        {!loading && error && (
          <ErrorState title="Could not load the queue" message={error.message} onRetry={reload} />
        )}

        {!loading && !error && (
          <Panel padded={false}>
            {data?.cases?.length ? (
              <Table columns={columns} rows={data.cases} caption="Identity cases" />
            ) : (
              <EmptyState
                title="Nothing here"
                description="No case matches this filter."
                dashed
              />
            )}
          </Panel>
        )}
      </div>
    </>
  );
}
