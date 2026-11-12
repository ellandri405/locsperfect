import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { WhatsAppIcon } from "@/components/layout/whatsapp-icon";
import { whatsappUrl } from "@/lib/whatsapp";

/** Bandeau de fin de page : configurateur + WhatsApp. */
export function CtaBand({ title = "Envie de composer ton style ?" }: { title?: string }) {
  return (
    <section className="px-3 pb-3 sm:px-4 sm:pb-4">
      <Reveal className="on-dark relative mx-auto max-w-[100rem] overflow-hidden rounded-panel bg-forest text-white">
        <div aria-hidden className="lp-strands absolute inset-0 opacity-60" />
        <div className="lp-container relative flex flex-col items-start gap-8 py-14 md:flex-row md:items-center md:justify-between md:py-20">
          <h2 className="type-h2 max-w-xl">{title}</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href="/my-locks-design" variant="light" size="lg" arrow>
              Créer mon projet
            </Button>
            <Button
              href={whatsappUrl()}
              external
              size="lg"
              className="border border-white/40 bg-transparent hover:bg-white/10"
              icon={<WhatsAppIcon className="size-5" />}
            >
              Écrire sur WhatsApp
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
