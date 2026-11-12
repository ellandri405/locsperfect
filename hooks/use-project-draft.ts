"use client";

import { useSyncExternalStore } from "react";
import { getDraft, getServerDraft, subscribe, type ProjectDraft } from "@/lib/project-store";

/** Brouillon du configurateur, synchronisé avec localStorage. */
export function useProjectDraft(): ProjectDraft {
  return useSyncExternalStore(subscribe, getDraft, getServerDraft);
}
