import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/data/services";
import { MediaSlot } from "@/components/ui/media-slot";
import { Reveal } from "@/components/ui/reveal";

/** Présentation de la marque + les trois offres. */
export function Offers() {
  return (
    <section className="lp-container py-20 md:py-32">
      <Reveal className="grid gap-6 md:grid-cols-[1fr_1.1fr] md:gap-16">
        <div>
          <p className="type-eyebrow text-sage-ink">La marque</p>
          <h2 className="type-h2 mt-4">
            Tout ce que nous faisons, <em className="text-forest">ce sont des locks.</em>
          </h2>
        </div>
        <p className="type-lead self-end text-charcoal md:pb-2">
          LP LOCKS est une marque spécialisée exclusivement dans l&apos;univers des locks. Trois offres, une
          seule expertise : commencer tes locks durables, porter des locks temporaires ou acheter tes locks et
          extensions.
        </p>
      </Reveal>

      <ul className="mt-12 grid gap-5 md:mt-16 md:grid-cols-3">
        {services.map((service, index) => (
          <li key={service.id}>
            <Reveal delay={index * 0.1} className="h-full">
              <Link
                href={service.href}
                className="group flex h-full flex-col overflow-hidden rounded-card bg-mist transition-colors duration-500 ease-soft hover:bg-soft/60"
              >
                <div className="relative m-2 aspect-[4/5] overflow-hidden rounded-[1.375rem]">
                  <div className="absolute inset-0 transition-transform duration-[900ms] ease-soft group-hover:scale-[1.05]">
                    <MediaSlot media={service.image} sizes="(min-width: 768px) 33vw, 100vw" />
                  </div>
                  <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-forest backdrop-blur">
                    0{index + 1}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5 pt-4 sm:p-6 sm:pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="type-h3">{service.shortName}</h3>
                    <span
                      aria-hidden
                      className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-forest transition-[transform,background-color,color] duration-300 ease-soft group-hover:rotate-45 group-hover:bg-forest group-hover:text-white"
                    >
                      <ArrowUpRight className="size-5" />
                    </span>
                  </div>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-charcoal">{service.description}</p>
                  <span className="mt-auto pt-5 text-sm font-bold text-forest underline-offset-4 group-hover:underline">
                    Découvrir la prestation
                  </span>
                </div>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
