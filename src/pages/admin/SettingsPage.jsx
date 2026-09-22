import { Panel, Button, Badge, DemoNotice, TextInput } from "@addiscard/ui";
import { useAuth } from "../../context/AuthContext";

/**
 * Reviewer console preferences.
 *
 * Nothing here is editable: there is no backend for reviewer profiles,
 * roles or permissions. The controls are disabled with reasons rather than
 * presented as working settings.
 */
export default function ConsoleSettingsPage() {
  const { user } = useAuth();

  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">
        Settings
      </h1>
      <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
        Reviewer account and console preferences.
      </p>

      <div className="mt-6 flex flex-col gap-5">
        <DemoNotice>
          There is no staff permission check yet. Any account that can sign in can open this
          console. Real permissions have to be enforced by the backend before this area means
          anything.
        </DemoNotice>

        <Panel title="Reviewer account" description="Provisioned internally. Not self-service.">
          <div className="flex max-w-md flex-col gap-4">
            <TextInput label="Name" value={user?.fullName || ""} readOnly />
            <TextInput label="Work email" value={user?.email || ""} readOnly />
            <TextInput label="Title" value={user?.title || "Verification reviewer"} readOnly />
          </div>
          <div className="mt-4">
            <Button disabled disabledReason="Editing a reviewer profile needs a backend that does not exist yet.">
              Save changes
            </Button>
          </div>
        </Panel>

        <Panel title="Role" description="What this account can do in the console.">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="brand">Reviewer</Badge>
            <span className="text-[13px] text-ink-muted dark:text-ink-muted-dark">
              Can read cases and record verification decisions.
            </span>
          </div>
          <p className="mt-4 text-[12px] text-ink-faint">
            There is no role selector and no way to grant access from this console. A reviewer
            account can only exist in the seed data.
          </p>
        </Panel>
      </div>
    </>
  );
}
