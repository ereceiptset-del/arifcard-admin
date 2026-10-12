import { useCallback, useState } from "react";
import { Percent, RefreshCw } from "lucide-react";
import { Panel, PageHeader, Table, StatusPill, Button, Dialog, TextInput, Skeleton, ErrorState, EmptyState, useToast, formatDateTime, formatMoney } from "@addiscard/ui";
import { ApiError } from "@addiscard/services";
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../hooks/useAsync.js";
import { pricingAdmin, rateText, feeText } from "../../data/pricingAdmin.js";

/**
 * Pricing: the Arifcard customer service fee (a versioned policy in the
 * backend's code) and the approved USD/ETB rate (set here by an
 * administrator). Every customer quote is calculated by the backend from
 * these and keeps the version and rate it used, so a change here never
 * alters a quote that already exists. The card provider's own fees are
 * internal costs and are not part of the customer's price.
 */
const KIND_LABEL = { CARD_CREATION: "Card creation", TOPUP: "Top-up" };

export default function PricingPage() {
  const { user } = useAuth();
  const load = useCallback(() => pricingAdmin.get(), []);
  const { data, error, loading, reload } = useAsync(load, []);
  const [editing, setEditing] = useState(false);
  // The backend decides (administrators only); this only hides a button a reviewer can't use.
  const canSet = Boolean(user?.isOwner) || ["owner", "admin"].includes(user?.staffRole);
  const policy = data?.policy;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pricing"
        description="The Arifcard service fee and the approved exchange rate. The backend prices every card and top-up from these."
        actions={
          <Button variant="secondary" icon={RefreshCw} loading={loading && Boolean(data)} onClick={reload}>
            Refresh
          </Button>
        }
      />
      {loading && !data && <Skeleton className="h-64 w-full rounded-panel" />}
      {error && !data && <ErrorState title="We couldn't load pricing" error={error} onRetry={reload} />}

      {data && (
        <>
          <Panel
            title="Approved exchange rate"
            action={
              canSet && (
                <Button size="sm" onClick={() => setEditing(true)}>
                  {data.rate ? "Set a new rate" : "Set the rate"}
                </Button>
              )
            }
          >
            {data.rate ? (
              <div>
                <p className="text-money-sm tabular-nums text-ink">1 USD = {rateText(data.rate.etbPerUsd)} ETB</p>
                <p className="mt-1 text-caption text-ink-muted">
                  Version {data.rate.version} · set by {data.rate.setBy || "?"} {data.rate.setAt ? formatDateTime(data.rate.setAt) : ""}
                  {data.rate.note ? ` · ${data.rate.note}` : ""}
                </p>
                <p className="mt-2 text-caption text-ink-muted">New quotes use this rate. A quote already given keeps the rate it was made with.</p>
              </div>
            ) : (
              <p role="status" className="text-small text-ink">
                No rate is set. Customers can't get a price for a card or a top-up until an administrator sets one.
              </p>
            )}
          </Panel>

          <Panel title={`Customer service fee · policy ${policy?.version || "?"}`} padded={false}>
            <dl className="divide-y divide-line">
              {Object.entries(policy?.fees || {}).map(([kind, rule]) => (
                <div key={kind} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
                  <dt className="text-small text-ink-muted">{KIND_LABEL[kind] || kind}</dt>
                  <dd className="text-right text-small font-medium text-ink">
                    {policy.model === "deducted" ? (
                      <>
                        {feeText(rule)} <span className="font-normal text-ink-muted">of the converted payment</span>
                        {rule.cardCreationFeeCents ? <> + {formatMoney(rule.cardCreationFeeCents, "USD")} <span className="font-normal text-ink-muted">card creation fee</span></> : null}
                        <span className="font-normal text-ink-muted">, deducted</span>
                      </>
                    ) : (
                      <>
                        {feeText(rule)} <span className="font-normal text-ink-muted">of the ETB base, in {policy.feeCurrency}</span>
                      </>
                    )}
                  </dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
                <dt className="text-small text-ink-muted">Status</dt>
                <dd>
                  <StatusPill tone="success">{policy?.status === "ACTIVE" ? "Active" : policy?.status}</StatusPill>
                </dd>
              </div>
            </dl>
            <p className="border-t border-line px-4 py-3 text-caption text-ink-muted sm:px-6">
              {policy?.model === "deducted"
                ? "Card receives = what the customer pays, converted at the rate, − the service fee − the card creation fee (new card only). "
                : "Total to pay = card amount × rate + this fee; the card receives the full amount. "}
              The card provider&apos;s own fees are the company&apos;s cost. Fees change only with a new policy version, not from this page. Quotes are held {data.quoteTtlMinutes} minutes. Sandbox
              limits: top-up {formatMoney(data.limits?.TOPUP?.minCents, "USD")} to {formatMoney(data.limits?.TOPUP?.maxCents, "USD")}; new card{" "}
              {formatMoney(data.limits?.CARD_CREATION?.minCents, "USD")} to {formatMoney(data.limits?.CARD_CREATION?.maxCents, "USD")}, whole dollars.
            </p>
          </Panel>

          <Panel title="Rate history" padded={!data.history?.length}>
            {data.history?.length ? (
              <Table
                caption="Rate history"
                columns={[
                  { key: "version", header: "Version", render: (r) => `v${r.version}` },
                  { key: "rate", header: "Rate", render: (r) => `1 USD = ${rateText(r.etbPerUsd)} ETB` },
                  { key: "by", header: "Set by", render: (r) => r.setBy || "?" },
                  { key: "at", header: "When", render: (r) => formatDateTime(r.setAt) },
                  { key: "note", header: "Note", render: (r) => r.note || "" },
                ]}
                rows={data.history.map((r) => ({ ...r, id: String(r.version) }))}
              />
            ) : (
              <EmptyState compact icon={Percent} title="No rate has been set yet." />
            )}
          </Panel>
        </>
      )}

      {editing && <RateDialog current={data?.rate} onClose={() => setEditing(false)} onDone={reload} />}
    </div>
  );
}

/** Administrator: a new approved rate, saved as a new version. */
function RateDialog({ current, onClose, onDone }) {
  const toast = useToast();
  const [rate, setRate] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const save = async () => {
    setBusy(true);
    setProblem("");
    try {
      const r = await pricingAdmin.setRate({ etbPerUsd: rate.trim(), note: note.trim() });
      toast.success(`New rate: 1 USD = ${rateText(r.rate.etbPerUsd)} ETB (version ${r.rate.version}).`);
      onDone();
      onClose();
    } catch (error) {
      setProblem(error instanceof ApiError ? error.message : "That didn't go through.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog
      open
      onClose={busy ? () => {} : onClose}
      title="Set the approved exchange rate"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button loading={busy} disabled={!rate.trim()} onClick={save}>
            Save new rate
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <TextInput
          id="rate-etb-per-usd"
          label="Birr per 1 US dollar"
          required
          inputMode="decimal"
          placeholder={current ? rateText(current.etbPerUsd) : "0.00"}
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          hint="Up to four decimals. Saved as a new version and audited; quotes already given keep their rate."
        />
        <TextInput id="rate-note" label="Note (optional)" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} hint="For example, where the rate comes from." />
        {problem && (
          <p role="alert" className="text-small text-danger">
            {problem}
          </p>
        )}
      </div>
    </Dialog>
  );
}
