import { site } from "@/data/site";
import { Hero } from "@/components/home/hero";
import { Offers } from "@/components/home/offers";
import { ConfiguratorPromo } from "@/components/home/configurator-promo";
import { FinalCta, GalleryTeaser, Reassurance } from "@/components/home/closing-sections";

// Données structurées : présentent LP LOCKS aux moteurs de recherche.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HairSalon",
  name: site.name,
  description: site.description,
  url: site.url,
  logo: `${site.url}${site.logo.onLight}`,
  telephone: `+${site.contact.whatsappNumber}`,
  areaServed: { "@type": "City", name: site.city },
  address: { "@type": "PostalAddress", addressLocality: site.city, addressCountry: "CI" },
  sameAs: [site.contact.instagramUrl],
  currenciesAccepted: "XOF",
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Hero />
      <Offers />
      <ConfiguratorPromo />
      <GalleryTeaser />
      <Reassurance />
      <FinalCta />
    </>
  );
}
