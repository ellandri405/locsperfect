import type { Metadata } from "next";
import { beforeAfterPairs } from "@/data/before-after";
import { galleryItems } from "@/data/gallery";
import { BeforeAfter } from "@/components/before-after/before-after";
import { Badge } from "@/components/ui/badge";
import { Gallery } from "@/components/gallery/gallery";
import { PageHeader } from "@/components/shared/page-header";
import { CtaBand } from "@/components/shared/cta-band";

export const metadata: Metadata = {
  title: "Galerie — styles de locks pour homme et femme",
  description:
    "Locks naturelles, temporaires, courtes, longues, colorées, fines ou épaisses : explore les styles pour imaginer ton projet avec LP LOCKS.",
};

export default function GaleriePage() {
  return (
    <>
      <PageHeader
        eyebrow="Galerie"
        title={
          <>
            Des styles pour <em className="text-forest">se projeter.</em>
          </>
        }
        lead="Chaque visuel indique son origine : réalisation LP LOCKS, inspiration ou image générée par IA. Les photographies arrivent bientôt."
      />
      <Gallery items={galleryItems} />

      {beforeAfterPairs.length > 0 && (
        <section aria-labelledby="avant-apres-titre" className="bg-mist">
          <div className="lp-container grid items-center gap-10 py-20 md:py-28 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="type-eyebrow text-sage-ink">Avant / Après</p>
              <h2 id="avant-apres-titre" className="type-h2 mt-4">
                La transformation, <em className="text-forest">sous tes yeux.</em>
              </h2>
              <p className="type-lead mt-5 max-w-md text-charcoal">
                Fais glisser le curseur pour comparer. Au clavier, utilise les flèches gauche et droite.
              </p>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-charcoal">
                Seules de vraies transformations réalisées par LP LOCKS seront présentées ici.
              </p>
            </div>
            <ul className="grid gap-6">
              {beforeAfterPairs.map((pair) => (
                <li key={pair.id} className="mx-auto w-full max-w-md">
                  <BeforeAfter before={pair.before} after={pair.after} label={pair.title} />
                  <p className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold">
                    {pair.title}
                    {pair.placeholder && <Badge tone="outline">Exemple de présentation · photos à venir</Badge>}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <CtaBand title="Un style t'inspire ? Compose le tien." />
    </>
  );
}
