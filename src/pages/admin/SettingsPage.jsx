import { useCallback, useState } from "react";
import { CircleCheck, CircleDashed, ShieldCheck, PlugZap } from "lucide-react";
import { Panel, PageHeader, StatusPill, ErrorState, Skeleton, Button, formatDateTime } from "@addiscard/ui";
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
 * one Arifcard actually holds.
 *
 * Nothing on this page is editable. Changing a receiving account needs
 * reauthentication, versioning and an audit entry, and a control that
 * looked editable but silently did nothing would be worse than none.
 */
const ROLE_LABEL = { owner: "Owner", admin: "Administrator", reviewer: "Reviewer" };

export default function SettingsPage() {
  const { user } = useAuth();
  const load = useCallback(() => adminService.settings(), []);
  const { data, error, loading, reload } = useAsync(load, []);
  const configuration = data?.configuration || {};

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="What is configured. Secret values are never shown here, only whether they're set." />

      <Panel title="Your account" padded={false}>
        <dl className="divide-y divide-line">
          <Row label="Name" value={user?.fullName || "Not set"} />
          <Row label="Email" value={<span className="break-all">{user?.email}</span>} />
          <Row
            label="Role"
            value={
              <span className="inline-flex flex-wrap items-center justify-end gap-2">
                <StatusPill tone={user?.isOwner ? "accent" : "neutral"} icon={null}>
                  {ROLE_LABEL[user?.staffRole] || user?.staffRole || "Staff"}
                </StatusPill>
                {user?.isOwner && (
                  <span className="inline-flex items-center gap-1 text-caption text-ink-muted">
                    <ShieldCheck size={13} aria-hidden /> Account owner
                  </span>
                )}
              </span>
            }
          />
        </dl>
        <p className="border-t border-line px-4 py-3 text-caption text-ink-muted sm:px-6">
          Access is granted from the server by a provisioning script and can't be changed from this page, by you or anyone else. Two-step sign-in is
          a production requirement and isn't built yet.
        </p>
      </Panel>

      {loading && <Skeleton className="h-[300px] w-full rounded-panel" />}
      {!loading && error && <ErrorState title="We couldn't load the configuration" error={error} onRetry={reload} />}
      {!loading && !error && (
        <>
          <Panel title="System" description="Each item is either set or not." padded={false}>
            <ul className="divide-y divide-line">
              {Object.entries(configuration).map(([key, item]) => {
                const ok = item.status === "configured";
                const Icon = ok ? CircleCheck : CircleDashed;
                return (
                  <li key={key} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-start sm:gap-3 sm:px-6">
                    <Icon size={18} aria-hidden className={`mt-0.5 hidden shrink-0 sm:block ${ok ? "text-success" : "text-ink-muted"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-small font-semibold text-ink">{item.label}</p>
                      <p className="mt-0.5 break-words text-small text-ink-soft">{item.detail}</p>
                      {item.note && <p className="mt-1 text-caption text-ink-muted">{item.note}</p>}
                    </div>
                    <StatusPill tone={ok ? "success" : "neutral"}>{ok ? "Configured" : "Not configured"}</StatusPill>
                  </li>
                );
              })}
            </ul>
          </Panel>
          <ConnectionCheck />
        </>
      )}
    </div>
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
      setState({ busy: false, result: null, error: problem?.message || "The check couldn't run." });
    }
  };
  const r = state.result;

  return (
    <Panel
      title="Card issuer connection"
      description="Sends one read-only request to the card issuer from this server, to confirm the key and network work. Administrators only."
      action={
        <Button size="sm" variant="secondary" icon={PlugZap} loading={state.busy} onClick={run}>
          Test connection
        </Button>
      }
    >
      <div aria-live="polite">
        {!r && !state.error && <p className="text-small text-ink-muted">Not tested in this session.</p>}
        {state.error && (
          <p role="alert" className="text-small text-danger">
            {state.error}
          </p>
        )}
        {r && (
          <div className="flex flex-col gap-2">
            <StatusPill tone={r.ok ? "success" : "danger"}>{r.ok ? `Connected (${r.environment})` : "Not connected"}</StatusPill>
            <p className="text-small text-ink-soft">
              {r.ok
                ? `HTTP ${r.httpStatus}. ${r.cardCount ?? "An unknown number of"} card${r.cardCount === 1 ? "" : "s"} in the programme.`
                : `${r.error?.code ? `${r.error.code}: ` : ""}${r.error?.message || "No details returned."}`}
            </p>
            <p className="text-caption text-ink-muted">Checked {formatDateTime(r.checkedAt)}</p>
          </div>
        )}
      </div>
    </Panel>
  );
}

function Row({ label, value }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-center gap-4 px-4 py-3 sm:px-6">
      <dt className="text-small text-ink-muted">{label}</dt>
      <dd className="min-w-0 text-right text-small text-ink">{value}</dd>
    </div>
  );
}
