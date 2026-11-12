import type { Metadata } from "next";
import { Info } from "lucide-react";
import type { Price, ProjectTypeId } from "@/types";
import { services } from "@/data/services";
import { depositReference, getPrice, servicePrices, startPriceGrid, startQuantityTiers } from "@/data/prices";
import { travelZones } from "@/data/locations";
import type { ConfigOption } from "@/types";
import { materialOptions, techniqueOptions, temporaryBaseOptions } from "@/data/configurator";
import { formatFcfa } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";
import { MediaSlot } from "@/components/ui/media-slot";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { PriceList } from "@/components/shared/price-line";
import { StartProjectButton } from "@/components/shared/start-project-button";
import { CtaBand } from "@/components/shared/cta-band";

export const metadata: Metadata = {
  title: "Nos services — départ de locks, locks temporaires, achat de locks",
  description:
    "Départ de locks durables à Abidjan, pose de locks temporaires avec extensions, achat de locks et extensions : le détail des prestations LP LOCKS et les frais de déplacement.",
};

const cta: Record<ProjectTypeId, string> = {
  depart: "Configurer mon départ de locks",
  temporaire: "Créer mes locks temporaires",
  achat: "Composer ma commande",
};

const choices: Record<ProjectTypeId, string[]> = {
  depart: ["Sans ou avec extensions", "Technique", "Longueur", "Nombre de locks", "Finition"],
  temporaire: ["Matière", "Longueur", "Couleur", "Texture", "Style"],
  achat: ["Matière", "Longueur", "Couleur", "Texture", "Quantité"],
};

const otherIds = ["reprise-crochet", "reprise-twist", "reprise-complete", "coiffure-simple", "shampoing", "coloration"];
const otherPrices = servicePrices.filter((p) => otherIds.includes(p.id));

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Nos services"
        title={
          <>
            Trois façons de porter <em className="text-forest">des locks.</em>
          </>
        }
        lead="Commencer des locks durables, essayer des locks temporaires ou acheter tes mèches : chaque prestation se personnalise selon ton projet."
      >
        <nav aria-label="Prestations" className="flex flex-wrap gap-2">
          {services.map((service) => (
            <Button key={service.id} href={`#${service.id}`} variant="secondary" size="sm">
              {service.shortName}
            </Button>
          ))}
          <Button href="#deplacement" variant="secondary" size="sm">
            Frais de déplacement
          </Button>
        </nav>
      </PageHeader>

      <div className="lp-container flex flex-col gap-20 pb-20 md:gap-32 md:pb-32">
        {services.map((service, index) => {
          const prices = service.priceIds.map(getPrice).filter((p): p is Price => Boolean(p));
          return (
            <section key={service.id} id={service.id} aria-labelledby={`${service.id}-titre`} className="scroll-mt-28">
              <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-16">
                <Reveal
                  className={cn(
                    "relative aspect-[4/3] overflow-hidden rounded-panel lg:sticky lg:top-28 lg:aspect-[4/5]",
                    index % 2 === 1 && "lg:order-2",
                  )}
                >
                  <MediaSlot media={service.image} sizes="(min-width: 1024px) 50vw, 100vw" priority={index === 0} />
                </Reveal>

                <Reveal delay={0.1} className="min-w-0">
                  <p className="type-eyebrow text-sage-ink">0{index + 1}</p>
                  <h2 id={`${service.id}-titre`} className="type-h2 mt-3">
                    {service.name}
                  </h2>
                  <p className="type-lead mt-5 text-charcoal">{service.description}</p>

                  <ul className="mt-6 space-y-3">
                    {service.conditions.map((condition) => (
                      <li key={condition} className="flex items-start gap-3 rounded-2xl bg-mist p-4 text-[0.9375rem] font-medium text-forest">
                        <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
                        {condition}
                      </li>
                    ))}
                  </ul>

                  <h3 className="mt-8 text-sm font-bold">Ce que tu choisis</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {choices[service.id].map((choice) => (
                      <li key={choice} className="rounded-full border border-line px-3.5 py-1.5 text-sm font-semibold">
                        {choice}
                      </li>
                    ))}
                  </ul>

                  {service.id !== "depart" && (
                    <>
                      <h3 className="mt-8 text-sm font-bold">Matières disponibles</h3>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {materialOptions.map((material) => (
                          <li key={material.id}>
                            <Badge>{material.label}</Badge>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  <h3 className="mt-8 mb-3 text-sm font-bold">Tarifs</h3>
                  {service.id !== "achat" && <StartPriceTable name={service.name} labels={service.id === "temporaire" ? temporaryBaseOptions : techniqueOptions} />}
                  <PriceList prices={prices} />
                  {service.id === "temporaire" && (
                    <p className="mt-3 text-sm leading-relaxed text-charcoal">
                      La main-d&apos;œuvre suit la même grille que le départ de locks, selon la base (crochet ou peigne). Les
                      extensions s&apos;ajoutent : prix de la mèche multiplié par le nombre de locks.
                    </p>
                  )}
                  {service.id === "achat" && (
                    <p className="mt-3 text-sm text-charcoal">
                      Locks naturelles de 400 à 1 300 FCFA la mèche selon la longueur — détail dans le{" "}
                      <a href="/catalogue" className="font-semibold text-forest underline underline-offset-4">
                        catalogue
                      </a>
                      .
                    </p>
                  )}
                  {service.duration && (
                    <p className="mt-4 text-sm text-charcoal">
                      <span className="font-bold text-ink">Durée indicative : </span>
                      {service.duration}
                    </p>
                  )}

                  <div className="mt-8">
                    {service.id === "achat" ? (
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button href="/catalogue" size="lg" arrow>
                          Voir le catalogue
                        </Button>
                        <StartProjectButtonSecondary />
                      </div>
                    ) : (
                      <StartProjectButton projectType={service.id}>{cta[service.id]}</StartProjectButton>
                    )}
                  </div>
                </Reveal>
              </div>
            </section>
          );
        })}

        <section aria-labelledby="autres-titre" className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <Reveal>
            <p className="type-eyebrow text-sage-ink">Entretien</p>
            <h2 id="autres-titre" className="type-h2 mt-3">
              Reprises et soins
            </h2>
            <p className="mt-4 text-charcoal">Pour entretenir tes locks entre deux rendez-vous.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <PriceList prices={otherPrices} />
          </Reveal>
        </section>

        <section id="deplacement" aria-labelledby="deplacement-titre" className="scroll-mt-28">
          <Reveal>
            <p className="type-eyebrow text-sage-ink">Abidjan</p>
            <h2 id="deplacement-titre" className="type-h2 mt-3">
              Frais de déplacement
            </h2>
            <p className="mt-4 max-w-2xl text-charcoal">
              Les frais dépendent de ta localité. Ils s&apos;ajoutent à l&apos;estimation de ta prestation.
            </p>
          </Reveal>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {travelZones.map((zone, index) => (
              <li key={zone.id}>
                <Reveal delay={index * 0.05} className="flex h-full flex-col rounded-card bg-mist p-5">
                  <p className="text-sm font-bold text-sage-ink">{zone.name}</p>
                  <p className="type-h3 mt-1">{zone.fee === null ? "Sur devis" : formatFcfa(zone.fee)}</p>
                  {zone.fee !== null && zone.status !== "valide" && (
                    <Badge tone="warning" className="mt-2 self-start">
                      à confirmer
                    </Badge>
                  )}
                  <p className="mt-4 text-sm leading-relaxed text-charcoal">{zone.localities.join(", ")}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        <p className="-mt-8 max-w-3xl text-sm leading-relaxed text-charcoal md:-mt-16">
          Les tarifs marqués « à confirmer » sont indicatifs : le montant de ta prestation est confirmé par LP LOCKS
          avant le rendez-vous. Un acompte peut être demandé à la réservation (référence :{" "}
          {depositReference.amount !== null && formatFcfa(depositReference.amount)}, selon la prestation). Aucun
          paiement n&apos;est effectué sur ce site.
        </p>
      </div>

      <CtaBand />
    </>
  );
}

function StartProjectButtonSecondary() {
  return (
    <Button href="/my-locks-design" variant="secondary" size="lg">
      Passer par MY LOCKS DESIGN
    </Button>
  );
}

/** Grille du départ de locks : technique × nombre de locks. */
function StartPriceTable({ labels, name }: { labels: ConfigOption[]; name: string }) {
  return (
    <div className="mb-4">
      <div role="region" aria-label={`Grille tarifaire — ${name}`} tabIndex={0} className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
        <table className="w-full min-w-[30rem] border-collapse text-left text-[0.9375rem]">
          <caption className="sr-only">{name} : tarifs de la main-d&apos;œuvre selon la technique et le nombre de locks</caption>
          <thead>
            <tr className="border-b border-ink/20 text-sm">
              <th scope="col" className="py-3 pr-4 font-semibold text-charcoal">
                Technique
              </th>
              {startQuantityTiers.map((tier) => (
                <th key={tier.id} scope="col" className="px-2 py-3 text-right font-semibold whitespace-nowrap text-charcoal">
                  {tier.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(startPriceGrid).map(([technique, row]) => (
              <tr key={technique} className="border-b border-line">
                <th scope="row" className="py-3.5 pr-4 font-semibold">
                  {labels.find((t) => t.id === technique)?.label}
                </th>
                {startQuantityTiers.map((tier) => (
                  <td key={tier.id} className="px-2 py-3.5 text-right font-bold whitespace-nowrap">
                    {formatFcfa(row[tier.id])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-charcoal">Au-delà de 120 locks : sur devis.</p>
    </div>
  );
}
