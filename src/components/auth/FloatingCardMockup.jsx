import { VirtualCard } from "@addiscard/ui";

/**
 * One Arifcard card in the sign-in showcase: the real card artwork, tilted
 * and drifting slowly. Masked digits and a placeholder name only — it is an
 * illustration, never anyone's card. Decorative: the showcase as a whole
 * carries one description for screen readers.
 */
export function FloatingCardMockup({ tone = "violet", tilt = 0, last4 = "4821", holder = "Card holder", late = false, className = "" }) {
  return (
    <div className={`${late ? "motion-safe:animate-float-late" : "motion-safe:animate-float"} ${className}`}>
      <div style={{ rotate: `${tilt}deg` }}>
        <VirtualCard tone={tone} state="active" last4={last4} holder={holder} />
      </div>
    </div>
  );
}

export default FloatingCardMockup;
