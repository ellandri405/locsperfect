"use client";

import { Plus } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

/** Accordéon : un seul panneau ouvert à la fois. */
export function Accordion({
  items,
  defaultOpenId,
  headingLevel = 3,
}: {
  items: AccordionItem[];
  defaultOpenId?: string;
  /** Niveau de titre des questions, selon la place de l'accordéon dans la page. */
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);
  const baseId = useId();

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => {
        const open = item.id === openId;
        const buttonId = `${baseId}-${item.id}-bouton`;
        const panelId = `${baseId}-${item.id}-panneau`;
        return (
          <div key={item.id}>
            <Heading>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : item.id)}
                className="group flex w-full items-center justify-between gap-6 py-5 text-left"
              >
                <span className="text-base font-semibold text-ink sm:text-lg">{item.title}</span>
                <span
                  aria-hidden
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full border transition-[transform,background-color,border-color,color] duration-300 ease-soft",
                    open
                      ? "rotate-45 border-forest bg-forest text-white"
                      : "border-silver text-ink group-hover:border-forest",
                  )}
                >
                  <Plus className="size-4" />
                </span>
              </button>
            </Heading>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={!open}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-400 ease-soft",
                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="max-w-2xl pb-6 leading-relaxed text-charcoal">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
