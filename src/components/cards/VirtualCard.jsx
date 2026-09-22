/**
 * VirtualCard
 *
 * Minimal, understated virtual card component for Arifcard.
 * Matches the reference authentication left panel:
 * - Dark graphite surface: #171C23
 * - Subtle border: 1px #323843
 * - Corner radius: rounded-xl (~12px)
 * - Dimensions: 384px x 240px (desktop)
 * - Understated: No glowing gradients, 3D tilts, or dramatic reflections.
 */
function VirtualCard({
  brandName = "Arifcard",
  last4 = "4921",
  holderName = "CARD HOLDER",
  expiry = "••/••",
  className = "",
}) {
  return (
    <div
      className={`relative flex flex-col justify-between w-[384px] h-[240px] p-6 rounded-xl bg-[#171C23] border border-[#323843] text-white shadow-sm select-none ${className}`}
      aria-label="Arifcard Virtual USD Card"
    >
      {/* Top Row: Wordmark & Outlined Badge */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold tracking-tight text-white/95">
          {brandName}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider text-[#8055FF] border border-[#8055FF]/40 uppercase">
          VIRTUAL
        </span>
      </div>

      {/* Chip Row: Original technical gold chip */}
      <div className="mt-1">
        <div className="relative w-[38px] h-[28px] rounded-[4px] bg-gradient-to-br from-[#E2C366] via-[#D4AF37] to-[#A88020] p-1 shadow-inner border border-[#B88F28]/60 overflow-hidden">
          {/* Subtle chip circuit patterns */}
          <div className="w-full h-full border border-black/20 rounded-[2px] grid grid-cols-2 gap-0.5 opacity-60">
            <div className="border-r border-b border-black/30"></div>
            <div className="border-b border-black/30"></div>
            <div className="border-r border-black/30"></div>
            <div></div>
          </div>
        </div>
      </div>

      {/* Card Number Row */}
      <div className="my-auto pt-2">
        <div className="text-[15px] font-medium tracking-[0.22em] text-white/90 font-mono">
          <span>••••</span>
          <span className="ml-3">••••</span>
          <span className="ml-3">••••</span>
          <span className="ml-3 font-semibold">{last4}</span>
        </div>
      </div>

      {/* Bottom Technical Info Row */}
      <div className="flex flex-col text-[9px] font-mono tracking-wider text-[#8E96A4] uppercase">
        <span>{holderName}</span>
        <span className="mt-0.5">EXP {expiry}</span>
      </div>
    </div>
  );
}

export default VirtualCard;
