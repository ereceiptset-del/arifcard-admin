import { UserPlus, ShieldCheck, Wallet, ShoppingBag } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create Account",
    desc: "Sign up in under two minutes with just your name, email, and password.",
  },
  {
    step: "02",
    icon: ShieldCheck,
    title: "Instant Verification",
    desc: "Verify your email with a secure 6-digit code sent straight to your inbox.",
  },
  {
    step: "03",
    icon: Wallet,
    title: "Fund in Birr",
    desc: "Deposit local funds directly from your phone using Telebirr, CBE, or mobile banking.",
  },
  {
    step: "04",
    icon: ShoppingBag,
    title: "Spend in USD",
    desc: "Instantly unlock your virtual USD card and pay for SaaS, ads, and shopping worldwide.",
  },
];

/**
 * HowItWorks
 *
 * 4-step horizontal process walkthrough for Addiscard
 */
export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative w-full py-24 px-6 sm:px-8 lg:px-12 bg-white dark:bg-[#070A12] transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8055FF]/10 text-xs font-semibold text-[#8055FF] dark:text-[#A98FF5] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8055FF] dark:bg-[#A98FF5]" />
            How It Works
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F172A] dark:text-white max-w-2xl leading-tight">
            Get Your Card in{" "}
            <span className="bg-gradient-to-r from-[#8055FF] via-indigo-500 to-[#22D3EE] bg-clip-text text-transparent">
              4 Simple Steps
            </span>
          </h2>

          <p className="mt-4 text-base text-gray-600 dark:text-gray-400 max-w-xl">
            From local signup to global spending in under 5 minutes without tedious branch visits or paper forms.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative bg-[#F8F9FF] dark:bg-[#0E1322] border border-black/5 dark:border-white/10 rounded-2xl p-7 flex flex-col justify-between hover:shadow-lg hover:border-[#8055FF]/30 transition-all duration-300"
              >
                {/* Step badge & icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#8055FF]/10 flex items-center justify-center text-[#8055FF] dark:text-[#A98FF5]">
                    <Icon size={22} />
                  </div>
                  <span className="text-3xl font-mono font-bold text-gray-300 dark:text-gray-700">
                    {item.step}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
