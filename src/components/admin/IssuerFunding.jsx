import { useCallback, useMemo, useState } from "react";
import { RefreshCw, Plus, AlertTriangle } from "lucide-react";
import { Badge, Button, Skeleton, TextInput, SelectInput, TextArea, useToast } from "@addiscard/ui";
import { adminService } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";

/**
 * Programme funding for one customer's card: USDC collateral at the issuer.
 *
 * Staff-only, and nothing here moves money. "Record expected deposit"
 * fetches where a deposit goes and records how much is expected; the
 * deposit itself is made outside Arifcard. A record is confirmed only by
 * deposits the issuer has identified (top-up orders) — never by the
 * aggregate balance, which is shown for context only.
 */
const TONE = {
  AWAITING_DEPOSIT: "neutral",
  PROCESSING: "info",
  PARTIALLY_FUNDED: "warn",
  CONFIRMED: "ok",
  DISCREPANCY: "danger",
  DEPOSIT_FAILED: "danger",
  CANCELED: "neutral",
};
const LABEL = {
  AWAITING_DEPOSIT: "Awaiting deposit",
  PROCESSING: "Deposit processing",
  PARTIALLY_FUNDED: "Partially funded",
  CONFIRMED: "Funded",
  DISCREPANCY: "Discrepancy",
  DEPOSIT_FAILED: "Deposit failed",
  CANCELED: "Canceled",
};
const OPEN = ["AWAITING_DEPOSIT", "PROCESSING", "PARTIALLY_FUNDED", "DISCREPANCY", "DEPOSIT_FAILED"];

export default function IssuerFunding({ uid }) {
  const toast = useToast();
  const load = useCallback(() => adminService.issuerFunding(uid), [uid]);
  const { data, error, loading, reload } = useAsync(load, [uid]);
  const [form, setForm] = useState({ expectedUsdc: "", choice: "" });
  const [busy, setBusy] = useState(null);

  const choices = useMemo(
    () =>
      (data?.options || []).flatMap((asset) =>
        asset.networks
          .filter((n) => n.mode === "convert" && n.available)
          .map((n) => ({ value: `${asset.coin}|${n.network}`, label: `${asset.coin} on ${n.label || n.network}${n.feePct ? ` · ${n.feePct}% fee` : ""}${n.feeNetworkUsd ? ` + $${n.feeNetworkUsd}` : ""}` }))
      ),
    [data]
  );

  const act = async (key, fn, success) => {
    setBusy(key);
    try {
      await fn();
      if (success) toast.success(success);
      reload();
    } catch (problem) {
      toast.error(problem?.message || "That did not work.");
    } finally {
      setBusy(null);
    }
  };

  const create = () => {
    const [coin, network] = form.choice.split("|");
    return act("create", () => adminService.createIssuerFunding(uid, { expectedUsdc: form.expectedUsdc, coin, network }), "Expected deposit recorded.");
  };

  return (
    <div>
      <p className="text-[13px] font-medium text-ink dark:text-ink-dark">Card funding (USDC collateral)</p>
      {loading && <Skeleton className="mt-2 h-[80px] w-full" />}
      {!loading && error && <p className="mt-2 text-[12.5px] text-danger">{error.message}</p>}
      {!loading && data && (
        <div className="mt-2 flex flex-col gap-3">
          {!data.route.ready && (
            <p className="flex items-start gap-2 rounded-panel border border-line dark:border-line-dark px-4 py-3 text-[12.5px] text-ink-muted dark:text-ink-muted-dark">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Blocked: {data.route.reason}</span>
            </p>
          )}
          {data.problem && <p className="text-[12.5px] text-ink-muted dark:text-ink-muted-dark">{data.problem}</p>}
          {data.balances && (
            <p className="text-[12px] text-ink-faint">
              Issuer balance: {Object.entries(data.balances.values).map(([k, v]) => `${k} ${v}`).join(" · ") || "—"}. {data.balances.note}
            </p>
          )}

          {data.route.ready && choices.length > 0 && !data.records.some((r) => OPEN.includes(r.status)) && (
            <div className="grid gap-3 rounded-panel border border-line dark:border-line-dark p-4 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
              <TextInput label="Expected USDC" inputMode="decimal" placeholder="25.00" value={form.expectedUsdc} onChange={(e) => setForm({ ...form, expectedUsdc: e.target.value })} />
              <SelectInput label="Coin and network" options={choices} value={form.choice} onChange={(e) => setForm({ ...form, choice: e.target.value })} />
              <Button icon={Plus} loading={busy === "create"} disabled={!form.expectedUsdc || !form.choice} onClick={create}>
                Record expected deposit
              </Button>
            </div>
          )}

          {data.records.length === 0 ? (
            <p className="text-[12.5px] text-ink-faint">No funding recorded.</p>
          ) : (
            <ul className="divide-y divide-line dark:divide-line-dark rounded-panel border border-line dark:border-line-dark">
              {data.records.map((r) => (
                <FundingRow key={r.id} record={r} busy={busy} act={act} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function FundingRow({ record: r, busy, act }) {
  const [reason, setReason] = useState("");
  const open = OPEN.includes(r.status);
  const acceptable = ["PARTIALLY_FUNDED", "DISCREPANCY"].includes(r.status);

  return (
    <li className="px-4 py-3 text-[12.5px]">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={TONE[r.status]}>{LABEL[r.status] || r.status}</Badge>
        <span className="font-mono">
          {r.confirmedUsdc} / {r.expectedUsdc} USDC
        </span>
        <span className="text-ink-faint">fees {r.feesUsd} USD · {r.coin} on {r.network}</span>
        {open && (
          <Button variant="secondary" size="sm" icon={RefreshCw} loading={busy === `sync-${r.id}`} onClick={() => act(`sync-${r.id}`, () => adminService.syncIssuerFunding(r.id))} className="ml-auto">
            Check deposits
          </Button>
        )}
      </div>

      {open && r.instruction && (
        <p className="mt-2 text-ink-muted dark:text-ink-muted-dark">
          Deposit address (fetched {new Date(r.instruction.fetchedAt).toLocaleString()}): <span className="break-all font-mono">{r.instruction.depositAddress}</span>
          <br />
          Send only {r.coin} on {r.network}. Another coin or network can lose the funds. This is the sandbox: send nothing real.
        </p>
      )}

      {r.deposits.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1 text-ink-faint">
          {r.deposits.map((d) => (
            <li key={d.orderRef} className="font-mono text-[11.5px]">
              {d.orderRef} · {d.status} · in {d.amountIn ?? "—"} {d.coin} · credited {d.creditedUsdc ?? "—"} USDC · fees {d.feesUsd ?? "—"}
            </li>
          ))}
        </ul>
      )}

      {r.lastSyncProblem && <p className="mt-1 text-ink-faint">Last check: {r.lastSyncProblem}</p>}
      {r.resolution && (
        <p className="mt-1 text-ink-faint">
          {r.resolution.resolution} by {r.resolution.by}: {r.resolution.reason}
        </p>
      )}

      {open && (
        <div className="mt-3 flex flex-col gap-2">
          <TextArea label="Reason (for accept or cancel)" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {acceptable && (
              <Button size="sm" variant="secondary" loading={busy === `accept-${r.id}`} disabled={reason.trim().length < 10} onClick={() => act(`accept-${r.id}`, () => adminService.resolveIssuerFunding(r.id, { resolution: "ACCEPTED", reason }), "Accepted at the credited amount.")}>
                Accept credited amount
              </Button>
            )}
            <Button size="sm" variant="secondary" loading={busy === `cancel-${r.id}`} disabled={reason.trim().length < 10} onClick={() => act(`cancel-${r.id}`, () => adminService.resolveIssuerFunding(r.id, { resolution: "CANCELED", reason }), "Funding record canceled.")}>
              Cancel record
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}
