import { Link } from "react-router-dom";
import { CreditCard, Wallet, ArrowLeftRight, RefreshCw, Fingerprint, ScrollText, Globe } from "lucide-react";

const SERVICES = [
  {
    number: "01",
    tag: "Cards",
    icon: CreditCard,
    title: "Buy Virtual Card",
    description: "Get your Addiscard virtual card in minutes and start spending on shopping, gaming, or your favorite subscriptions.",
  },
  {
    number: "02",
    tag: "Wallet",
    icon: Wallet,
    title: "Add Money",
    description: "Deposit birr into your wallet in seconds, with a clean, user-friendly flow built for everyday use.",
  },
  {
    number: "03",
    tag: "Transfer",
    icon: ArrowLeftRight,
    title: "Money Transfer",
    description: "Move money within Addiscard quickly and securely, with full visibility into every transfer.",
  },
  {
    number: "04",
    tag: "Top Up",
    icon: RefreshCw,
    title: "Virtual Card Top-Up",
    description: "Keep your card balance topped up so nothing interrupts your next purchase or subscription renewal.",
  },
  {
    number: "05",
    tag: "Security",
    icon: Fingerprint,
    title: "Biometric Security",
    description: "Sign in with fingerprint or face authentication for an extra layer of protection on every device.",
  },
  {
    number: "06",
    tag: "Logs",
    icon: ScrollText,
    title: "Transaction Logs",
    description: "Review a detailed history of every charge and transfer, so you always know where your money went.",
  },
  {
    number: "07",
    tag: "Global",
    icon: Globe,
    title: "Multi-Currency",
    description: "Hold and spend in multiple currencies, built for shopping and subscriptions from anywhere in the world.",
  },
];

/**
 * ServicesGrid
 *
 * Numbered grid of the seven core Addiscard capabilities, each with a
 * category tag, icon, and short description. Cards lift slightly on hover
 * with an accent border, closing with a conversion banner.
 *
 * Used both mid-page on the landing page and as the top section of
 * /services — `asPageHero` swaps the standard section padding for extra
 * top padding that clears the fixed Navbar when nothing precedes it.
 */
function ServicesGrid({ asPageHero = false }) {
  return (
    <section
      id="services"
      className={`relative bg-[#FAFAFA] dark:bg-[#070B15] px-6 pb-24 scroll-mt-24 ${asPageHero ? "pt-40" : "py-24"}`}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D9DDE4] dark:border-[#303643] px-3 py-1 text-xs font-medium text-[#687180] dark:text-[#A6AFBE]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8055FF]" />
            What We Offer
          </span>
          <h2 className="mt-4 text-[30px] sm:text-[38px] font-semibold leading-tight tracking-tight text-[#101217] dark:text-[#F6F7F9] text-balance">
            Everything you need, built into one card
          </h2>
          <p className="mt-3 text-[15px] text-[#687180] dark:text-[#A6AFBE] leading-relaxed">
            From funding your wallet to spending securely online, every Addiscard service is
            designed around convenience, control, and speed.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map(({ number, tag, icon: Icon, title, description }) => (
            <div
              key={number}
              className="group relative rounded-2xl border border-[#E4E7EC] dark:border-[#232937] bg-white dark:bg-[#0F141D] p-5 transition-all duration-200 hover:-translate-y-[3px] hover:border-[#8055FF]/50 hover:shadow-[0_12px_24px_rgba(16,18,23,0.06)] dark:hover:shadow-[0_12px_24px_rgba(0,0,0,0.3)]"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#8055FF]/10 text-[#8055FF]">
                  <Icon size={17} />
                </span>
                <span className="text-[11px] font-mono tracking-wider text-[#B0B6C0] dark:text-[#4A5262]">
                  {number}
                </span>
              </div>
              <span className="mt-4 block text-[10.5px] font-semibold uppercase tracking-wider text-[#8055FF]">
                {tag}
              </span>
              <h3 className="mt-1 text-[15px] font-semibold text-[#101217] dark:text-[#F6F7F9]">{title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#687180] dark:text-[#A6AFBE]">
                {description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-[#E4E7EC] dark:border-[#232937] bg-white dark:bg-[#0F141D] px-6 py-5">
          <div className="text-center sm:text-left">
            <p className="text-[15px] font-semibold text-[#101217] dark:text-[#F6F7F9]">Ready to get started?</p>
            <p className="mt-0.5 text-[13px] text-[#687180] dark:text-[#A6AFBE]">
              Join the people who trust Addiscard for their digital finances.
            </p>
          </div>
          <Link
            to="/register"
            className="shrink-0 rounded-full bg-[#8055FF] hover:bg-[#7447F8] px-5 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            Get Addiscard
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ServicesGrid;
