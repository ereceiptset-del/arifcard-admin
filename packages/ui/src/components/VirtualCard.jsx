import { useId } from "react";
import { Lock, CircleCheck, Clock, TriangleAlert, CircleDashed } from "lucide-react";

/**
 * The Arifcard virtual card — the one bold element in the interface.
 *
 * Artwork is an original guilloche (interlaced sine rosettes, the line-work
 * of banknotes) drawn as inline SVG over a violet-to-ink field. No image
 * assets, no third-party marks. ID-1 proportions (1.586:1).
 *
 * It renders only what the issuer reported: last four, expiry, the
 * account holder's name, and a network only if one is passed. Never a full
 * number, never a CVC.
 *
 * States: active, inactive (issued, not activated), pending (being issued),
 * frozen, issue (needs attention), showcase (artwork only, for sign-in
 * screens). "No card" is not a card state — the page shows the card
 * journey in this footprint instead (see CardSlot).
 */

const STATE = {
  active: { icon: CircleCheck, label: "Active", art: "" },
  inactive: { icon: Clock, label: "Not activated yet", art: "" },
  pending: { icon: Clock, label: "Being issued", art: "saturate-[0.45] opacity-80" },
  frozen: { icon: Lock, label: "Frozen", art: "saturate-[0.3]" },
  issue: { icon: TriangleAlert, label: "Needs attention", art: "saturate-[0.25] brightness-90" },
  showcase: { icon: null, label: null, art: "" },
};

export function VirtualCard({
  state = "active",
  last4,
  expiry,
  holder,
  network,
  statusLabel,
  animateIn = false,
  className = "",
}) {
  const view = STATE[state] || { icon: CircleDashed, label: state, art: "" };
  const label = statusLabel || view.label;
  const showNumber = Boolean(last4) && ["active", "inactive", "frozen", "issue"].includes(state);
  const StatusIcon = view.icon;

  const description = [
    "Arifcard virtual card",
    showNumber ? `ending ${last4.split("").join(" ")}` : null,
    expiry ? `expires ${expiry}` : null,
    label ? `status ${label}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      role="img"
      aria-label={description}
      className={`@container relative isolate aspect-[1.586/1] w-full min-w-0 overflow-hidden rounded-panel text-white shadow-e3 select-none ${
        animateIn ? "animate-card-in" : ""
      } ${className}`}
    >
      <CardArt className={`absolute inset-0 -z-10 h-full w-full transition-[filter,opacity] duration-300 ${view.art}`} />

      {state === "frozen" && (
        <div aria-hidden className="absolute inset-0 -z-[5] bg-white/12 backdrop-blur-[1.5px]" />
      )}

      <div aria-hidden className="flex h-full flex-col justify-between p-[6.5%]">
        <div className="flex items-start justify-between gap-3">
          <span className="text-[clamp(15px,4.8cqw,19px)] font-semibold tracking-tight">Arifcard</span>
          {label && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-caption font-medium backdrop-blur-sm">
              {StatusIcon && <StatusIcon size={13} strokeWidth={2.25} />}
              {label}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Chip />
          <Contactless />
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            {showNumber ? (
              <p className="text-[clamp(17px,5.6cqw,22px)] font-medium tabular-nums tracking-[0.06em]">
                <span className="opacity-70">••••</span> {last4}
              </p>
            ) : state === "pending" ? (
              <p className="text-h3 font-medium opacity-90">Your card is being issued</p>
            ) : null}
            {holder && state !== "showcase" && (
              <p className="mt-1 truncate text-small font-medium opacity-85">{holder}</p>
            )}
          </div>
          <div className="shrink-0 text-right">
            {expiry && showNumber && (
              <>
                <p className="text-caption opacity-70">Expires</p>
                <p className="text-small font-medium tabular-nums">{expiry}</p>
              </>
            )}
            {network && <p className="mt-1 text-small font-semibold italic opacity-90">{network}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ artwork ------------------------------ */

const W = 1000;
const H = 630;

/** Closed rosette: r(θ) = base + amp·sin(lobes·θ + phase). */
function rosette(cx, cy, base, amp, lobes, phase, steps = 240) {
  let d = "";
  for (let i = 0; i <= steps; i += 1) {
    const t = (i / steps) * Math.PI * 2;
    const r = base + amp * Math.sin(lobes * t + phase);
    const x = cx + r * Math.cos(t);
    const y = cy + r * Math.sin(t);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d}Z`;
}

/** Horizontal guilloche band across the card. */
function wave(y, amp, freq, phase, steps = 120) {
  let d = "";
  for (let i = 0; i <= steps; i += 1) {
    const x = (i / steps) * W;
    const yy = y + amp * Math.sin((x / W) * Math.PI * 2 * freq + phase) * Math.sin((x / W) * Math.PI);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${yy.toFixed(1)}`;
  }
  return d;
}

// Computed on first use and kept; deterministic, so every render is identical.
// (Not at module load, so importing the package doesn't pay for it.)
let artwork = null;
function artworkPaths() {
  artwork ??= {
    rosettes: Array.from({ length: 16 }, (_, k) => rosette(770, 250, 150 + k * 9, 26, 11, (k * Math.PI) / 8)),
    waves: Array.from({ length: 9 }, (_, k) => wave(470 + k * 12, 34, 3, k * 0.45)),
  };
  return artwork;
}

function CardArt({ className = "" }) {
  const id = useId().replace(/:/g, "");
  const { rosettes, waves } = artworkPaths();
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={className} aria-hidden focusable="false">
      <defs>
        <linearGradient id={`${id}-field`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4a27a8" />
          <stop offset="0.55" stopColor="#2a1873" />
          <stop offset="1" stopColor="#120c2c" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.82" cy="0.32" r="0.55">
          <stop offset="0" stopColor="#8055ff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#8055ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-field)`} />
      <rect width={W} height={H} fill={`url(#${id}-glow)`} />
      <g fill="none" stroke="#d6c7ff" strokeWidth="1.1" opacity="0.22">
        {rosettes.map((d, k) => (
          <path key={k} d={d} />
        ))}
      </g>
      <g fill="none" stroke="#baa1ff" strokeWidth="1" opacity="0.16">
        {waves.map((d, k) => (
          <path key={k} d={d} />
        ))}
      </g>
    </svg>
  );
}

function Chip() {
  const id = `${useId().replace(/:/g, "")}-chip`;
  return (
    <svg width="44" height="34" viewBox="0 0 44 34" aria-hidden focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#efe3c4" />
          <stop offset="1" stopColor="#b9a274" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="43" height="33" rx="7" fill={`url(#${id})`} />
      <g fill="none" stroke="#7d6a43" strokeWidth="1" opacity="0.7">
        <path d="M15 1v32M29 1v32M1 12h14M1 22h14M29 12h14M29 22h14" />
        <rect x="15" y="9" width="14" height="16" rx="3" />
      </g>
    </svg>
  );
}

function Contactless() {
  return (
    <svg width="22" height="26" viewBox="0 0 22 26" aria-hidden focusable="false" className="opacity-80">
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M3 8.5a8 8 0 0 1 0 9" />
        <path d="M8 5a13 13 0 0 1 0 16" />
        <path d="M13 1.5a18 18 0 0 1 0 23" />
      </g>
    </svg>
  );
}
