import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/** Page provisoire : contenu développé à la phase indiquée, après validation de la direction artistique. */
export function ComingSoon({ title, description, phase }: { title: string; description: string; phase: string }) {
  return (
    <section className="lp-container flex min-h-[70svh] flex-col items-start justify-center py-20">
      <Badge tone="warning">Page en préparation · {phase}</Badge>
      <h1 className="type-h1 mt-6 max-w-3xl">{title}</h1>
      <p className="type-lead mt-5 max-w-xl text-charcoal">{description}</p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Button href="/my-locks-design" arrow>
          Créer mon projet
        </Button>
        <Button href="/" variant="secondary">
          Retour à l&apos;accueil
        </Button>
      </div>
    </section>
  );
}
