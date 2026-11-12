"use client";

import { useState, type ReactNode } from "react";
import type { MediaTone } from "@/types";
import {
  colorOptions,
  configuratorSteps,
  lengthOptions,
  materialOptions,
  textureOptions,
  thicknessOptions,
} from "@/data/configurator";
import { BeforeAfter } from "@/components/before-after/before-after";
import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/field";
import { MediaSlot } from "@/components/ui/media-slot";
import { Modal } from "@/components/ui/modal";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { ChipSelector, OptionCard, QuantityStepper, SelectorGroup, SwatchSelector } from "@/components/ui/selectors";
import { useToast } from "@/components/ui/toast";

const palette = [
  { name: "Noir profond", token: "ink", hex: "#111111", className: "bg-ink" },
  { name: "Gris charbon", token: "charcoal", hex: "#414844", className: "bg-charcoal" },
  { name: "Gris argent", token: "silver", hex: "#AEB4B1", className: "bg-silver" },
  { name: "Vert forêt", token: "forest", hex: "#174734", className: "bg-forest" },
  { name: "Vert sauge", token: "sage", hex: "#78947E", className: "bg-sage" },
  { name: "Vert doux", token: "soft", hex: "#B5C7B5", className: "bg-soft" },
  { name: "Vert très clair", token: "mist", hex: "#E9F0E9", className: "bg-mist" },
  { name: "Blanc", token: "white", hex: "#FFFFFF", className: "bg-white" },
];

const tones: MediaTone[] = ["forest", "sage", "soft", "mist", "charcoal", "silver"];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-12 md:py-16">
      <h2 className="type-eyebrow mb-8 text-sage-ink">{title}</h2>
      {children}
    </section>
  );
}

export function Showcase() {
  const { notify } = useToast();
  const [length, setLength] = useState<string | null>("12");
  const [color, setColor] = useState<string | null>("caramel");
  const [texture, setTexture] = useState<string | null>(null);
  const [thickness, setThickness] = useState<string | null>("moyenne");
  const [material, setMaterial] = useState<string | null>("naturelle");
  const [quantity, setQuantity] = useState(50);
  const [step, setStep] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="lp-container pb-24">
      <header className="py-14 md:py-20">
        <Badge>Document de travail</Badge>
        <h1 className="type-display mt-6">Design system</h1>
        <p className="type-lead mt-5 max-w-xl text-charcoal">
          Les fondations visuelles de LP LOCKS : couleurs, typographies et composants interactifs. Chaque élément
          est fonctionnel — essaie-les.
        </p>
      </header>

      <Section title="Palette">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {palette.map((c) => (
            <li key={c.token}>
              <div className={`h-24 rounded-2xl border border-line ${c.className}`} />
              <p className="mt-3 text-sm font-bold">{c.name}</p>
              <p className="text-xs text-charcoal">
                {c.hex} · <code>{c.token}</code>
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Typographie">
        <div className="space-y-8">
          <div>
            <p className="mb-2 text-xs text-charcoal">Display — Fraunces</p>
            <p className="type-display">
              Les locks, <em className="text-forest">ton identité.</em>
            </p>
          </div>
          <div>
            <p className="mb-2 text-xs text-charcoal">Titre 1</p>
            <p className="type-h1">Et si tu créais tes propres locks ?</p>
          </div>
          <div>
            <p className="mb-2 text-xs text-charcoal">Titre 2</p>
            <p className="type-h2">Trois offres, une seule expertise</p>
          </div>
          <div>
            <p className="mb-2 text-xs text-charcoal">Titre 3</p>
            <p className="type-h3">Départ de locks durables</p>
          </div>
          <div>
            <p className="mb-2 text-xs text-charcoal">Chapô — Manrope</p>
            <p className="type-lead max-w-xl text-charcoal">
              Imagine ton style, personnalise ton projet et donne vie à tes envies avec LP LOCKS.
            </p>
          </div>
          <div>
            <p className="mb-2 text-xs text-charcoal">Texte courant</p>
            <p className="max-w-xl leading-relaxed">
              Longueur, couleur, texture, épaisseur : chaque choix est expliqué et le récapitulatif se met à jour
              immédiatement.
            </p>
          </div>
          <p className="type-eyebrow text-sage-ink">Surtitre · MY LOCKS DESIGN</p>
        </div>
      </Section>

      <Section title="Boutons">
        <div className="flex flex-wrap items-center gap-3">
          <Button arrow>Créer mon projet</Button>
          <Button variant="secondary">Découvrir nos services</Button>
          <Button variant="ghost">Modifier mes choix</Button>
          <Button variant="whatsapp">Envoyer sur WhatsApp</Button>
          <Button disabled>Désactivé</Button>
          <Button
            loading={loading}
            onClick={() => {
              setLoading(true);
              window.setTimeout(() => setLoading(false), 1800);
            }}
          >
            {loading ? "Chargement…" : "Tester le chargement"}
          </Button>
        </div>
        <div className="on-dark mt-6 flex flex-wrap items-center gap-3 rounded-card bg-forest p-6">
          <Button variant="light" arrow>
            Personnaliser mes locks
          </Button>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button size="sm">Petit</Button>
          <Button size="md">Moyen</Button>
          <Button size="lg">Grand</Button>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge tone="forest">Réalisation LP LOCKS</Badge>
          <Badge>Inspiration</Badge>
          <Badge tone="outline">Image générée par IA</Badge>
          <Badge tone="soft">Sur devis</Badge>
          <Badge tone="warning">À confirmer</Badge>
        </div>
      </Section>

      <Section title="Sélecteur de longueur">
        <ChipSelector name="ds-longueur" legend="Longueur" options={lengthOptions} value={length} onChange={setLength} />
      </Section>

      <Section title="Nuancier">
        <SwatchSelector name="ds-couleur" legend="Couleur" options={colorOptions} value={color} onChange={setColor} />
        <p className="mt-4 text-sm text-charcoal">Teintes d&apos;affichage indicatives. Autres couleurs à confirmer.</p>
      </Section>

      <Section title="Texture et épaisseur">
        <div className="grid gap-8 md:grid-cols-2">
          <ChipSelector name="ds-texture" legend="Texture" options={textureOptions} value={texture} onChange={setTexture} />
          <ChipSelector
            name="ds-epaisseur"
            legend="Épaisseur"
            options={thicknessOptions}
            value={thickness}
            onChange={setThickness}
          />
        </div>
      </Section>

      <Section title="Cartes de sélection">
        <SelectorGroup legend="Matière">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {materialOptions.map((option) => (
              <OptionCard
                key={option.id}
                name="ds-matiere"
                value={option.id}
                checked={material === option.id}
                onSelect={setMaterial}
                title={option.label}
                description={option.description}
              />
            ))}
            <OptionCard
              name="ds-matiere"
              value="indisponible"
              checked={false}
              onSelect={() => {}}
              title="Option désactivée"
              disabled
              disabledReason="Exemple d'option incompatible, avec son explication."
            />
          </div>
        </SelectorGroup>
      </Section>

      <Section title="Quantité">
        <div className="flex flex-wrap items-center gap-4">
          <QuantityStepper label="Nombre de mèches" value={quantity} onChange={setQuantity} min={1} max={500} />
          <p className="text-sm text-charcoal">{quantity} mèches</p>
        </div>
      </Section>

      <Section title="Barre de progression">
        <ProgressSteps steps={configuratorSteps} current={step} />
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            Précédent
          </Button>
          <Button
            size="sm"
            onClick={() => setStep((s) => Math.min(configuratorSteps.length - 1, s + 1))}
            disabled={step === configuratorSteps.length - 1}
          >
            Suivant
          </Button>
        </div>
      </Section>

      <Section title="Champs de formulaire">
        <form className="grid max-w-3xl gap-5 md:grid-cols-2" onSubmit={(e) => e.preventDefault()} noValidate>
          <TextField label="Nom" placeholder="Ton nom" autoComplete="name" />
          <TextField
            label="Numéro WhatsApp"
            type="tel"
            defaultValue="07 99"
            error="Saisis un numéro complet, par exemple 07 00 00 00 00."
          />
          <SelectField label="Localité" hint="Sert à calculer les frais de déplacement." defaultValue="">
            <option value="" disabled>
              Choisir une localité
            </option>
            <option>Angré</option>
            <option>Riviera 2</option>
            <option>Marcory</option>
          </SelectField>
          <TextField label="Date souhaitée" type="date" />
          <TextAreaField label="Commentaire" optional className="md:col-span-2" placeholder="Précise ton projet…" />
          <TextField label="Champ désactivé" disabled defaultValue="Non modifiable" />
        </form>
      </Section>

      <Section title="Accordéon">
        <div className="max-w-3xl">
          <Accordion
            defaultOpenId="a"
            items={[
              {
                id: "a",
                title: "Les extensions sont-elles obligatoires pour les locks temporaires ?",
                content: "Oui. La pose de locks temporaires nécessite des extensions.",
              },
              {
                id: "b",
                title: "Peut-on commencer des locks sans extensions ?",
                content: "Oui. Le départ de locks durables est possible sans extensions ou avec extensions.",
              },
              {
                id: "c",
                title: "Une demande vaut-elle réservation ?",
                content: "Non. Le rendez-vous est confirmé directement par LP LOCKS.",
              },
            ]}
          />
        </div>
      </Section>

      <Section title="Modale et notifications">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            Ouvrir une modale
          </Button>
          <Button variant="secondary" onClick={() => notify("Ton projet a bien été enregistré sur cet appareil.", "success")}>
            Notification de succès
          </Button>
          <Button variant="secondary" onClick={() => notify("Le fichier dépasse la taille autorisée.", "error")}>
            Notification d&apos;erreur
          </Button>
        </div>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Recommencer ton projet ?"
          footer={
            <>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => setModalOpen(false)}>Confirmer</Button>
            </>
          }
        >
          Exemple de fenêtre de confirmation. Elle se ferme avec la touche Échap, la croix ou un clic à l&apos;extérieur.
        </Modal>
      </Section>

      <Section title="Comparateur avant / après">
        <div className="max-w-sm">
          <BeforeAfter
            label="Démonstration"
            before={{ alt: "Avant", slot: "avant", tone: "silver" }}
            after={{ alt: "Après", slot: "apres", tone: "forest" }}
          />
        </div>
      </Section>

      <Section title="Emplacements de visuels">
        <p className="mb-6 max-w-xl text-sm text-charcoal">
          En attendant les photographies définitives, chaque visuel est remplacé par un emplacement sobre qui indique
          le fichier attendu.
        </p>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {tones.map((tone) => (
            <li key={tone} className="relative aspect-[3/4] overflow-hidden rounded-2xl">
              <MediaSlot media={{ alt: `Ton ${tone}`, slot: tone, tone }} />
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
