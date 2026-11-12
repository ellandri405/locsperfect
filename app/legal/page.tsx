import type { Metadata } from "next";
import type { ReactNode } from "react";
import { legal, legalComplete } from "@/data/legal";
import { site } from "@/data/site";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Mentions légales et confidentialité",
  description: `Mentions légales et politique de confidentialité du site ${site.name}.`,
  // Non indexée tant que les informations de l'éditeur ne sont pas complètes.
  robots: legalComplete ? undefined : { index: false, follow: true },
};

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="text-charcoal">{label}</dt>
      <dd className="font-semibold sm:text-right">{value ?? <Badge tone="warning">À compléter</Badge>}</dd>
    </div>
  );
}

function Block({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-line py-10">
      <h2 id={id} className="type-h3">
        {title}
      </h2>
      <div className="mt-4 space-y-4 leading-relaxed text-charcoal">{children}</div>
    </section>
  );
}

export default function LegalPage() {
  return (
    <>
      <PageHeader eyebrow="Informations" title="Mentions légales et confidentialité" />
      <div className="lp-container max-w-4xl pb-20 md:pb-28">
        <Block id="editeur" title="Éditeur du site">
          <dl className="divide-y divide-line text-ink">
            <Field label="Marque" value={site.name} />
            <Field label="Entreprise" value={legal.companyName} />
            <Field label="Immatriculation" value={legal.registration} />
            <Field label="Adresse" value={legal.address} />
            <Field label="Responsable de la publication" value={legal.publisher} />
            <Field label="E-mail" value={legal.email} />
            <Field label="WhatsApp" value={site.contact.whatsappDisplay} />
            <Field label="Hébergeur" value={legal.host} />
          </dl>
        </Block>

        <Block id="donnees" title="Tes données personnelles">
          <p>Ce site a été conçu pour collecter le moins de données possible.</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-ink">Aucun compte, aucun enregistrement sur un serveur.</strong> Le site ne possède pas de base
              de données : il ne conserve ni ton nom, ni ton numéro, ni tes messages.
            </li>
            <li>
              <strong className="text-ink">Ton projet MY LOCKS DESIGN</strong> (tes choix de personnalisation et ta localité) est
              sauvegardé uniquement dans ton navigateur, sur ton appareil, pour que tu puisses le reprendre. Tu peux l&apos;effacer à
              tout moment avec le bouton « Recommencer ». Ton nom et ton numéro n&apos;y sont jamais enregistrés.
            </li>
            <li>
              <strong className="text-ink">Tes demandes</strong> (projet, commande, rendez-vous) sont transmises par WhatsApp, à ton
              initiative : rien n&apos;est envoyé tant que tu n&apos;appuies pas sur « Envoyer » dans WhatsApp. Les informations que tu
              partages sont alors traitées par WhatsApp selon ses propres conditions, et utilisées par {site.name} uniquement pour
              répondre à ta demande.
            </li>
            <li>
              <strong className="text-ink">Ta photo d&apos;inspiration</strong>, si tu en ajoutes une, reste sur ton appareil : elle
              n&apos;est ni envoyée par le site, ni transmise à un service tiers.
            </li>
            <li>
              <strong className="text-ink">Le récapitulatif PDF</strong> est créé directement sur ton appareil.
            </li>
            <li>
              <strong className="text-ink">Ta position</strong> n&apos;est jamais détectée : tu choisis toi-même ta localité.
            </li>
          </ul>
        </Block>

        <Block id="cookies" title="Cookies et mesure d'audience">
          <p>
            Le site n&apos;utilise ni cookie publicitaire, ni outil de mesure d&apos;audience, ni traceur de réseau social. Seule la
            sauvegarde locale de ton projet, décrite ci-dessus, est utilisée.
          </p>
        </Block>

        <Block id="estimations" title="Estimations et réservations">
          <p>
            Les montants affichés sur ce site sont des estimations indicatives, sous réserve de confirmation par {site.name}. Une
            demande envoyée ne constitue pas une réservation : le rendez-vous est confirmé directement par {site.name}. Aucun
            paiement n&apos;est effectué sur ce site.
          </p>
        </Block>

        <Block id="visuels" title="Visuels">
          <p>
            Les images générées par intelligence artificielle sont signalées par la mention « Image générée par IA ». Elles servent
            d&apos;inspiration et ne représentent pas des réalisations de {site.name}. Le résultat d&apos;une prestation dépend de
            sa réalisation.
          </p>
        </Block>

        <Block id="contact-donnees" title="Exercer tes droits">
          <p>
            Pour toute question sur tes données, ou pour demander la suppression des informations que tu as transmises par
            WhatsApp, écris à {site.name} au {site.contact.whatsappDisplay}.
          </p>
        </Block>
      </div>
    </>
  );
}
