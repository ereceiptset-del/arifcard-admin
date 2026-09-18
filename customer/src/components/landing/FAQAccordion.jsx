import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const DEFAULT_FAQS = [
  {
    question: "What is a virtual USD card?",
    answer:
      "It's a Visa or Mastercard-branded card that exists only digitally — no physical plastic. You get a full card number, expiry date, and CVV, and can use it anywhere online payments are accepted.",
  },
  {
    question: "How do I fund my Addiscard wallet?",
    answer:
      "Add money from your local bank account or supported payment method in birr. Once it lands in your wallet, you can top up any of your virtual cards instantly.",
  },
  {
    question: "Can I use my card on any website?",
    answer:
      "Yes — your Addiscard virtual card works anywhere that accepts Visa or Mastercard online, including subscriptions, advertising platforms, and international shopping sites.",
  },
  {
    question: "Is there a limit on how much I can spend?",
    answer:
      "Each card has a balance equal to whatever you've topped it up with — there's no separate spending limit beyond that. You control exactly how much is loaded at any time.",
  },
  {
    question: "What happens if my card details are compromised?",
    answer:
      "Freeze the card instantly from the app, no phone call needed. You can then issue a fresh virtual card in minutes without affecting the rest of your wallet.",
  },
  {
    question: "Which currencies can I top up with?",
    answer:
      "You fund your wallet in Ethiopian birr and spend from your card in US dollars — Addiscard handles the conversion so you don't have to.",
  },
];

function FAQItem({ idPrefix, id, question, answer, isOpen, onToggle }) {
  const buttonId = `${idPrefix}-button-${id}`;
  const panelId = `${idPrefix}-panel-${id}`;

  return (
    <div className="border-b border-[#E4E7EC] dark:border-[#232937]">
      <h3 className="m-0">
        <button
          type="button"
          id={buttonId}
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8055FF]/30 rounded"
        >
          <span className="text-[15px] font-medium text-[#101217] dark:text-[#F6F7F9]">{question}</span>
          <ChevronDown
            size={18}
            aria-hidden
            className={`shrink-0 text-[#687180] dark:text-[#A6AFBE] transition-transform duration-[250ms] ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="grid transition-[grid-template-rows] duration-[250ms] ease-in-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="pb-5 text-[13.5px] leading-relaxed text-[#687180] dark:text-[#A6AFBE]">{answer}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * FAQAccordion
 *
 * Accessible accordion (button + aria-expanded/aria-controls, region role
 * on each panel) with a smooth 250ms height transition via CSS Grid's
 * `grid-template-rows` 0fr↔1fr trick — no JS height measurement needed,
 * and it degrades to an instant snap under prefers-reduced-motion via the
 * global transition-duration override in styles/index.css.
 *
 * Reused on both the landing page (general questions) and the About page
 * (security-focused questions with a support CTA) — content, heading, and
 * the optional closing CTA are all props so each page supplies its own.
 * `idPrefix` keeps ids unique if a page ever needs two instances.
 */
function FAQAccordion({
  idPrefix = "faq",
  eyebrow = "FAQ",
  heading = "Common questions",
  description,
  faqs = DEFAULT_FAQS,
  footerCta,
}) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="relative bg-white dark:bg-[#0B0F1A] px-6 py-24">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D9DDE4] dark:border-[#303643] px-3 py-1 text-xs font-medium text-[#687180] dark:text-[#A6AFBE]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8055FF]" />
            {eyebrow}
          </span>
          <h2 className="mt-4 text-[30px] sm:text-[38px] font-semibold leading-tight tracking-tight text-[#101217] dark:text-[#F6F7F9] text-balance">
            {heading}
          </h2>
          {description && (
            <p className="mt-3 text-[15px] text-[#687180] dark:text-[#A6AFBE] leading-relaxed">{description}</p>
          )}
        </div>

        <div className="mt-10">
          {faqs.map((faq, index) => (
            <FAQItem
              key={faq.question}
              idPrefix={idPrefix}
              id={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex((current) => (current === index ? -1 : index))}
            />
          ))}
        </div>

        {footerCta && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-[#E4E7EC] dark:border-[#232937] bg-[#FAFAFA] dark:bg-[#0F141D] px-6 py-5">
            <div className="text-center sm:text-left">
              <p className="text-[15px] font-semibold text-[#101217] dark:text-[#F6F7F9]">{footerCta.title}</p>
              <p className="mt-0.5 text-[13px] text-[#687180] dark:text-[#A6AFBE]">{footerCta.description}</p>
            </div>
            <Link
              to={footerCta.to}
              className="shrink-0 rounded-full bg-[#8055FF] hover:bg-[#7447F8] px-5 py-2.5 text-sm font-semibold text-white transition-colors"
            >
              {footerCta.linkLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default FAQAccordion;
