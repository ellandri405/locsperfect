import type { Metadata } from "next";
import { publishedProducts } from "@/data/products";
import { Catalogue } from "@/components/catalogue/catalogue";
import { PageHeader } from "@/components/shared/page-header";
import { CtaBand } from "@/components/shared/cta-band";

export const metadata: Metadata = {
  title: "Catalogue — achat de locks et extensions à Abidjan",
  description:
    "Locks naturelles, synthétiques, semi-naturelles et cheveux humains, de 6 à 30 pouces. Prix à la mèche en FCFA et commande sur WhatsApp.",
};

export default function CataloguePage() {
  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title={
          <>
            Des locks <em className="text-forest">à la mèche.</em>
          </>
        }
        lead="Choisis ta matière et ta longueur, puis commande directement auprès de LP LOCKS sur WhatsApp. Aucun paiement en ligne."
      />
      <Catalogue products={publishedProducts} />
      <CtaBand title="Besoin d'aide pour choisir ?" />
    </>
  );
}
