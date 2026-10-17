import { useId } from "react";
import { LockKeyhole, ScrollText, ShieldCheck, Server } from "lucide-react";
import FloatingCardMockup from "./FloatingCardMockup";
import { DashboardPreviewCard, StatusPreviewCard } from "./DashboardPreviewCard";
import { FeatureBadgeList } from "./FeatureBadge";

/**
 * The staff-console showcase beside the sign-in form — the same visual
 * language as the customer site (layered Arifcard cards, preview panels,
 * a blue orbit line), with the staff side of the product: the review
 * queues and the audited decision trail. Every figure is illustrative and
 * the panel says "Preview".
 *
 * `compact` is the phone/tablet version shown under the form.
 */

const FEATURES = [
  { icon: LockKeyhole, text: "Staff-only access" },
  { icon: ScrollText, text: "Every action audited" },
  { icon: ShieldCheck, text: "The backend re-checks every decision" },
  { icon: Server, text: "Sandbox and live kept apart" },
];

const DESCRIPTION =
  "Preview of the Arifcard staff console: two virtual cards, the review queues for identities, payments and card issuance, and a decision trail from receipt verified to identity approved, recorded in the audit log.";

export function AuthHeroPanel({ compact = false }) {
  if (compact) {
    return (
      <section aria-label="The staff console" className="rounded-panel border border-line bg-surface-0 p-5 sm:p-6">
        <h2 className="text-h3 font-semibold text-ink">Review, verify and issue, with every decision recorded</h2>
        <div role="img" aria-label={DESCRIPTION} className="mt-5">
          <div aria-hidden>
            <DashboardPreviewCard className="shadow-none" />
          </div>
        </div>
        <FeatureBadgeList items={FEATURES} label="Staff console safeguards" className="mt-5" />
      </section>
    );
  }

  return (
    <section aria-label="The staff console" className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-panel border border-line bg-surface-0 px-8 py-9 xl:px-12 xl:py-11">
      <div className="max-w-[460px]">
        <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-1 px-3 py-1 text-caption font-medium text-ink-muted">
          <span aria-hidden className="size-1.5 rounded-full bg-link" />
          Staff console preview
        </p>
        <h2 className="mt-4 text-h1 font-semibold text-ink">Review identities. Verify payments. Issue cards.</h2>
        <p className="mt-2 max-w-[60ch] text-body text-ink-muted">
          Every decision is checked again by the backend and recorded in the audit log: who acted, when and why.
        </p>
      </div>

      <div role="img" aria-label={DESCRIPTION} className="relative mx-auto mt-8 aspect-[1.12/1] w-full max-w-[560px] flex-1 xl:mt-10">
        <Orbit />
        <div aria-hidden>
          <FloatingCardMockup tone="midnight" tilt={-9} last4="1726" late className="absolute top-[4%] left-[2%] w-[56%]" />
          <FloatingCardMockup tone="violet" tilt={-3} className="absolute top-[17%] left-[13%] w-[60%]" />
          <StatusPreviewCard className="absolute top-0 right-0 w-[47%] motion-safe:animate-float-late" />
          <DashboardPreviewCard className="absolute right-[1%] bottom-[2%] w-[56%] motion-safe:animate-float" />
        </div>
        <Orbit front />
      </div>

      <FeatureBadgeList items={FEATURES} label="Staff console safeguards" className="mt-8 xl:mt-10" />
    </section>
  );
}

/** The same orbit as the customer site: drawn behind, its lower-left quarter again in front of the cards. */
function Orbit({ front = false }) {
  const clip = `orbit-front-${useId().replace(/:/g, "")}`;
  const ring = { cx: 280, cy: 255, rx: 318, ry: 150, transform: "rotate(-16 280 255)", fill: "none", strokeWidth: 2.25 };
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 560 500" preserveAspectRatio="none" className={`pointer-events-none absolute inset-0 h-full w-full overflow-visible ${front ? "z-10" : ""}`}>
      {front ? (
        <>
          <defs>
            <clipPath id={clip}>
              <rect x="-80" y="255" width="330" height="320" />
            </clipPath>
          </defs>
          <ellipse {...ring} className="stroke-link" opacity="0.9" clipPath={`url(#${clip})`} />
        </>
      ) : (
        <>
          <ellipse {...ring} className="stroke-link" opacity="0.5" />
          <ellipse cx="280" cy="255" rx="250" ry="205" transform="rotate(-16 280 255)" fill="none" className="stroke-line-strong" strokeWidth="1" strokeDasharray="2 8" opacity="0.5" />
        </>
      )}
    </svg>
  );
}

export default AuthHeroPanel;
