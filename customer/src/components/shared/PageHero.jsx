/**
 * PageHero
 *
 * Simple centered hero for secondary marketing pages (Services,
 * Announcements, Contact) — an eyebrow tag, heading, and optional
 * description, on the standard light/dark section background. Extra
 * top padding clears the fixed floating Navbar.
 */
function PageHero({ eyebrow, heading, description, children }) {
  return (
    <section className="relative bg-[#FAFAFA] dark:bg-[#070B15] px-6 pt-40 pb-16 scroll-mt-24">
      <div className="mx-auto max-w-2xl text-center">
        {eyebrow && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D9DDE4] dark:border-[#303643] px-3 py-1 text-xs font-medium text-[#687180] dark:text-[#A6AFBE]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8055FF]" />
            {eyebrow}
          </span>
        )}
        <h1 className="mt-4 text-[34px] sm:text-[44px] font-semibold leading-tight tracking-tight text-[#101217] dark:text-[#F6F7F9] text-balance">
          {heading}
        </h1>
        {description && (
          <p className="mt-4 text-[15px] sm:text-base text-[#687180] dark:text-[#A6AFBE] leading-relaxed">
            {description}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

export default PageHero;
