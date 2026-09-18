import { ShieldCheck, Lock, EyeOff, Sliders, CheckCircle2 } from "lucide-react";

const PILLARS = [
  {
    icon: Lock,
    title: "Bank-Grade Encryption",
    desc: "Your card credentials, personal data, and payment keys are encrypted using AES-256 and salted hashes.",
  },
  {
    icon: Sliders,
    title: "Instant Freeze & Controls",
    desc: "Lock or unlock your card immediately with a single tap if you notice unfamiliar activity.",
  },
  {
    icon: EyeOff,
    title: "Dynamic CVV & Privacy",
    desc: "Keep your real banking details private from merchant databases and online trackers.",
  },
  {
    icon: ShieldCheck,
    title: "Fraud & Anomaly Guard",
    desc: "24/7 automated transaction monitoring that flags suspicious charges before they complete.",
  },
];

/**
 * Security
 *
 * Security and trust highlights for Addiscard
 */
export default function Security() {
  return (
    <section id="security" className="relative w-full py-24 px-6 sm:px-8 lg:px-12 bg-[#F8F9FF] dark:bg-[#080C18] transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Heading & Key Points */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-4">
              <ShieldCheck size={14} />
              Enterprise Security
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F172A] dark:text-white leading-tight">
              Quiet Confidence in{" "}
              <span className="bg-gradient-to-r from-emerald-500 via-[#8055FF] to-blue-500 bg-clip-text text-transparent">
                Every Transaction
              </span>
            </h2>

            <p className="mt-5 text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg">
              Addiscard is built on zero-trust financial architecture. Your funds are segregated, your cards are isolated, and you retain total control over spending limits.
            </p>

            <ul className="mt-8 space-y-3.5">
              {[
                "Instant push and email notifications on all authorizations",
                "Per-card custom daily spending limits",
                "Regulated local settlement partners in Ethiopia",
                "Full compliance with international anti-fraud standards",
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: 4 Security Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white dark:bg-[#0F1428] border border-black/5 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#8055FF]/10 flex items-center justify-center text-[#8055FF] dark:text-[#A98FF5] mb-4">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-bold text-[#0F172A] dark:text-white mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
