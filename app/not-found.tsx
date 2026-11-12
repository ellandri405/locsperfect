import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page introuvable" };

export default function NotFound() {
  return (
    <section className="lp-container flex min-h-[70svh] flex-col items-start justify-center py-20">
      <p className="type-eyebrow text-sage-ink">Erreur 404</p>
      <h1 className="type-h1 mt-4 max-w-3xl">
        Cette page <em className="text-forest">n&apos;existe pas.</em>
      </h1>
      <p className="type-lead mt-5 max-w-xl text-charcoal">
        Le lien est peut-être incomplet, ou la page a été déplacée.
      </p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Button href="/" arrow>
          Retour à l&apos;accueil
        </Button>
        <Button href="/my-locks-design" variant="secondary">
          Créer mon projet
        </Button>
      </div>
    </section>
  );
}
