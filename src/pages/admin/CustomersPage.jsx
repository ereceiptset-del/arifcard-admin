import { useCallback, useState } from "react";
import { Users, X } from "lucide-react";
import { Panel, Table, Badge, ErrorState, EmptyState, Skeleton, TextInput, Dialog, Button } from "@addiscard/ui";
import {
  adminService,
  KYC_STATUS,
  KYC_STATUS_LABEL,
  KYC_STATUS_TONE,
  KYC_METHOD_LABEL,
  birr,
} from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";

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
 * address needs to find the account it belongs to.
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

export default function CustomersPage() {
  const [q, setQ] = useState("");
  const [kycStatus, setKycStatus] = useState("all");
  const [openUid, setOpenUid] = useState(null);

  const load = useCallback(() => adminService.customers({ q, kycStatus }), [q, kycStatus]);
  const { data, error, loading, reload } = useAsync(load, [q, kycStatus]);

  const rows = data?.customers || [];

  const columns = [
    {
      key: "customer",
      header: "Customer",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink dark:text-ink-dark">{row.name || "—"}</p>
          <p className="truncate font-mono text-[12px] text-ink-faint">{row.email}</p>
        </div>
      ),
    },
    {
      key: "account",
      header: "Account",
      render: (row) => (
        <Badge tone={row.active ? "ok" : "warn"}>
          {row.disabled ? "Disabled" : row.emailVerified ? "Active" : "Unverified"}
        </Badge>
      ),
    },
    {
      key: "kyc",
      header: "Identity",
      render: (row) => (
        <div className="min-w-0">
          <Badge tone={KYC_STATUS_TONE[row.kycStatus] || "neutral"}>
            {KYC_STATUS_LABEL[row.kycStatus] || row.kycStatus}
          </Badge>
          {row.kycMethod && (
            <p className="mt-1 text-[11px] text-ink-faint">{KYC_METHOD_LABEL[row.kycMethod] || row.kycMethod}</p>
          )}
        </div>
      ),
    },
    { key: "paymentCount", header: "Payments", align: "right" },
    {
      key: "createdAt",
      header: "Joined",
      render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <Button variant="secondary" onClick={() => setOpenUid(row.uid)}>
          Open
        </Button>
      ),
    },
  ];

  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">Customers</h1>
      <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
        Everyone with an account. Email addresses are masked here — open a customer to see the full record.
      </p>

      <div className="mt-5 flex flex-wrap items-end gap-3">
        <TextInput
          label="Search"
          placeholder="Name, email or ID"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          className="w-full sm:w-72"
        />
        <div className="flex flex-wrap gap-2 pb-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setKycStatus(filter.value)}
              className={`rounded-full border px-3 py-1.5 text-[12.5px] ${
                kycStatus === filter.value
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-line dark:border-line-dark text-ink-muted dark:text-ink-muted-dark"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <Panel padded={false}>
          {loading && (
            <div className="p-5">
              <Skeleton className="h-[180px] w-full" />
            </div>
          )}
          {!loading && error && (
            <div className="p-5">
              <ErrorState title="Could not load customers" message={error.message} onRetry={reload} />
            </div>
          )}
          {!loading && !error && rows.length === 0 && (
            <EmptyState
              icon={Users}
              title={q || kycStatus !== "all" ? "No customers match" : "No customers yet"}
              description={
                q || kycStatus !== "all"
                  ? "Try a different search or filter."
                  : "Accounts appear here as people register."
              }
            />
          )}
          {!loading && !error && rows.length > 0 && <Table columns={columns} rows={rows} />}
        </Panel>
      </div>

      {data?.truncated && (
        <p className="mt-4 text-[12px] text-warn">
          More accounts exist than this page lists. Narrow the search to see the rest.
        </p>
      )}

      <CustomerDialog uid={openUid} onClose={() => setOpenUid(null)} />
    </>
  );
}

/** One customer in full. The only place the real email is shown. */
function CustomerDialog({ uid, onClose }) {
  const load = useCallback(
    () => (uid ? adminService.customer(uid) : Promise.resolve(null)),
    [uid]
  );
  const { data, error, loading } = useAsync(load, [uid]);
  const customer = data?.customer;

  return (
    <Dialog open={Boolean(uid)} onClose={onClose} title="Customer" size="lg">
      {loading && <Skeleton className="h-[240px] w-full" />}
      {!loading && error && <ErrorState title="Could not load this customer" message={error.message} />}

      {!loading && customer && (
        <div className="flex flex-col gap-5">
          <dl className="rounded-panel border border-line dark:border-line-dark">
            <Row label="Name" value={customer.name || "—"} />
            <Row label="Email" value={customer.email} mono />
            <Row label="Account" value={customer.disabled ? "Disabled" : customer.emailVerified ? "Active" : "Email not verified"} />
            <Row label="Joined" value={customer.createdAt ? new Date(customer.createdAt).toLocaleString() : "—"} />
            <Row label="Last signed in" value={customer.lastSignInAt ? new Date(customer.lastSignInAt).toLocaleString() : "—"} />
          </dl>

          <div>
            <p className="text-[13px] font-medium text-ink dark:text-ink-dark">Identity history</p>
            {customer.cases.length === 0 ? (
              <p className="mt-2 text-[12.5px] text-ink-faint">No verification submitted.</p>
            ) : (
              <ul className="mt-2 divide-y divide-line dark:divide-line-dark rounded-panel border border-line dark:border-line-dark">
                {customer.cases.map((c) => (
                  <li key={c.id} className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={KYC_STATUS_TONE[c.kycStatus]}>{KYC_STATUS_LABEL[c.kycStatus] || c.kycStatus}</Badge>
                      <span className="text-[12px] text-ink-faint">
                        {KYC_METHOD_LABEL[c.method] || c.method} · v{c.version}
                      </span>
                    </div>
                    {c.customerReason && (
                      <p className="mt-1.5 text-[12.5px] text-ink dark:text-ink-dark">{c.customerReason}</p>
                    )}
                    <p className="mt-1 text-[11px] text-ink-faint">
                      {c.submittedAt ? `Submitted ${new Date(c.submittedAt).toLocaleString()}` : "Not submitted"}
                      {c.decidedAt ? ` · Decided ${new Date(c.decidedAt).toLocaleString()}` : ""}
                      {c.reviewerName ? ` by ${c.reviewerName}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="text-[13px] font-medium text-ink dark:text-ink-dark">Payments</p>
            {customer.payments.length === 0 ? (
              <p className="mt-2 text-[12.5px] text-ink-faint">No payments started.</p>
            ) : (
              <ul className="mt-2 divide-y divide-line dark:divide-line-dark rounded-panel border border-line dark:border-line-dark">
                {customer.payments.slice(0, 15).map((p) => (
                  <li key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="min-w-0 flex-1 truncate font-mono text-[12px]">{p.reference}</span>
                    <span className="shrink-0 text-[12px] text-ink-faint">{p.method}</span>
                    <span className="shrink-0 font-mono text-[12.5px]">{birr(p.amountMinor)}</span>
                    <Badge tone="neutral">{p.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
            {customer.payments.length > 15 && (
              <p className="mt-2 text-[11px] text-ink-faint">
                Showing the 15 most recent of {customer.payments.length}.
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="secondary" icon={X} onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line dark:border-line-dark px-4 py-2.5 last:border-b-0">
      <dt className="text-[13px] text-ink-muted dark:text-ink-muted-dark">{label}</dt>
      <dd className={`text-right text-[13px] text-ink dark:text-ink-dark ${mono ? "font-mono text-[12px]" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
