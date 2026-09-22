import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Lock, Mail, LifeBuoy, ChevronDown } from "lucide-react";
import {
  Panel,
  Button,
  Tabs,
  TabPanel,
  TextInput,
  DemoNotice,
  Skeleton,
  ErrorState, EmptyState } from "@addiscard/ui";
import { customerService, isUnavailable } from "@addiscard/services";
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../hooks/useAsync.js";

const SUPPORT_EMAIL = "support@addiscard.test";

const TABS = [
  { value: "profile", label: "Profile" },
  { value: "security", label: "Security" },
  { value: "notifications", label: "Notifications" },
  { value: "fees", label: "Fees" },
  { value: "help", label: "Help" },
];

/* ------------------------------ Profile ------------------------------ */

function ProfileTab() {
  const { user } = useAuth();
  const [language, setLanguage] = useState(user?.language || "en");

  return (
    <div className="flex flex-col gap-5">
      <Panel title="Profile" description="The name on your demo account.">
        <TextInput
          label="Full name"
          value={user?.fullName || ""}
          readOnly
          hint="Editing a profile is not part of this prototype."
        />
        <div className="mt-4">
          <Button disabled disabledReason="Editing your profile needs a backend that does not exist yet.">
            Save changes
          </Button>
        </div>
      </Panel>

      <Panel title="Contact details" description="Your sign-in identifiers.">
        <div className="flex flex-col gap-4">
          <TextInput label="Email" value={user?.email || ""} readOnly />
          <TextInput
            label="Phone"
            value={user?.phone || "Not provided"}
            readOnly
          />
        </div>
      </Panel>

      <Panel title="Language" description="Used for messages we send you.">
        <div className="flex gap-2">
          {[
            { value: "en", label: "English" },
            { value: "am", label: "አማርኛ" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setLanguage(option.value)}
              aria-pressed={language === option.value}
              className={`rounded-field px-4 py-2 text-[13px] font-medium transition-colors ${
                language === option.value
                  ? "bg-brand text-white"
                  : "border border-line-strong dark:border-line-strong-dark text-ink dark:text-ink-dark hover:bg-panel-muted dark:hover:bg-white/5"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-ink-faint">
          This choice is not saved — there is nowhere to save it yet.
        </p>
      </Panel>
    </div>
  );
}

/* ------------------------------ Security ----------------------------- */

function SecurityTab() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  // Validation runs for real; only the submit is unavailable.
  const validate = () => {
    if (next.length < 8) return "New password must be at least 8 characters.";
    if (next !== confirm) return "New passwords do not match.";
    if (next === current) return "New password must be different from your current one.";
    return "";
  };

  const onBlur = () => {
    if (current && next && confirm) setError(validate());
  };

  return (
    <div className="flex flex-col gap-5">
      <DemoNotice>
        Password, PIN and two-factor changes need a backend that does not exist yet. The forms
        below validate, but cannot save.
      </DemoNotice>

      <Panel
        title="Password"
        description="Changing your password would sign out every other device."
      >
        <div className="flex max-w-md flex-col gap-4">
          <TextInput
            label="Current password"
            type="password"
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
            onBlur={onBlur}
          />
          <TextInput
            label="New password"
            type="password"
            hint="At least 8 characters."
            value={next}
            onChange={(event) => setNext(event.target.value)}
            onBlur={onBlur}
          />
          <TextInput
            label="Confirm new password"
            type="password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            onBlur={onBlur}
            error={error}
          />
          <Button
            disabled
            disabledReason="Changing your password needs a backend that does not exist yet."
            className="self-start"
          >
            Change password
          </Button>
        </div>
      </Panel>

      <Panel title="Card PIN" description="A 4-digit PIN would reveal card details without an SMS code.">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-ink-muted dark:text-ink-muted-dark">
            You haven&apos;t set a PIN yet.
          </p>
          <Button disabled disabledReason="PIN management is not part of this prototype.">
            Set up PIN
          </Button>
        </div>
      </Panel>

      <Panel
        title="Two-factor authentication"
        description="A code from your authenticator app on sign-in."
      >
        <Button
          variant="secondary"
          disabled
          disabledReason="Two-factor enrolment is not part of this prototype."
        >
          Set up authenticator
        </Button>
      </Panel>
    </div>
  );
}

/* --------------------------- Notifications --------------------------- */

const CHANNELS = [
  { key: "email", label: "Email" },
  { key: "sms", label: "SMS" },
  { key: "push", label: "Push" },
];

const GROUPS = [
  {
    key: "security",
    title: "Security",
    description: "Sign-in codes, password changes and account protection alerts.",
    note: "Security alerts are always on to protect your account.",
    locked: true,
  },
  {
    key: "account",
    title: "Account",
    description: "Profile changes and service announcements.",
  },
  {
    key: "transactions",
    title: "Transactions",
    description: "Card payments, funding and balance activity.",
  },
];

function Toggle({ checked, disabled, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
        checked ? "bg-brand" : "bg-line-strong dark:bg-line-strong-dark"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <span
        className={`inline-block h-[17px] w-[17px] transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[19px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState(() =>
    Object.fromEntries(GROUPS.map((group) => [group.key, { email: true, sms: true, push: true }]))
  );

  const setChannel = (groupKey, channel, value) =>
    setPrefs((current) => ({ ...current, [groupKey]: { ...current[groupKey], [channel]: value } }));

  return (
    <div className="flex flex-col gap-5">
      <DemoNotice>
        These switches change only what is on screen. There is nowhere to save a preference yet, so
        nothing is saved.
      </DemoNotice>

      <Panel padded={false}>
        <div className="hidden items-center justify-end gap-6 border-b border-line dark:border-line-dark px-5 py-3 sm:flex">
          {CHANNELS.map((channel) => (
            <span key={channel.key} className="w-[38px] text-center text-[12px] text-ink-muted dark:text-ink-muted-dark">
              {channel.label}
            </span>
          ))}
        </div>

        <div className="divide-y divide-line dark:divide-line-dark">
          {GROUPS.map((group) => (
            <div key={group.key} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <h3 className="text-[14px] font-semibold text-ink dark:text-ink-dark">
                  {group.title}
                </h3>
                <p className="mt-0.5 text-[13px] text-ink-muted dark:text-ink-muted-dark">
                  {group.description}
                </p>
                {group.note && (
                  <p className="mt-2 flex items-center gap-1.5 text-[12px] text-ink-faint">
                    <Lock size={12} />
                    {group.note}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-6 sm:shrink-0">
                {CHANNELS.map((channel) => (
                  <div key={channel.key} className="flex w-[38px] flex-col items-center gap-1">
                    <span className="text-[11px] text-ink-faint sm:hidden">{channel.label}</span>
                    <Toggle
                      label={`${group.title} — ${channel.label}`}
                      checked={group.locked ? true : prefs[group.key][channel.key]}
                      disabled={group.locked}
                      onChange={(value) => setChannel(group.key, channel.key, value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ------------------------------- Fees -------------------------------- */

const FEE_GROUPS = [
  {
    key: "wallet",
    title: "Wallet fees",
    description: "What deposits, withdrawals and transfers cost.",
    items: ["Deposit", "Withdrawal to bank", "Transfer to another Arifcard user"],
  },
  {
    key: "card",
    title: "Card fees",
    description: "What issuing, funding and using a card costs.",
    items: ["Card issuance", "Card funding from wallet", "Foreign exchange margin", "Declined transaction"],
  },
  {
    key: "balance",
    title: "Card balance and related",
    description: "How your card balance works, and what has to stay on it.",
    items: ["Minimum balance to keep a card active", "Monthly maintenance", "Inactivity charge"],
  },
];

function FeesTab() {
  const [openKey, setOpenKey] = useState(null);

  return (
    <div className="flex flex-col gap-5">
      <DemoNotice>
        Amounts are intentionally blank. Real pricing is a business decision and inventing numbers
        here would be worse than showing none.
      </DemoNotice>

      <Panel
        title="Fees &amp; charges"
        description="What we charge, and when."
        padded={false}
      >
        <div className="divide-y divide-line dark:divide-line-dark">
          {FEE_GROUPS.map((group) => {
            const open = openKey === group.key;
            return (
              <div key={group.key}>
                <button
                  type="button"
                  id={`fees-button-${group.key}`}
                  aria-expanded={open}
                  aria-controls={`fees-panel-${group.key}`}
                  onClick={() => setOpenKey(open ? null : group.key)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-panel-muted dark:hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                >
                  <span className="min-w-0">
                    <span className="block text-[14px] font-medium text-ink dark:text-ink-dark">
                      {group.title}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-ink-muted dark:text-ink-muted-dark">
                      {group.description}
                    </span>
                  </span>
                  <ChevronDown
                    size={17}
                    aria-hidden
                    className={`shrink-0 text-ink-faint transition-transform duration-[250ms] ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  id={`fees-panel-${group.key}`}
                  role="region"
                  aria-labelledby={`fees-button-${group.key}`}
                  className="grid transition-[grid-template-rows] duration-[250ms] ease-in-out"
                  style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <dl className="px-5 pb-4">
                      {group.items.map((item) => (
                        <div
                          key={item}
                          className="flex items-center justify-between gap-4 border-t border-line dark:border-line-dark py-2.5"
                        >
                          <dt className="text-[13px] text-ink-muted dark:text-ink-muted-dark">
                            {item}
                          </dt>
                          <dd className="font-mono text-[13px] text-ink-faint">—</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

/* ------------------------------- Help -------------------------------- */

function HelpTab() {
  return (
    <div className="flex flex-col gap-5">
      <Panel>
        <span className="flex h-11 w-11 items-center justify-center rounded-field bg-brand/10 text-brand">
          <LifeBuoy size={19} />
        </span>
        <h2 className="mt-4 text-[15px] font-semibold text-ink dark:text-ink-dark">Get help</h2>
        <p className="mt-1 text-[13px] text-ink-muted dark:text-ink-muted-dark">
          This is a prototype support address. It does not reach a real support desk.
        </p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="mt-5 inline-flex items-center gap-2 rounded-field bg-brand px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          <Mail size={15} />
          {SUPPORT_EMAIL}
        </a>
      </Panel>
    </div>
  );
}

/* ------------------------------- Page -------------------------------- */

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("tab");
  const active = TABS.some((tab) => tab.value === requested) ? requested : "profile";

  const { error, loading, reload } = useAsync(() => customerService.overview(), []);

  const selectTab = (value) =>
    setSearchParams(value === "profile" ? {} : { tab: value }, { replace: true });

  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">
        Settings
      </h1>
      <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
        Your account, security, notifications and what we charge.
      </p>

      <div className="mt-6">
        <Tabs tabs={TABS} value={active} onChange={selectTab} ariaLabel="Settings sections" />
      </div>

      <TabPanel value={active}>
        {active === "profile" && loading && <Skeleton className="h-[320px] w-full" />}
        {active === "profile" && !loading && error && (
          isUnavailable(error) ? (
            <EmptyState title="Profile details are not available yet" description="The profile record this tab reads does not exist yet. Your name and email above come from your sign-in." dashed />
          ) : (
            <ErrorState title="Could not load your profile" message={error.message} onRetry={reload} />
          )
        )}
        {active === "profile" && !loading && !error && (
          <ProfileTab />
        )}

        {active === "security" && <SecurityTab />}
        {active === "notifications" && <NotificationsTab />}
        {active === "fees" && <FeesTab />}
        {active === "help" && <HelpTab />}
      </TabPanel>
    </>
  );
}
