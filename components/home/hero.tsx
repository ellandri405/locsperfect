import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";
import type { MediaRef } from "@/types";
import { colorOptions } from "@/data/configurator";
import { Button } from "@/components/ui/button";
import { MediaSlot } from "@/components/ui/media-slot";

const heroImage: MediaRef = {
  alt: "Portrait éditorial d'un modèle portant des locks",
  slot: "hero/hero-principal",
  tone: "forest",
};

const facts = [
  { value: "3", label: "offres dédiées aux locks" },
  { value: "6 à 30″", label: "de longueur, au choix" },
  { value: "4", label: "matières disponibles" },
];

/**
 * Entrées en CSS pur (voir globals.css) : le hero s'affiche sans attendre le JavaScript.
 * Le titre principal ne joue que sur la position, jamais sur l'opacité.
 */
const rise = "animate-[lp-rise_0.9s_var(--ease-soft)_both]";
const delay = (seconds: number): CSSProperties => ({ animationDelay: `${seconds}s` });

export function Hero() {
  return (
    <section className="px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="relative mx-auto grid max-w-[100rem] overflow-hidden rounded-panel bg-mist lg:min-h-[calc(100svh-6.5rem)] lg:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-col justify-center px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          <p className={`${rise} type-eyebrow text-forest`}>Spécialiste des locks · Abidjan</p>
          <h1 className="type-display mt-5 animate-[lp-slide_0.9s_var(--ease-soft)_both] text-ink">
            Les locks, ton style. <em className="text-forest">Ton identité.</em>
          </h1>
          <p style={delay(0.18)} className={`${rise} type-lead mt-6 max-w-md text-charcoal`}>
            Imagine ton style, personnalise ton projet et donne vie à tes envies avec LP LOCKS.
          </p>
          <div style={delay(0.28)} className={`${rise} mt-9 flex flex-col gap-3 sm:flex-row`}>
            <Button href="/my-locks-design" size="lg" arrow>
              Créer mon projet
            </Button>
            <Button href="/services" size="lg" variant="secondary">
              Découvrir nos services
            </Button>
          </div>

          <dl style={delay(0.4)} className={`${rise} mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-forest/15 pt-6 lg:mt-16`}>
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="sr-only">{fact.label}</dt>
                <dd>
                  <span className="type-h3 block text-forest">{fact.value}</span>
                  <span className="mt-1 block text-xs leading-snug text-charcoal sm:text-sm">{fact.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative m-3 mt-0 min-h-[26rem] overflow-hidden rounded-[1.75rem] sm:min-h-[32rem] lg:m-3 lg:ml-0">
          <div className="absolute inset-0 animate-[lp-zoom_1.4s_var(--ease-soft)_both]">
            <MediaSlot media={heroImage} priority sizes="(min-width: 1024px) 50vw, 100vw" />
          </div>

          {/* Aperçu flottant du configurateur */}
          <div style={delay(0.7)} className={`${rise} absolute right-4 bottom-12 left-4 sm:right-auto sm:bottom-6 sm:left-6 sm:w-80`}>
            <Link
              href="/my-locks-design"
              className="group flex items-center gap-4 rounded-3xl bg-white/95 p-4 shadow-float backdrop-blur transition-transform duration-300 ease-soft hover:-translate-y-1"
            >
              <span className="min-w-0 flex-1">
                <span className="type-eyebrow block text-sage-ink">MY LOCKS DESIGN</span>
                <span className="mt-1 block text-[0.9375rem] font-bold text-ink">Compose ton style</span>
                <span aria-hidden className="mt-3 flex gap-1.5">
                  {colorOptions.map((color) => (
                    <span
                      key={color.id}
                      className="size-5 rounded-full border border-white shadow-[0_0_0_1px_var(--lp-silver)]"
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </span>
              </span>
              <span
                aria-hidden
                className="grid size-11 shrink-0 place-items-center rounded-full bg-forest text-white transition-transform duration-300 ease-soft group-hover:rotate-45"
              >
                <ArrowUpRight className="size-5" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
