import { PackageOpen } from "lucide-react";
import { Panel, EmptyState } from "@addiscard/ui";

/**
 * Card orders.
 *
 * There is no card provider integration, so there are no orders. Rather
 * than showing pending counts, issuance failures and reconciliation
 * queues as zeros — which would read as "nothing needs attention" instead
 * of "this does not exist" — the page says which it is.
 *
 * The section stays in the navigation because it is planned, and its
 * absence is a fact worth stating where someone would look for it.
 */
export default function CardOrdersPage() {
  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">Card orders</h1>
      <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
        Requests to issue a card, and their progress with the provider.
      </p>

      <div className="mt-6">
        <Panel padded={false}>
          <EmptyState
            icon={PackageOpen}
            title="Card provider integration not available"
            description="No card issuer is connected, so no orders exist and none can be placed. Pending counts, issuance failures and reconciliation queues will appear here once there is a provider to report them from — showing them as zero now would read as 'nothing needs attention' rather than 'this is not built'."
            dashed
          />
        </Panel>
      </div>
    </>
  );
}
