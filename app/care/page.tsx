import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { careArticles } from "@/data/care";
import { MediaSlot } from "@/components/ui/media-slot";
import { Reveal } from "@/components/ui/reveal";
import { PageHeader } from "@/components/shared/page-header";
import { CtaBand } from "@/components/shared/cta-band";

export const metadata: Metadata = {
  title: "LP LOCKS CARE — conseils d'entretien des locks",
  description:
    "Entretien des locks, fréquence des reprises, gestes à éviter, locks temporaires, extensions et préparation du rendez-vous : les conseils LP LOCKS.",
};

export default function CarePage() {
  return (
    <>
      <PageHeader
        eyebrow="LP LOCKS CARE"
        title={
          <>
            Prendre soin de <em className="text-forest">tes locks.</em>
          </>
        }
        lead="Des repères simples pour entretenir tes locks, préserver tes extensions et préparer ton rendez-vous."
      />
      <ul className="lp-container grid gap-5 pb-20 sm:grid-cols-2 md:pb-32 lg:grid-cols-3">
        {careArticles.map((article, index) => (
          <li key={article.slug}>
            <Reveal delay={(index % 3) * 0.08} className="h-full">
              <Link href={`/care/${article.slug}`} className="group flex h-full flex-col overflow-hidden rounded-card bg-mist transition-colors duration-500 hover:bg-soft/60">
                <div className="relative m-2 aspect-[3/2] overflow-hidden rounded-[1.375rem]">
                  <div className="absolute inset-0 transition-transform duration-[900ms] ease-soft group-hover:scale-[1.05]">
                    <MediaSlot media={article.image} hideLabel sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5 pt-3 sm:p-6 sm:pt-3">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="type-h3">{article.title}</h2>
                    <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-forest transition-[transform,background-color,color] duration-300 ease-soft group-hover:rotate-45 group-hover:bg-forest group-hover:text-white">
                      <ArrowUpRight className="size-5" />
                    </span>
                  </div>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-charcoal">{article.summary}</p>
                </div>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
      <CtaBand />
    </>
  );
}
