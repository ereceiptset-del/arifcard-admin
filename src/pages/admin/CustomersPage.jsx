import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Users, RefreshCw, Search } from "lucide-react";
import { Panel, PageHeader, Table, StatusPill, ErrorState, EmptyState, Skeleton, Drawer, Tabs, TabPanel, Button, useToast, formatMoney, formatDate, formatDateTime } from "@addiscard/ui";
import {
  adminService,
  ISSUER_ONBOARDING_LABEL,
  ISSUER_ONBOARDING_TONE,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_TONE,
  KYC_STATUS,
  KYC_STATUS_LABEL,
  KYC_STATUS_TONE,
  KYC_METHOD_LABEL,
} from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";
import IssuerFunding from "../../components/admin/IssuerFunding.jsx";
import IssuerCardOrders from "../../components/admin/IssuerCardOrders.jsx";

/**
 * Customers.
 *
 * **Emails are masked in the list.** A list is scrolled casually and
 * often in a room with other people; the masked form is enough to
 * recognise an account. The full address appears only when a single
 * record is opened, which is a deliberate act rather than a side effect
 * of browsing.
 *
 * Search still matches the real email, because a staff member given an
 * address needs to find the account it belongs to. Search and filter live
 * in the URL (the header's global search lands here).
 *
 * Staff accounts are excluded by the backend. They are not customers, and
 * showing them here invites someone to act on a colleague's record.
 */

const FILTERS = [
  { value: "all", label: "All" },
  { value: KYC_STATUS.NOT_SUBMITTED, label: "Not started" },
  { value: KYC_STATUS.PENDING, label: "Waiting" },
  { value: KYC_STATUS.UNDER_REVIEW, label: "Being reviewed" },
  { value: KYC_STATUS.CHANGES_REQUESTED, label: "Changes requested" },
  { value: KYC_STATUS.APPROVED, label: "Approved" },
  { value: KYC_STATUS.REJECTED, label: "Rejected" },
];

const accountPill = (row) =>
  row.disabled ? { tone: "danger", label: "Disabled" } : row.emailVerified ? { tone: "success", label: "Active" } : { tone: "attention", label: "Email not confirmed" };

export default function CustomersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const kycStatus = searchParams.get("kyc") || "all";
  const [query, setQuery] = useState(q);
  const [openUid, setOpenUid] = useState(null);

  // Follow the header search when it changes the URL while this page is open.
  useEffect(() => setQuery(q), [q]);

  const load = useCallback(() => adminService.customers({ q, kycStatus }), [q, kycStatus]);
  const { data, error, loading, reload } = useAsync(load, [q, kycStatus]);
  const rows = data?.customers || [];

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
          <span className="block truncate">{row.name || "Name not given"}</span>
          <span className="block truncate text-caption font-normal text-ink-muted">{row.email}</span>
        </span>
      ),
    },
    {
      key: "account",
      header: "Account",
      hideBelow: "md",
      render: (row) => {
        const pill = accountPill(row);
        return <StatusPill tone={pill.tone}>{pill.label}</StatusPill>;
      },
    },
    {
      key: "kyc",
      header: "KYC",
      render: (row) => (
        <span className="block">
          <StatusPill tone={KYC_STATUS_TONE[row.kycStatus] || "neutral"}>{KYC_STATUS_LABEL[row.kycStatus] || row.kycStatus}</StatusPill>
          {row.kycMethod && <span className="mt-1 block text-caption text-ink-muted">{KYC_METHOD_LABEL[row.kycMethod] || row.kycMethod}</span>}
        </span>
      ),
    },
    { key: "paymentCount", header: "Payments", align: "right", hideBelow: "lg" },
    { key: "createdAt", header: "Joined", hideBelow: "lg", render: (row) => (row.createdAt ? formatDate(row.createdAt) : "Not recorded") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Customers" description="Everyone with an account. Email addresses are masked here; open a customer to see the full record." />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="KYC status" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={kycStatus === filter.value}
              onClick={() => update("kyc", filter.value)}
              className={`min-h-11 shrink-0 rounded-full border px-4 text-small font-medium ${
                kycStatus === filter.value ? "border-accent bg-accent-soft text-accent-ink" : "border-line-strong bg-surface-1 text-ink-soft hover:bg-surface-2"
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
          <label htmlFor="customer-search" className="sr-only">
            Search customers by name, email or ID
          </label>
          <input
            id="customer-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, email or ID"
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
            <ErrorState title="We couldn't load customers" error={error} onRetry={reload} />
          </div>
        )}
        {!loading && !error && rows.length === 0 && (
          <EmptyState
            headingLevel={2}
            icon={Users}
            title={q || kycStatus !== "all" ? "No customers match" : "No customers yet"}
            description={q || kycStatus !== "all" ? "Try a different search or filter." : "Accounts appear here as people register."}
          />
        )}
        {!loading && !error && rows.length > 0 && <Table caption="Customers" keyField="uid" columns={columns} rows={rows} onRowClick={(row) => setOpenUid(row.uid)} />}
      </Panel>

      {data?.truncated && (
        <p role="note" className="rounded-control bg-warning-tint px-4 py-3 text-small text-ink">
          More accounts exist than this page lists. Narrow the search to see the rest.
        </p>
      )}

      {openUid && <CustomerDrawer uid={openUid} onClose={() => setOpenUid(null)} />}
    </div>
  );
}

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "kyc", label: "KYC" },
  { value: "payments", label: "Payments" },
  { value: "issuer", label: "Card issuer" },
  { value: "cards", label: "Cards and funding" },
];

/** One customer in full. The only place the real email is shown. */
function CustomerDrawer({ uid, onClose }) {
  const load = useCallback(() => adminService.customer(uid), [uid]);
  const { data, error, loading } = useAsync(load, [uid]);
  const customer = data?.customer;
  const [tab, setTab] = useState("overview");

  return (
    <Drawer open onClose={onClose} title={customer?.name || "Customer"} description={customer?.email} width="max-w-3xl">
      {loading && <Skeleton className="h-[320px] w-full rounded-panel" />}
      {!loading && error && <ErrorState title="We couldn't load this customer" error={error} />}

      {!loading && customer && (
        <div>
          <Tabs tabs={TABS.map((t) => ({ ...t, value: `c-${t.value}` }))} value={`c-${tab}`} onChange={(value) => setTab(value.slice(2))} ariaLabel="Customer sections" />
          <TabPanel value={`c-${tab}`}>
            {tab === "overview" && (
              <dl className="divide-y divide-line rounded-control border border-line">
                <Row label="Name" value={customer.name || "Not given"} />
                <Row label="Email" value={<span className="break-all">{customer.email}</span>} />
                <Row
                  label="Account"
                  value={(() => {
                    const pill = accountPill(customer);
                    return <StatusPill tone={pill.tone}>{pill.label}</StatusPill>;
                  })()}
                />
                <Row label="Joined" value={customer.createdAt ? formatDateTime(customer.createdAt) : "Not recorded"} />
                <Row label="Last signed in" value={customer.lastSignInAt ? formatDateTime(customer.lastSignInAt) : "Not recorded"} />
                <Row label="Identity cases" value={String(customer.cases.length)} />
                <Row label="Payments" value={String(customer.payments.length)} />
              </dl>
            )}

            {tab === "kyc" &&
              (customer.cases.length === 0 ? (
                <p className="text-small text-ink-muted">No verification submitted.</p>
              ) : (
                <ul className="divide-y divide-line rounded-control border border-line">
                  {customer.cases.map((c) => (
                    <li key={c.id} className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill tone={KYC_STATUS_TONE[c.kycStatus]}>{KYC_STATUS_LABEL[c.kycStatus] || c.kycStatus}</StatusPill>
                        <span className="text-caption text-ink-muted">
                          {KYC_METHOD_LABEL[c.method] || c.method}, version {c.version}
                        </span>
                        <Link to={`/kyc/${c.id}`} className="ml-auto inline-flex min-h-11 items-center text-small font-medium text-link hover:underline">
                          Open case
                        </Link>
                      </div>
                      {c.customerReason && <p className="mt-1.5 text-small text-ink">{c.customerReason}</p>}
                      <p className="mt-1 text-caption text-ink-muted">
                        {c.submittedAt ? `Submitted ${formatDateTime(c.submittedAt)}` : "Not submitted"}
                        {c.decidedAt ? `. Decided ${formatDateTime(c.decidedAt)}` : ""}
                        {c.reviewerName ? ` by ${c.reviewerName}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              ))}

            {tab === "payments" &&
              (customer.payments.length === 0 ? (
                <p className="text-small text-ink-muted">No payments started.</p>
              ) : (
                <>
                  <ul className="divide-y divide-line rounded-control border border-line">
                    {customer.payments.slice(0, 15).map((p) => (
                      <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5">
                        <span className="min-w-0 flex-1 truncate text-small text-ink">
                          {p.reference} <span className="text-ink-muted">({p.method})</span>
                        </span>
                        <span className="shrink-0 text-small font-medium tabular-nums text-ink">{formatMoney(p.amountMinor, p.currency || "ETB")}</span>
                        <StatusPill tone={PAYMENT_STATUS_TONE[p.status] || "neutral"}>{PAYMENT_STATUS_LABEL[p.status] || p.status}</StatusPill>
                      </li>
                    ))}
                  </ul>
                  {customer.payments.length > 15 && <p className="mt-2 text-caption text-ink-muted">Showing the 15 most recent of {customer.payments.length}.</p>}
                </>
              ))}

            {tab === "issuer" && <IssuerOnboarding uid={uid} />}
            {tab === "cards" && (
              <div className="flex flex-col gap-6">
                <IssuerCardOrders uid={uid} />
                <IssuerFunding uid={uid} />
              </div>
            )}
          </TabPanel>
        </div>
      )}
    </Drawer>
  );
}

/**
 * The customer's onboarding with the card issuer. Deliberately its own
 * section, apart from KYC: Arifcard's review and the issuer's verification
 * are two different decisions, by two different parties, and neither
 * changes the other. Staff can read it and an administrator can ask the
 * issuer again — nobody can set it.
 */
function IssuerOnboarding({ uid }) {
  const toast = useToast();
  const load = useCallback(() => adminService.issuerOnboarding(uid), [uid]);
  const { data, error, loading, setData } = useAsync(load, [uid]);
  const [refreshing, setRefreshing] = useState(false);
  const o = data?.onboarding;

  const refresh = async () => {
    setRefreshing(true);
    try {
      const result = await adminService.refreshIssuerOnboarding(uid);
      setData({ onboarding: result.onboarding });
      if (result.refreshed) toast.success("Checked with the card issuer.");
      else toast.info(`Not checked: ${result.reason || "the issuer is unavailable"}.`);
    } catch (problem) {
      toast.error(problem?.message || "We couldn't check with the card issuer. Try again.");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-h3 text-ink">Card issuer onboarding</h3>
        {o && (
          <Button variant="secondary" size="sm" icon={RefreshCw} loading={refreshing} onClick={refresh}>
            Check with issuer
          </Button>
        )}
      </div>
      {loading && <Skeleton className="h-24 w-full rounded-control" />}
      {!loading && error && <ErrorState title="We couldn't load the issuer record" error={error} />}
      {!loading && o && (
        <dl className="divide-y divide-line rounded-control border border-line">
          <Row label="State" value={<StatusPill tone={ISSUER_ONBOARDING_TONE[o.state]}>{ISSUER_ONBOARDING_LABEL[o.state] || o.state}</StatusPill>} />
          <Row label="Application status" value={o.applicationStatus || "Not recorded"} />
          {o.applicationReason && <Row label="Reason codes" value={o.applicationReason} />}
          <Row label="Session" value={o.session ? `${o.session.status}${o.session.resumable ? "" : " (can't be resumed)"}` : "None"} />
          <Row label="Our reference" value={o.externalUserId || "Not recorded"} />
          <Row label="Issuer user ID" value={o.providerUserId || "Not recorded"} />
          <Row label="Last event" value={o.lastEventAt ? formatDateTime(o.lastEventAt) : "None yet"} />
          <Row label="Last checked" value={o.lastRefreshedAt ? formatDateTime(o.lastRefreshedAt) : "Never"} />
          {o.correlationProblem && <Row label="Correlation problem" value={o.correlationProblem} />}
          {o.gateBlocks?.length > 0 && <Row label="Blocked by" value={o.gateBlocks.map((b) => b.reason).join(" ")} />}
        </dl>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-4 px-4 py-2.5">
      <dt className="text-small text-ink-muted">{label}</dt>
      <dd className="min-w-0 break-words text-right text-small text-ink">{value}</dd>
    </div>
  );
}
