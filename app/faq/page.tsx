import type { Metadata } from "next";
import Link from "next/link";
import { faqEntries } from "@/data/faq";
import { Accordion } from "@/components/ui/accordion";
import { PageHeader } from "@/components/shared/page-header";
import { CtaBand } from "@/components/shared/cta-band";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description:
    "Locks durables ou temporaires, extensions, matières, longueurs, durée de pose, frais de déplacement à Abidjan, réservation et devis : les réponses de LP LOCKS.",
};

// Données structurées : aident les moteurs de recherche à comprendre la FAQ.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqEntries.map((entry) => ({
    "@type": "Question",
    name: entry.question,
    acceptedAnswer: { "@type": "Answer", text: entry.answer },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHeader
        eyebrow="FAQ"
        title={
          <>
            Tes questions, <em className="text-forest">nos réponses.</em>
          </>
        }
        lead="L'essentiel à savoir avant de te lancer."
      />
      <div className="lp-container max-w-4xl pb-20 md:pb-32">
        <Accordion
          headingLevel={2}
          defaultOpenId={faqEntries[0]?.id}
          items={faqEntries.map((entry) => ({
            id: entry.id,
            title: entry.question,
            content: (
              <>
                <p>{entry.answer}</p>
                {entry.link && (
                  <p className="mt-3">
                    <Link href={entry.link.href} className="inline-flex min-h-9 items-center font-bold text-forest underline underline-offset-4">
                      {entry.link.label}
                    </Link>
                  </p>
                )}
              </>
            ),
          }))}
        />
      </div>
      <CtaBand title="Une autre question ? Écris-nous." />
    </>
  );
}
