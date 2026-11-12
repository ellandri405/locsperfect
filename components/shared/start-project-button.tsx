"use client";

import { useRouter } from "next/navigation";
import type { ProjectTypeId } from "@/types";
import { updateDraft } from "@/lib/project-store";
import { Button } from "@/components/ui/button";

/** Ouvre MY LOCKS DESIGN avec le type de projet déjà sélectionné. */
export function StartProjectButton({ projectType, children }: { projectType: ProjectTypeId; children: string }) {
  const router = useRouter();
  return (
    <Button
      size="lg"
      arrow
      onClick={() => {
        updateDraft({ projectType });
        router.push("/my-locks-design");
      }}
    >
      {children}
    </Button>
  );
}
