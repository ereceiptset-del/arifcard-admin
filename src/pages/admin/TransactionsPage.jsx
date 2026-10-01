import { Link } from "react-router-dom";
import { ArrowLeftRight } from "lucide-react";
import { Panel, PageHeader, EmptyState, buttonClasses } from "@addiscard/ui";

/**
 * Transactions.
 *
 * Deliberately empty, and honest about why.
 *
 * A transaction list implies a ledger — entries that balance, fees split
 * from principal, a running position per customer. None of that is built:
 * verifying a receipt and crediting an account are separate things, and
 * only the first exists. Showing payment claims here under the heading
 * "Transactions" would suggest money had been accounted for when it has
 * not, which is the one impression this screen must not give.
 *
 * It stays in the navigation rather than being hidden, because the
 * section is planned and its absence is a fact worth stating. It points to
 * the screens that do have records.
 */
export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Transactions" description="The ledger of money received, fees and card funding." />
      <Panel padded={false}>
        <EmptyState
          headingLevel={2}
          icon={ArrowLeftRight}
          title="There's no ledger yet"
          description="Receipts are verified and recorded, but nothing is credited to an account, so there are no transactions to list. Showing verified receipts here would imply money had been accounted for when it hasn't."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/payments" className={buttonClasses()}>
                Open payments
              </Link>
              <Link to="/cards" className={buttonClasses({ variant: "secondary" })}>
                Open card operations
              </Link>
            </div>
          }
        />
      </Panel>
    </div>
  );
}
