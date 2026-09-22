import { useState } from "react";
import { Plus, CreditCard, Snowflake, Play, Eye } from "lucide-react";
import {
  Panel,
  Button,
  Badge,
  Skeleton,
  ErrorState,
  EmptyState,
  DemoNotice,
  useToast,
} from "@addiscard/ui";
import {
  customerService,
  ApiError,
  CARD_STATUS,
  CARD_STATUS_LABEL,
  CARD_STATUS_TONE, isUnavailable } from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";

/** Masked card face. Real PANs never exist in this prototype. */
function CardFace({ card }) {
  const frozen = card.status === CARD_STATUS.FROZEN;
  const pending = card.status === CARD_STATUS.PENDING;

  return (
    <div
      className={`relative w-full max-w-[340px] rounded-panel border border-white/10 bg-[#101217] p-5 ${
        frozen || pending ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-[13px] font-semibold text-white/90">Arifcard</span>
        <Badge tone={CARD_STATUS_TONE[card.status]}>{CARD_STATUS_LABEL[card.status]}</Badge>
      </div>

      <p className="mt-7 font-mono text-[15px] tracking-[0.18em] text-white/90">
        •••• •••• •••• {card.last4}
      </p>

      <div className="mt-5 flex items-end justify-between">
        <div className="font-mono text-[9px] uppercase tracking-wider text-ink-faint">
          <p>Expires</p>
          <p className="mt-0.5 text-white/80">{card.expiry}</p>
        </div>
        <div className="font-mono text-[9px] uppercase tracking-wider text-ink-faint text-right">
          <p>Balance</p>
          <p className="mt-0.5 text-white/80">
            {Number(card.balanceUsd).toFixed(2)} USD
          </p>
        </div>
      </div>

      {(frozen || pending) && (
        <p className="mt-4 text-[11.5px] text-white/60">
          {frozen ? "Frozen. Payments are declined until you unfreeze." : "Pending activation."}
        </p>
      )}
    </div>
  );
}

function CardRow({ card, onToggleFreeze, busyId }) {
  const pending = card.status === CARD_STATUS.PENDING;
  const frozen = card.status === CARD_STATUS.FROZEN;
  const busy = busyId === card.id;

  return (
    <div className="flex flex-col gap-4 border-b border-line dark:border-line-dark px-5 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <CardFace card={card} />

      <div className="flex flex-wrap gap-2 sm:flex-col sm:items-stretch">
        <Button
          variant="secondary"
          size="sm"
          icon={Eye}
          disabled
          disabledReason="Card details are not generated in this prototype."
        >
          View details
        </Button>

        <Button
          variant="secondary"
          size="sm"
          icon={frozen ? Play : Snowflake}
          loading={busy}
          disabled={pending}
          disabledReason={pending ? "A pending card cannot be frozen yet." : undefined}
          onClick={() => onToggleFreeze(card)}
        >
          {frozen ? "Unfreeze" : "Freeze"}
        </Button>
      </div>
    </div>
  );
}

export default function CardsPage() {
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);
  const [creating, setCreating] = useState(false);

  const { data, error, loading, reload, setData } = useAsync(
    () => customerService.overview(),
    []
  );

  const cards = data?.cards || [];

  const createCard = async () => {
    setCreating(true);
    try {
      const { card } = await customerService.createCard();
      setData((current) => ({ ...current, cards: [...(current?.cards || []), card] }));
      toast.success("Demo card created. It starts as pending.");
    } catch (problem) {
      toast.error(problem instanceof ApiError ? problem.message : "Could not create the card.");
    } finally {
      setCreating(false);
    }
  };

  const toggleFreeze = async (card) => {
    setBusyId(card.id);
    try {
      const { card: updated } = await customerService.toggleFreeze(card.id);
      setData((current) => ({
        ...current,
        cards: current.cards.map((item) => (item.id === updated.id ? updated : item)),
      }));
      toast.success(
        updated.status === CARD_STATUS.FROZEN ? "Card frozen." : "Card unfrozen."
      );
    } catch (problem) {
      toast.error(problem instanceof ApiError ? problem.message : "Could not update the card.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-ink-dark">
            Cards
          </h1>
          <p className="mt-1 text-[13.5px] text-ink-muted dark:text-ink-muted-dark">
            Virtual USD cards, funded from your wallet.
          </p>
        </div>
        <Button
          icon={Plus}
          loading={creating}
          onClick={createCard}
          className="shrink-0"
        >
          New card
        </Button>
      </div>

      {loading && (
        <div className="mt-6 flex flex-col gap-5">
          <Skeleton className="h-[86px] w-full" />
          <Skeleton className="h-[240px] w-full" />
        </div>
      )}

      {!loading && error && (
        <div className="mt-6">
          {isUnavailable(error) ? (
            <EmptyState title="Cards are not available yet" description="Card issuing is not built. Nothing is shown here rather than a placeholder card that is not yours." dashed />
          ) : (
            <ErrorState title="Could not load your cards" message={error.message} onRetry={reload} />
          )}
        </div>
      )}

      {!loading && !error && data && (
        <div className="mt-6 flex flex-col gap-5">
          <DemoNotice>
            Card issuing is not built. No card number is generated, nothing is issued, and no
            payment network is involved.
          </DemoNotice>

          <Panel padded={false}>
            {cards.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title="No cards yet"
                description="Create a virtual card and pay online anywhere the network is accepted."
                action={
                  <Button
                    icon={Plus}
                    loading={creating}
                    onClick={createCard}
                  >
                    Create your first card
                  </Button>
                }
              />
            ) : (
              cards.map((card) => (
                <CardRow
                  key={card.id}
                  card={card}
                  busyId={busyId}
                  onToggleFreeze={toggleFreeze}
                />
              ))
            )}
          </Panel>
        </div>
      )}
    </>
  );
}
