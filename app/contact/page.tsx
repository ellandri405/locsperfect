import type { Metadata } from "next";
import { site } from "@/data/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { BookingForm } from "@/components/forms/booking-form";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/layout/whatsapp-icon";

export const metadata: Metadata = {
  title: "Contact et réservation",
  description: `Contacte LP LOCKS à Abidjan : demande de rendez-vous, devis et informations sur WhatsApp au ${site.contact.whatsappDisplay}.`,
};

export default function ContactPage() {
  const rows = [
    { label: "WhatsApp", value: site.contact.whatsappDisplay, href: whatsappUrl() },
    { label: "Instagram", value: `@${site.contact.instagramHandle}`, href: site.contact.instagramUrl },
    { label: "Wave (paiement)", value: site.contact.waveDisplay },
    { label: "Zone", value: `${site.city}, ${site.country}` },
  ];
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title={
          <>
            Parlons de <em className="text-forest">ton projet.</em>
          </>
        }
        lead="Remplis ta demande : elle s'ouvre dans WhatsApp, prête à être envoyée. LP LOCKS te répond pour confirmer la disponibilité."
      />
      <div className="lp-container grid gap-12 pb-20 md:pb-32 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
        <section aria-labelledby="demande-titre">
          <h2 id="demande-titre" className="type-h3 mb-6">
            Demande de rendez-vous
          </h2>
          <BookingForm />
        </section>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-card bg-mist p-6 sm:p-8">
            <h2 className="type-h3">Coordonnées</h2>
            <dl className="mt-5 divide-y divide-forest/15">
              {rows.map((row) => (
                <div key={row.label} className="py-3.5">
                  <dt className="text-sm text-charcoal">{row.label}</dt>
                  <dd className="mt-0.5 font-bold">
                    {row.href ? (
                      <a href={row.href} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                        {row.value}
                      </a>
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <Button href={whatsappUrl()} external variant="whatsapp" className="mt-6 w-full" icon={<WhatsAppIcon className="size-4.5" />}>
              Écrire sur WhatsApp
            </Button>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-charcoal">
            Aucun paiement n&apos;est effectué sur ce site. Si un acompte est demandé, LP LOCKS t&apos;indique le
            montant et la marche à suivre directement.
          </p>
        </aside>
      </div>
    </>
  );
}
