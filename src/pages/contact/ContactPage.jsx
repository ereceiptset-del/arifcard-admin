import { Mail, Clock } from "lucide-react";
import MarketingLayout from "../../layouts/MarketingLayout";
import PageHero from "../../components/shared/PageHero";

// Matches SUPPORT_EMAIL in backend/.env.example — the same address the
// verification and password-reset emails point people to.
const SUPPORT_EMAIL = "support@addiscard.com";

/**
 * ContactPage
 *
 * Route: /contact — support contact info. Intentionally a real mailto
 * link rather than a contact form: there's no backend endpoint to receive
 * form submissions yet, and a form that quietly goes nowhere would be
 * worse than no form at all.
 */
function ContactPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Contact"
        heading="We're here to help"
        description="Have a question about your account, a transaction, or anything else? Reach out and we'll get back to you."
      />
      <section className="bg-[#FAFAFA] dark:bg-[#070B15] px-6 pb-24">
        <div className="mx-auto max-w-md rounded-2xl border border-[#E4E7EC] dark:border-[#232937] bg-white dark:bg-[#0F141D] p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#8055FF]/10 text-[#8055FF]">
            <Mail size={20} />
          </span>
          <h2 className="mt-4 text-[16px] font-semibold text-[#101217] dark:text-[#F6F7F9]">Email support</h2>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-1.5 inline-block text-[15px] font-medium text-[#8055FF] hover:text-[#7447F8] transition-colors"
          >
            {SUPPORT_EMAIL}
          </a>

          <div className="mt-6 flex items-center justify-center gap-2 text-[12.5px] text-[#687180] dark:text-[#A6AFBE]">
            <Clock size={14} />
            We typically reply within 24 hours
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

export default ContactPage;
