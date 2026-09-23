import { ArrowLeftRight } from "lucide-react";
import { Panel, EmptyState } from "@addiscard/ui";

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
 * section is planned and its absence is a fact worth stating.
 */
export default function TransactionsPage() {
  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">Transactions</h1>
      <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
        The ledger of money received, fees and card funding.
      </p>

      <div className="mt-6">
        <Panel padded={false}>
          <EmptyState
            icon={ArrowLeftRight}
            title="There is no ledger yet"
            description="Receipts are verified and recorded, but nothing is credited to an account — so there are no transactions to list. Showing verified receipts here would imply money had been accounted for when it has not. Until allocation is built, Payments is the accurate view."
            dashed
          />
        </Panel>
      </div>
    </>
  );
}
