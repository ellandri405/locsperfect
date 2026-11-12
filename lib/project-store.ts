import type { ProjectTypeId } from "@/types";
import {
  colorOptions,
  extensionOptions,
  faceShapeOptions,
  lengthOptions,
  materialOptions,
  startQuantityOptions,
  strandQuantity,
  styleOptions,
  techniqueOptions,
  temporaryExtensionOptions,
  textureOptions,
  thicknessOptions,
} from "@/data/configurator";

/**
 * Sauvegarde locale du projet MY LOCKS DESIGN (localStorage).
 * Rien n'est envoyé à un serveur : le brouillon reste sur l'appareil de la cliente.
 * Les coordonnées (nom, numéro) ne sont volontairement PAS enregistrées.
 *
 * Changer la forme de `ProjectDraft` ⇒ incrémenter STORAGE_VERSION et ajouter
 * une migration dans `parse`.
 */
export const STORAGE_KEY = "lp-locks:projet";
export const STORAGE_VERSION = 3;

export interface ProjectDraft {
  version: number;
  /** Index de l'étape en cours (0 = choix du projet). */
  step: number;
  projectType: ProjectTypeId | null;
  technique: string | null;
  extensions: string | null;
  startQuantity: string | null;
  material: string | null;
  length: string | null;
  color: string | null;
  texture: string | null;
  thickness: string | null;
  /** Morphologie du visage. */
  faceShape: string | null;
  /** Ancien champ (versions 1 et 2), conservé pour compatibilité : n'est plus proposé. */
  style: string | null;
  /** Nombre de mèches (achat de locks). */
  strandQuantity: number;
  inspirationId: string | null;
  compareIds: [string | null, string | null];
  locality: string | null;
  /** Date ISO de la dernière modification, null si jamais modifié. */
  updatedAt: string | null;
}

export const EMPTY_DRAFT: ProjectDraft = {
  version: STORAGE_VERSION,
  step: 0,
  projectType: null,
  technique: null,
  extensions: null,
  startQuantity: null,
  material: null,
  length: null,
  color: null,
  texture: null,
  thickness: null,
  faceShape: null,
  style: null,
  strandQuantity: strandQuantity.initial,
  inspirationId: null,
  compareIds: [null, null],
  locality: null,
  updatedAt: null,
};

const PROJECT_TYPES: ProjectTypeId[] = ["depart", "temporaire", "achat"];
const LAST_STEP = 4;
/** Correspondance des étapes de la version 2 (7 étapes) vers la version 3 (5 étapes). */
const V2_STEPS = [0, 1, 2, 2, 3, 4, 4];

const ids = (options: { id: string }[]) => options.map((o) => o.id);
/** Valeurs autorisées par champ : toute valeur inconnue (ancienne option supprimée…) est ignorée. */
const allowed: Partial<Record<keyof ProjectDraft, string[]>> = {
  technique: ids(techniqueOptions),
  extensions: [...ids(extensionOptions), ...ids(temporaryExtensionOptions)],
  startQuantity: ids(startQuantityOptions),
  material: ids(materialOptions),
  length: ids(lengthOptions),
  color: ids(colorOptions),
  texture: ids(textureOptions),
  thickness: ids(thicknessOptions),
  faceShape: ids(faceShapeOptions),
  style: ids(styleOptions),
};

const str = (v: unknown, max = 80): string | null => (typeof v === "string" && v.length <= max ? v : null);

function parse(raw: string | null): ProjectDraft {
  if (!raw) return EMPTY_DRAFT;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return EMPTY_DRAFT;
    const d = data as Record<string, unknown>;
    const projectType = PROJECT_TYPES.includes(d.projectType as ProjectTypeId) ? (d.projectType as ProjectTypeId) : null;

    // Migration v1 → v2 : la v1 ne contenait que le type de projet.
    if (d.version === 1) {
      return { ...EMPTY_DRAFT, projectType, updatedAt: str(d.updatedAt) };
    }
    // Version inconnue (plus récente) : on repart d'un brouillon vide.
    // La version 2 est lue comme la version 3 : seules les étapes sont renumérotées (voir plus bas).
    if (d.version !== STORAGE_VERSION && d.version !== 2) return EMPTY_DRAFT;

    const draft: ProjectDraft = { ...EMPTY_DRAFT, projectType, updatedAt: str(d.updatedAt) };
    for (const [key, list] of Object.entries(allowed) as [keyof ProjectDraft, string[]][]) {
      const value = str(d[key]);
      if (value && list.includes(value)) (draft[key] as string) = value;
    }
    if (typeof d.step === "number" && Number.isInteger(d.step)) {
      const step = d.version === 2 ? (V2_STEPS[Math.min(6, Math.max(0, d.step))] ?? 0) : d.step;
      draft.step = projectType ? Math.min(LAST_STEP, Math.max(0, step)) : 0;
    }
    if (typeof d.strandQuantity === "number" && Number.isInteger(d.strandQuantity)) {
      draft.strandQuantity = Math.min(strandQuantity.max, Math.max(strandQuantity.min, d.strandQuantity));
    }
    draft.inspirationId = str(d.inspirationId);
    draft.locality = str(d.locality);
    if (Array.isArray(d.compareIds)) draft.compareIds = [str(d.compareIds[0]), str(d.compareIds[1])];
    return draft;
  } catch {
    return EMPTY_DRAFT;
  }
}

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedDraft: ProjectDraft = EMPTY_DRAFT;
/** true si localStorage est indisponible (navigation privée, quota…) : on garde le brouillon en mémoire. */
let memoryOnly = false;

function emit() {
  listeners.forEach((listener) => listener());
}

export function getDraft(): ProjectDraft {
  if (memoryOnly) return cachedDraft;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    memoryOnly = true;
    return cachedDraft;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedDraft = parse(raw);
  }
  return cachedDraft;
}

export function getServerDraft(): ProjectDraft {
  return EMPTY_DRAFT;
}

export function updateDraft(patch: Partial<Omit<ProjectDraft, "version" | "updatedAt">>) {
  const next: ProjectDraft = {
    ...getDraft(),
    ...patch,
    version: STORAGE_VERSION,
    updatedAt: new Date().toISOString(),
  };
  const raw = JSON.stringify(next);
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    memoryOnly = true;
  }
  cachedRaw = raw;
  cachedDraft = next;
  emit();
}

export function resetDraft() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    memoryOnly = true;
  }
  cachedRaw = null;
  cachedDraft = EMPTY_DRAFT;
  emit();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Synchronise aussi les autres onglets.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** Exposé pour les tests : interprète une valeur brute de localStorage. */
export const parseDraft = parse;
