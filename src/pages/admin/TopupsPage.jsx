import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@addiscard/ui";
import TopupRequests from "../../components/admin/TopupRequests.jsx";
import { TOPUP_BUCKETS } from "../../data/bitnobAdmin.js";

/**
 * Card top-up requests — its own queue, separate from initial card
 * issuance: a top-up funds a card that already exists. The group is in the
 * URL, so the operations overview links straight to it and a filtered view
 * can be shared or reloaded.
 */
export default function TopupsPage() {
  const [params, setParams] = useSearchParams();
  const requested = params.get("bucket");
  const bucket = TOPUP_BUCKETS.some((b) => b.value === requested) ? requested : null;
  const setBucket = (next) => {
    const nextParams = new URLSearchParams(params);
    if (next) nextParams.set("bucket", next);
    else nextParams.delete("bucket");
    setParams(nextParams, { replace: true });
  };
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Top-up requests"
        description="Customers adding money to a card they already have. Card provider: Bitnob sandbox (test cards, no real money). Funding is approved and sent in separate, confirmed steps."
      />
      <TopupRequests bucket={bucket} onBucket={setBucket} />
    </div>
  );
}
