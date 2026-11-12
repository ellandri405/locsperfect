import type { ReactNode } from "react";

/** En-tête commun des pages intérieures. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <header className="lp-container pt-12 pb-10 md:pt-20 md:pb-14">
      <p className="type-eyebrow text-sage-ink">{eyebrow}</p>
      <h1 className="type-h1 mt-4 max-w-4xl">{title}</h1>
      {lead && <p className="type-lead mt-5 max-w-2xl text-charcoal">{lead}</p>}
      {children && <div className="mt-8">{children}</div>}
    </header>
  );
}
