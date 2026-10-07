import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ShieldCheck } from "lucide-react";
import { Panel, PageHeader, Table, StatusPill, Skeleton, ErrorState, EmptyState, Button, timeAgo, formatDateTime } from "@addiscard/ui";
import { KYC_STATUS, KYC_STATUS_LABEL, KYC_STATUS_TONE, KYC_METHOD_LABEL } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";
import { usePage } from "../../hooks/usePage.js";
import { adminLists } from "../../data/adminLists.js";
import { PageNav } from "../../components/admin/PageNav.jsx";

const FILTERS = [
  { value: "all", label: "All" },
  { value: KYC_STATUS.PENDING, label: "Waiting" },
  { value: KYC_STATUS.UNDER_REVIEW, label: "Being reviewed" },
  { value: KYC_STATUS.CHANGES_REQUESTED, label: "Changes requested" },
  { value: KYC_STATUS.APPROVED, label: "Approved" },
  { value: KYC_STATUS.REJECTED, label: "Not approved" },
];

const OPEN = [KYC_STATUS.PENDING, KYC_STATUS.UNDER_REVIEW];

/**
 * The identity review queue. Filter and search live in the URL so a
 * reviewer can bookmark or share the exact view they are working from.
 * The backend returns the whole matching list; there is no cursor.
 */
export default function KycQueuePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") || "all";
  const q = searchParams.get("q") || "";
  const [query, setQuery] = useState(q);

  const [page, setPage] = usePage(`${status}|${q}`);
  const { data, error, loading, reload } = useAsync(() => adminLists.kycCases({ status, q: q || undefined, page }), [status, q, page]);

  const update = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const columns = [
    {
      key: "customer",
      header: "Customer",
      render: (row) => (
        <span className="block min-w-0">
          <span className="block truncate">{row.customer?.name || "Name not given"}</span>
          <span className="block truncate text-caption font-normal text-ink-muted">{row.customer?.email}</span>
        </span>
      ),
    },
    { key: "method", header: "Document", hideBelow: "md", render: (row) => KYC_METHOD_LABEL[row.method] || row.method },
    {
      key: "submittedAt",
      header: "Submitted",
      render: (row) =>
        row.submittedAt ? (
          <span>
            <span className="block">{formatDateTime(row.submittedAt)}</span>
            {OPEN.includes(row.kycStatus) && <span className="block text-caption text-ink-muted">Waiting {timeAgo(row.submittedAt).replace(" ago", "")}</span>}
          </span>
        ) : (
          "Not submitted"
        ),
    },
    { key: "version", header: "Version", align: "right", hideBelow: "lg", render: (row) => `v${row.version || 1}` },
    {
      key: "kycStatus",
      header: "Status",
      render: (row) => <StatusPill tone={KYC_STATUS_TONE[row.kycStatus] || "neutral"}>{KYC_STATUS_LABEL[row.kycStatus] || row.kycStatus}</StatusPill>,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="KYC verification" description="Manual review of the documents customers upload. You make the decision; nothing is approved automatically." />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Status" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={status === filter.value}
              onClick={() => update("status", filter.value)}
              className={`min-h-11 shrink-0 rounded-full border px-4 text-small font-medium ${
                status === filter.value ? "border-accent bg-accent-soft text-accent-ink" : "border-line-strong bg-surface-1 text-ink-soft hover:bg-surface-2"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <form
          role="search"
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            update("q", query.trim());
          }}
        >
          <label htmlFor="kyc-search" className="sr-only">
            Search cases by name, email or case ID
          </label>
          <input
            id="kyc-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, email or case ID"
            className="h-11 w-full min-w-0 rounded-control border border-line-strong bg-surface-1 px-3 text-small text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/25 lg:w-72"
          />
          <Button type="submit" variant="secondary" icon={Search}>
            Search
          </Button>
        </form>
      </div>

      <Panel padded={false}>
        {loading && (
          <div aria-busy="true" className="flex flex-col gap-2 p-4 sm:p-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}
        {!loading && error && (
          <div className="p-4 sm:p-6">
            <ErrorState title="We couldn't load the queue" error={error} onRetry={reload} />
          </div>
        )}
        {!loading && !error && (
          <>
            {data?.cases?.length ? (
              <Table columns={columns} rows={data.cases} caption="Identity cases" onRowClick={(row) => navigate(`/kyc/${row.id}`)} />
            ) : (
              <EmptyState
                headingLevel={2}
                icon={ShieldCheck}
                title={q || status !== "all" ? "No cases match" : "No cases yet"}
                description={q || status !== "all" ? "Try another status or search." : "Cases appear here when customers submit their documents."}
              />
            )}
          </>
        )}
        {!error && <PageNav pagination={data?.pagination} onPage={setPage} loading={loading} />}
      </Panel>
    </div>
  );
}
