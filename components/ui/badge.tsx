import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "forest" | "soft" | "outline" | "warning";

const tones: Record<Tone, string> = {
  neutral: "bg-mist text-forest",
  forest: "bg-forest text-white",
  soft: "bg-soft text-ink",
  outline: "border border-silver text-charcoal",
  warning: "bg-[#f6ecd9] text-[#6b4a12]",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
