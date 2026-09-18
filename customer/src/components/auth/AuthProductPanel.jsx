import VirtualCard from "../cards/VirtualCard";

/**
 * AuthProductPanel
 *
 * The persistent left product presentation panel for authentication screens.
 * Strictly adheres to the reference hierarchy and spacing:
 * 1. Addiscard wordmark (top left)
 * 2. Virtual card
 * 3. Marketing headline
 * 4. Supporting text
 * 5. Small bottom product text
 *
 * Desktop padding: ~40px left/right, 44px top, 40px bottom.
 * Pure left-aligned, no centering.
 */
function AuthProductPanel({
  headline = "A USD card for paying online,\nanywhere.",
  supportingText = "Subscriptions, ads, flights, and tools. Top up in birr, spend in dollars.",
  bottomText = "VIRTUAL USD CARD",
}) {
  return (
    <div className="flex flex-col justify-between h-full min-h-screen py-11 px-10 bg-[#070B15] text-white">
      {/* Top Section: Wordmark, Card, and Marketing Copy */}
      <div className="flex flex-col">
        {/* 1. Addiscard Wordmark */}
        <div className="text-[17px] font-semibold tracking-tight text-white">
          Addiscard
        </div>

        {/* 2. Virtual Card */}
        <div className="mt-11">
          <VirtualCard />
        </div>

        {/* 3. Marketing Headline */}
        <h2 className="mt-9 text-[22px] font-semibold leading-[1.3] text-white whitespace-pre-line tracking-tight">
          {headline}
        </h2>

        {/* 4. Supporting Text */}
        <p className="mt-3 text-[13.5px] leading-relaxed text-[#8E96A4] max-w-[360px]">
          {supportingText}
        </p>
      </div>

      {/* 5. Bottom Small Product Text */}
      <div className="pt-10 text-[11px] font-mono tracking-[0.18em] text-[#606877] uppercase">
        {bottomText}
      </div>
    </div>
  );
}

export default AuthProductPanel;
