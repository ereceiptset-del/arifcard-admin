import MarketingLayout from "../../layouts/MarketingLayout";
import ServicesGrid from "../../components/landing/ServicesGrid";
import WhyChooseUs from "../../components/landing/WhyChooseUs";
import CTABanner from "../../components/landing/CTABanner";

/**
 * ServicesPage
 *
 * Route: /services — a standalone destination for the same numbered
 * service grid featured on the landing page (its own heading serves as
 * this page's hero — see ServicesGrid's `asPageHero` prop), plus the
 * security section, so a visitor who lands here directly (a shared link,
 * search, the footer) gets the full picture without needing the homepage
 * first.
 */
function ServicesPage() {
  return (
    <MarketingLayout>
      <ServicesGrid asPageHero />
      <WhyChooseUs />
      <CTABanner />
    </MarketingLayout>
  );
}

export default ServicesPage;
