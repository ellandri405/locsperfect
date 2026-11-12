import type { MediaRef } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MediaSlot } from "@/components/ui/media-slot";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";
import { hasVisual } from "@/lib/media";

/* ------------------------------ Galerie (aperçu) ------------------------------ */

// Emplacements uniquement : aucune réalisation n'est inventée.
const galleryTiles: Array<{ media: MediaRef; className: string }> = [
  { media: { alt: "Locks longues", slot: "gallery/01", tone: "sage" }, className: "aspect-[4/5] md:row-span-2 md:aspect-auto" },
  { media: { alt: "Locks courtes", slot: "gallery/02", tone: "mist" }, className: "aspect-[4/3]" },
  { media: { alt: "Locks colorées", slot: "gallery/03", tone: "charcoal" }, className: "aspect-[4/3]" },
  { media: { alt: "Coiffure attachée", slot: "gallery/04", tone: "soft" }, className: "aspect-[4/3] md:col-span-2 md:aspect-[8/3]" },
];

export function GalleryTeaser() {
  return (
    <section className="lp-container py-20 md:py-32">
      <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <p className="type-eyebrow text-sage-ink">Galerie</p>
          <h2 className="type-h2 mt-4">Des styles pour se projeter.</h2>
          <p className="mt-4 text-charcoal">
            Réalisations LP LOCKS et inspirations seront toujours clairement distinguées.
          </p>
        </div>
        <Button href="/galerie" variant="secondary" arrow>
          Voir la galerie
        </Button>
      </Reveal>

      <div className="mt-10 grid gap-3 sm:gap-4 md:grid-cols-3 md:grid-rows-2">
        {galleryTiles.map((tile, index) => (
          <Reveal key={tile.media.slot} delay={index * 0.08} className={cn("relative overflow-hidden rounded-card", tile.className)}>
            <MediaSlot media={tile.media} sizes="(min-width: 768px) 33vw, 100vw" />
            {!hasVisual(tile.media) && (
              <Badge tone="outline" className="absolute top-4 left-4 border-transparent bg-white/90 backdrop-blur">
                Photo à venir
              </Badge>
            )}
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ Réassurance ------------------------------ */

const reassurance = [
  {
    title: "Trois prestations, un seul univers",
    text: "Départ de locks durables, pose de locks temporaires, achat de locks et extensions.",
  },
  {
    title: "Des matières au choix",
    text: "Synthétiques, semi-naturelles, naturelles ou cheveux humains, selon ton projet.",
  },
  {
    title: "Une personnalisation à la carte",
    text: "Longueur, couleur, texture, épaisseur, style : tu composes ton projet étape par étape.",
  },
  {
    title: "Un devis clair",
    text: "Tu obtiens une estimation indicative, puis LP LOCKS te confirme le devis sur WhatsApp.",
  },
  {
    title: "Une réservation confirmée par LP LOCKS",
    text: "Ta demande n'est pas une réservation automatique : le rendez-vous est confirmé directement avec toi.",
  },
];

export function Reassurance() {
  return (
    <section className="bg-mist">
      <div className="lp-container grid gap-10 py-20 md:py-32 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-32 lg:self-start">
          <p className="type-eyebrow text-sage-ink">Comment ça se passe</p>
          <h2 className="type-h2 mt-4">
            De l&apos;idée au rendez-vous, <em className="text-forest">en toute clarté.</em>
          </h2>
        </Reveal>
        <ol className="border-t border-forest/15">
          {reassurance.map((item, index) => (
            <li key={item.title} className="border-b border-forest/15">
              <Reveal delay={index * 0.05} className="grid grid-cols-[3rem_1fr] gap-x-4 py-6 sm:grid-cols-[4.5rem_1fr] sm:py-8">
                <span aria-hidden className="type-h3 text-sage-ink">
                  0{index + 1}
                </span>
                <div>
                  <h3 className="type-h3">{item.title}</h3>
                  <p className="mt-2 max-w-lg leading-relaxed text-charcoal">{item.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------ Appel à l'action final ------------------------------ */

export function FinalCta() {
  return (
    <section className="lp-container py-24 text-center md:py-40">
      <Reveal>
        <p className="type-eyebrow text-sage-ink">MY LOCKS DESIGN</p>
        <h2 className="type-display mx-auto mt-5 max-w-4xl">
          Ton prochain style <em className="text-forest">commence ici.</em>
        </h2>
        <div className="mt-10 flex justify-center">
          <Button href="/my-locks-design" size="lg" arrow>
            Créer mon projet
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
