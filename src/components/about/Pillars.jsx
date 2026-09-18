import { Target, Sparkles, HeartHandshake, Compass } from "lucide-react";

const PILLARS = [
  {
    icon: Target,
    title: "Our mission",
    description: "Give anyone a fast, secure way to spend online in US dollars, no matter where they bank.",
  },
  {
    icon: Sparkles,
    title: "What sets us apart",
    description: "One clear card, transparent pricing, and controls you'll actually use — no hidden markups or confusing tiers.",
  },
  {
    icon: HeartHandshake,
    title: "Our commitment",
    description: "Bank-grade security and responsive support behind every transaction, so you can spend with confidence.",
  },
  {
    icon: Compass,
    title: "Where we're headed",
    description: "More currencies, more card types, more ways to move money — with the same simplicity from day one.",
  },
];

/**
 * Pillars
 *
 * Four-up "who we are" grid for /about — mission, differentiation,
 * commitment, and roadmap direction.
 */
function Pillars() {
  return (
    <section className="relative bg-white dark:bg-[#0B0F1A] px-6 py-20">
      <div className="mx-auto max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PILLARS.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-2xl border border-[#E4E7EC] dark:border-[#232937] bg-[#FAFAFA] dark:bg-[#0F141D] p-6"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8055FF]/10 text-[#8055FF]">
              <Icon size={19} />
            </span>
            <h2 className="mt-4 text-[15px] font-semibold text-[#101217] dark:text-[#F6F7F9]">{title}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#687180] dark:text-[#A6AFBE]">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Pillars;
