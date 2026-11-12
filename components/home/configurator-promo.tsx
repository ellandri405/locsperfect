"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { colorOptions, lengthOptions, thicknessOptions } from "@/data/configurator";
import { Button } from "@/components/ui/button";
import { ChipSelector, SwatchSelector } from "@/components/ui/selectors";
import { Reveal } from "@/components/ui/reveal";

/**
 * Mise en avant de MY LOCKS DESIGN, avec un avant-goût interactif des
 * sélecteurs (les choix faits ici sont une démonstration, non sauvegardée).
 */
export function ConfiguratorPromo() {
  const [length, setLength] = useState("14");
  const [color, setColor] = useState("noir-naturel");
  const [thickness, setThickness] = useState("moyenne");

  const lengthOption = lengthOptions.find((o) => o.id === length);
  const colorOption = colorOptions.find((o) => o.id === color);
  const thicknessOption = thicknessOptions.find((o) => o.id === thickness);
  const summary = [
    lengthOption && `${lengthOption.description} · ${lengthOption.detail}`,
    colorOption?.label,
    thicknessOption && `Épaisseur ${thicknessOption.label.toLowerCase()}`,
  ].filter(Boolean) as string[];

  return (
    <section className="px-3 sm:px-4">
      <div className="on-dark relative mx-auto max-w-[100rem] overflow-hidden rounded-panel bg-forest text-white">
        <div aria-hidden className="lp-strands absolute inset-0 opacity-60" />
        <div className="lp-container relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1fr_1.05fr] lg:gap-20 lg:py-32">
          <Reveal>
            <p className="type-eyebrow text-soft">MY LOCKS DESIGN</p>
            <h2 className="type-h1 mt-5">
              Et si tu créais <em className="text-soft">tes propres locks ?</em>
            </h2>
            <p className="type-lead mt-6 max-w-md text-white/80">
              Longueur, couleur, texture, épaisseur… imagine un style qui te ressemble avec MY LOCKS DESIGN.
            </p>
            <div className="mt-9">
              <Button href="/my-locks-design" variant="light" size="lg" arrow>
                Personnaliser mes locks
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="rounded-card bg-white p-5 text-ink shadow-float sm:p-8">
              <div className="flex flex-col gap-7">
                <ChipSelector
                  name="promo-longueur"
                  legend="Longueur"
                  options={lengthOptions}
                  value={length}
                  onChange={setLength}
                />
                <SwatchSelector
                  name="promo-couleur"
                  legend="Couleur"
                  options={colorOptions}
                  value={color}
                  onChange={setColor}
                />
                <ChipSelector
                  name="promo-epaisseur"
                  legend="Épaisseur"
                  options={thicknessOptions}
                  value={thickness}
                  onChange={setThickness}
                />
              </div>

              <div className="mt-7 rounded-2xl bg-mist p-4" aria-live="polite">
                <p className="type-eyebrow text-sage-ink">Ton style, en un coup d&apos;œil</p>
                <div className="mt-2 flex min-h-7 flex-wrap items-center gap-x-2 gap-y-1 text-[0.9375rem] font-bold">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {summary.map((part) => (
                      <motion.span
                        key={part}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-full bg-white px-3 py-1"
                      >
                        {part}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
