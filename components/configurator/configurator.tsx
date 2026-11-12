"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Info, ListChecks, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MediaRef, ProjectTypeId } from "@/types";
import { configuratorSteps, projectTypes } from "@/data/configurator";
import { getInspiration, inspirations } from "@/data/inspirations";
import { useProjectDraft } from "@/hooks/use-project-draft";
import { fieldValueLabel, missingFields, needsLocality, type FieldId } from "@/lib/configurator";
import { rankInspirations } from "@/lib/inspirations";
import { computeEstimate } from "@/lib/pricing";
import { resetDraft, updateDraft, type ProjectDraft } from "@/lib/project-store";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { MediaSlot } from "@/components/ui/media-slot";
import { Modal } from "@/components/ui/modal";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { OptionCard, SelectorGroup } from "@/components/ui/selectors";
import { useToast } from "@/components/ui/toast";
import { StepCustomize } from "./step-customize";
import { INDICATIVE_NOTICE } from "./step-inspirations";
import { StepRender } from "./step-render";
import { StepSend } from "./step-send";
import { StepEstimate, StepSummary } from "./step-summary";
import { SummaryPanel } from "./summary-panel";

const STEP = { project: 0, customize: 1, render: 2, summary: 3, estimate: 4 } as const;

const headings: Array<{ title: string; accent: string; lead: string }> = [
  { title: "Quel est", accent: "ton projet ?", lead: "Choisis ton point de départ. Les étapes suivantes s'adaptent à ton projet : tu ne verras que les options utiles." },
  { title: "Personnalise", accent: "tes locks.", lead: "Chaque choix met à jour ton aperçu, ton récapitulatif et ton estimation." },
  { title: "Le rendu", accent: "de tes choix.", lead: "De face et de profil : voici le style qui correspond à ta sélection." },
  { title: "Ton projet,", accent: "en un coup d'œil.", lead: "Vérifie tes choix. Chacun peut encore être modifié." },
  { title: "Ton", accent: "estimation.", lead: "Le détail de ce qui peut être chiffré dès maintenant." },
];

const emptyPreview: MediaRef = { alt: "Aperçu de ton projet", slot: "models/apercu-par-defaut", tone: "soft" };
const ease = [0.22, 1, 0.36, 1] as const;

/** MY LOCKS DESIGN — parcours complet en cinq étapes : projet, personnalisation, rendu, récapitulatif, estimation. */
export function Configurator() {
  const draft = useProjectDraft();
  const { notify } = useToast();
  const [confirmReset, setConfirmReset] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  /** Étape pour laquelle les erreurs doivent être affichées (après une tentative de continuer). */
  const [errorStep, setErrorStep] = useState<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  /** Cible à atteindre après un changement d'étape : "titre" ou l'identifiant d'un champ. */
  const pendingFocus = useRef<string | null>(null);

  const step = draft.projectType ? draft.step : STEP.project;
  const project = projectTypes.find((p) => p.id === draft.projectType) ?? null;
  const estimate = useMemo(() => computeEstimate(draft), [draft]);
  const ranked = useMemo(() => rankInspirations(draft, inspirations), [draft]);
  const chosen = getInspiration(draft.inspirationId);
  const best = ranked[0];
  const showErrors = errorStep === step;

  // Après un changement d'étape : on replace la cliente au bon endroit (titre ou champ à modifier).
  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    if (target === "titre") {
      headingRef.current?.focus({ preventScroll: true });
      headingRef.current?.scrollIntoView({ block: "start" });
    } else {
      document.getElementById(`champ-${target}`)?.scrollIntoView({ block: "start" });
    }
  }, [step]);

  const set = (patch: Partial<ProjectDraft>) => updateDraft(patch);

  const goTo = (next: number, focus = "titre") => {
    pendingFocus.current = focus;
    setErrorStep(null);
    updateDraft({ step: next });
  };

  const fail = (elementId: string) => {
    setErrorStep(step);
    // Laisse le temps au message d'erreur de s'afficher avant de s'y rendre.
    window.setTimeout(() => document.getElementById(elementId)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  const next = () => {
    if (step === STEP.project && !project) return fail("choix-projet");
    if (step === STEP.customize) {
      const missing = missingFields(draft);
      if (missing.length > 0) return fail(`champ-${missing[0].id}`);
    }
    if (step === STEP.summary && needsLocality(draft) && !draft.locality) return fail("champ-locality");
    goTo(Math.min(step + 1, STEP.estimate));
  };

  const edit = (target: FieldId | "projectType" | "inspiration") => {
    if (target === "projectType") return goTo(STEP.project);
    if (target === "inspiration") return goTo(STEP.render);
    goTo(STEP.customize, target);
  };

  const reset = () => {
    resetDraft();
    setConfirmReset(false);
    setErrorStep(null);
    pendingFocus.current = "titre";
    notify("Projet réinitialisé.", "success");
  };

  // Aperçu : le projet à l'étape 1, puis l'inspiration choisie ou la plus proche des choix.
  const inspiration = step === STEP.project ? null : (chosen ?? best?.inspiration ?? null);
  const preview = inspiration?.image ?? project?.image ?? emptyPreview;
  const previewKey = inspiration?.id ?? project?.id ?? "vide";
  const previewBadge = inspiration
    ? chosen
      ? "Rendu choisi"
      : best?.exact
        ? "Correspond à tes choix"
        : "Rendu proche de tes choix"
    : (project?.label ?? "Aperçu");
  const previewCaption = inspiration?.title ?? project?.tagline ?? "Choisis un projet pour commencer.";
  const chips = (["length", "color", "texture", "thickness", "faceShape"] as FieldId[])
    .map((id) => fieldValueLabel(draft, id))
    .filter((v): v is string => step !== STEP.project && Boolean(v));

  const heading = headings[step];
  const continueLabel = step === STEP.summary ? "Voir mon estimation" : "Continuer";

  return (
    <div className="lp-container pt-6 pb-32 lg:pt-10 lg:pb-24">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12 xl:gap-16">
        {/* Zone de visualisation + récapitulatif */}
        <div className={step >= STEP.summary || step === STEP.render ? "hidden lg:block" : undefined}>
          {/* Zone défilante sur ordinateur : focalisable pour pouvoir la parcourir au clavier. */}
          <div role="region" aria-label="Aperçu et récapitulatif du projet" tabIndex={0} className="lg:sticky lg:top-24 lg:max-h-[calc(100svh-7rem)] lg:overflow-y-auto lg:p-1">
            {/* À l'étape « Rendu », les deux vues occupent le panneau principal : l'aperçu simple est masqué. */}
            <div className={cn("relative aspect-[4/3] overflow-hidden rounded-panel sm:aspect-[16/10] lg:aspect-[5/4]", step === STEP.render && "hidden")}>
              <AnimatePresence initial={false}>
                <motion.div
                  key={previewKey}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease }}
                >
                  <MediaSlot media={preview} sizes="(min-width: 1024px) 45vw, 100vw" priority />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-x-0 top-0 flex flex-wrap items-start gap-2 p-4 sm:p-5">
                <span data-testid="apercu-badge" className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-forest backdrop-blur">
                  {previewBadge}
                </span>
                {chips.map((chip) => (
                  <span key={chip} className="rounded-full bg-black/25 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                    {chip}
                  </span>
                ))}
              </div>
              <p data-testid="apercu-titre" aria-live="polite" className="type-h3 absolute right-5 bottom-12 left-5 text-white drop-shadow-sm sm:bottom-14 sm:left-6">
                {previewCaption}
              </p>
            </div>
            <p className={cn("mt-3 flex items-start gap-2 text-sm text-charcoal", step === STEP.render && "hidden")}>
              <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
              {INDICATIVE_NOTICE}
            </p>
            <SummaryPanel draft={draft} estimate={estimate} className={cn("hidden lg:block", step !== STEP.render && "mt-5")} />
          </div>
        </div>

        {/* Panneau de l'étape */}
        <div className="min-w-0">
          <ProgressSteps steps={configuratorSteps} current={step} />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease }}>
              <h1 ref={headingRef} tabIndex={-1} className="type-h1 mt-8 scroll-mt-28 outline-none">
                {heading.title} <em className="text-forest">{heading.accent}</em>
              </h1>
              <p className="type-lead mt-4 max-w-xl text-charcoal">{heading.lead}</p>

              {step === STEP.project && (
                <>
                  <div id="choix-projet" className="mt-8">
                    <SelectorGroup legend="Type de projet" hideLegend>
                      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                        {projectTypes.map((type, index) => (
                          <OptionCard
                            key={type.id}
                            name="type-de-projet"
                            value={type.id}
                            checked={draft.projectType === type.id}
                            onSelect={(id) => {
                              // Changer de projet invalide l'inspiration et la comparaison en cours.
                              if (id !== draft.projectType) set({ projectType: id as ProjectTypeId, inspirationId: null, compareIds: [null, null] });
                              setErrorStep(null);
                            }}
                            eyebrow={`0${index + 1}`}
                            title={type.label}
                            description={type.description}
                            footer={
                              type.notice ? (
                                <span className="flex items-start gap-2 rounded-xl bg-white/80 p-3 text-xs leading-snug font-semibold text-forest ring-1 ring-forest/15">
                                  <Info aria-hidden className="mt-px size-3.5 shrink-0" />
                                  {type.notice}
                                </span>
                              ) : undefined
                            }
                          />
                        ))}
                      </div>
                    </SelectorGroup>
                    {showErrors && !project && (
                      <p role="alert" className="mt-3 text-sm font-semibold text-error">
                        Choisis un type de projet pour continuer.
                      </p>
                    )}
                  </div>
                  {project && (
                    <div className="mt-6 rounded-card bg-mist p-5 sm:p-6">
                      <p className="type-eyebrow text-sage-ink">À l&apos;étape suivante, tu choisiras</p>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {project.customizations.map((item) => (
                          <li key={item.id} className="rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-ink">
                            {item.label}
                            {item.required && <span className="text-forest"> · obligatoire</span>}
                            {item.note && <span className="font-normal text-charcoal"> ({item.note})</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
              {step === STEP.customize && <StepCustomize draft={draft} onChange={set} showErrors={showErrors} />}
              {step === STEP.render && <StepRender draft={draft} ranked={ranked} onChange={set} />}
              {step === STEP.summary && <StepSummary draft={draft} estimate={estimate} onChange={set} onEdit={edit} showErrors={showErrors} />}
              {step === STEP.estimate && (
                <>
                  <StepEstimate estimate={estimate} />
                  <h2 className="type-h2 mt-14">
                    Envoie <em className="text-forest">ton projet.</em>
                  </h2>
                  <p className="mt-3 max-w-xl text-charcoal">
                    LP LOCKS reçoit ton projet sur WhatsApp et te répond pour confirmer la disponibilité.
                  </p>
                  <StepSend draft={draft} estimate={estimate} onChange={set} onEditChoices={() => goTo(STEP.summary)} onRestart={() => setConfirmReset(true)} />
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation — ordinateur */}
          <div className="mt-10 hidden items-center justify-between gap-4 lg:flex">
            {step === STEP.project ? (
              <Button variant="ghost" onClick={() => setConfirmReset(true)} disabled={!project} icon={<RotateCcw aria-hidden className="size-4" />}>
                Recommencer
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => goTo(step - 1)} icon={<ArrowLeft aria-hidden className="size-4" />}>
                Retour
              </Button>
            )}
            {step < STEP.estimate && (
              <Button size="lg" arrow onClick={next}>
                {continueLabel}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Barre d'action fixe — mobile et tablette */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur lg:hidden">
        <div className="lp-container flex items-center gap-2 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {step > STEP.project && (
            <button type="button" onClick={() => goTo(step - 1)} aria-label="Étape précédente" className="grid size-12 shrink-0 place-items-center rounded-full border border-line hover:bg-mist">
              <ArrowLeft aria-hidden className="size-4.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setSummaryOpen(true)}
            className="flex min-h-12 min-w-0 flex-1 items-center gap-2.5 rounded-full px-2 text-left hover:bg-mist"
          >
            <ListChecks aria-hidden className="size-5 shrink-0 text-forest" />
            <span className="min-w-0">
              <span className="block text-xs text-charcoal">
                <span className="sr-only">Voir </span>Mon projet<span className="sr-only"> — total estimatif :</span>
              </span>
              <span className="block truncate text-sm font-bold">{project ? estimate.totalLabel : "À choisir"}</span>
            </span>
          </button>
          {step < STEP.estimate && (
            <Button arrow onClick={next}>
              {continueLabel}
            </Button>
          )}
        </div>
      </div>

      <Modal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        title="Mon projet"
        footer={
          <>
            {project && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSummaryOpen(false);
                  setConfirmReset(true);
                }}
              >
                Recommencer
              </Button>
            )}
            <Button onClick={() => setSummaryOpen(false)}>Fermer</Button>
          </>
        }
      >
        <SummaryPanel draft={draft} estimate={estimate} hideTitle />
      </Modal>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Recommencer ton projet ?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>
              Annuler
            </Button>
            <Button onClick={reset}>Oui, recommencer</Button>
          </>
        }
      >
        Tes choix enregistrés sur cet appareil seront effacés. Cette action est définitive.
      </Modal>
    </div>
  );
}
