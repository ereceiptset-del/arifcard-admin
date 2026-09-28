import { useCallback, useState } from "react";
import { CheckCircle2, MinusCircle, ShieldCheck, PlugZap } from "lucide-react";
import { Panel, Badge, ErrorState, Skeleton, Button } from "@addiscard/ui";
import { adminService } from "@addiscard/services";
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../hooks/useAsync.js";

/**
 * Settings.
 *
 * **Status, never values.** Nothing here shows a secret, key or password.
 * A settings page that displayed the SMTP password so someone could check
 * it would put that password on a screen, in a browser cache, and in
 * every screenshot anyone took of the page.
 *
 * The receiving account is the deliberate exception: staff need to be
 * able to confirm that the account customers are told to pay into is the
 * one Arifcard actually holds. An account number that could be wrong and
 * could not be checked would be worse than one visible to the people
 * responsible for it.
 *
 * Nothing on this page is editable yet. Changing a receiving account
 * needs reauthentication, versioning and an audit entry, and a control
 * that looked editable but silently did nothing would be worse than none.
 */
export default function SettingsPage() {
  const { user } = useAuth();
  const load = useCallback(() => adminService.settings(), []);
  const { data, error, loading, reload } = useAsync(load, []);

  const configuration = data?.configuration || {};

  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">Settings</h1>
      <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
        What is configured. Secret values are never shown here, only whether they are set.
      </p>

      <div className="mt-6">
        <Panel title="Your account" padded={false}>
          <dl>
            <Row label="Name" value={user?.fullName || "—"} />
            <Row label="Email" value={user?.email || "—"} mono />
            <Row
              label="Role"
              value={
                <span className="inline-flex items-center gap-2">
                  <Badge tone={user?.isOwner ? "brand" : "neutral"}>{user?.staffRole || "—"}</Badge>
                  {user?.isOwner && (
                    <span className="inline-flex items-center gap-1 text-[12px] text-ink-faint">
                      <ShieldCheck size={12} aria-hidden="true" /> account owner
                    </span>
                  )}
                </span>
              }
            />
          </dl>
          <p className="border-t border-line dark:border-line-dark px-4 py-3 text-[12px] text-ink-faint">
            Access is granted from the server by a provisioning script and cannot be changed from this page —
            by you or by anyone else. Two-factor authentication is a production requirement and is not built
            yet.
          </p>
        </Panel>
      </div>

      {loading && <Skeleton className="mt-5 h-[300px] w-full" />}

      {!loading && error && (
        <div className="mt-5">
          <ErrorState title="Could not load configuration" message={error.message} onRetry={reload} />
        </div>
      )}

      {!loading && !error && (
        <div className="mt-5">
          <Panel title="System" description="Each item is set or it is not." padded={false}>
            <ul className="divide-y divide-line dark:divide-line-dark">
              {Object.entries(configuration).map(([key, item]) => {
                const ok = item.status === "configured";
                const Icon = ok ? CheckCircle2 : MinusCircle;
                return (
                  <li key={key} className="flex items-start gap-3 px-5 py-4">
                    <Icon
                      size={16}
                      className={`mt-0.5 shrink-0 ${ok ? "text-ok" : "text-ink-faint"}`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-medium text-ink dark:text-ink-dark">{item.label}</p>
                      <p className="mt-0.5 text-[12.5px] text-ink-muted dark:text-ink-muted-dark">
                        {item.detail}
                      </p>
                      {item.note && <p className="mt-1 text-[11.5px] text-ink-faint">{item.note}</p>}
                    </div>
                    <Badge tone={ok ? "ok" : "neutral"}>{ok ? "Configured" : "Not configured"}</Badge>
                  </li>
                );
              })}
            </ul>
          </Panel>
          <ConnectionCheck />
        </div>
      )}
    </>
  );
}

/**
 * One read-only request to the card issuer, made by the server from its own
 * network. Administrator only (the backend refuses anyone else). Shows the
 * shape of the answer — status and count — never card data.
 */
function ConnectionCheck() {
  const [state, setState] = useState({ busy: false, result: null, error: null });
  const run = async () => {
    setState({ busy: true, result: null, error: null });
    try {
      const { check, checkedAt } = await adminService.checkProviderConnection();
      setState({ busy: false, result: { ...check, checkedAt }, error: null });
    } catch (problem) {
      setState({ busy: false, result: null, error: problem?.message || "The check could not run." });
    }
  };
  const r = state.result;
  return (
    <div className="mt-5">
      <Panel
        title="Card issuer connection"
        description="Sends one read-only request to the card issuer from this server, to confirm the key and network work."
        action={
          <Button size="sm" variant="secondary" icon={PlugZap} loading={state.busy} onClick={run}>
            Test connection
          </Button>
        }
      >
        {!r && !state.error && <p className="text-[12.5px] text-ink-faint">Not tested in this session.</p>}
        {state.error && <p className="text-[12.5px] text-danger">{state.error}</p>}
        {r && (
          <p className="text-[12.5px] text-ink dark:text-ink-dark">
            {r.ok ? (
              <>Connected ({r.environment}) · HTTP {r.httpStatus} · {r.cardCount ?? "?"} card(s) in the programme.</>
            ) : (
              <>Not connected{r.error?.code ? ` — ${r.error.code}` : ""}{r.error?.message ? `: ${r.error.message}` : ""}</>
            )}
            <span className="ml-2 text-ink-faint">{new Date(r.checkedAt).toLocaleString()}</span>
          </p>
        )}
      </Panel>
    </div>
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
