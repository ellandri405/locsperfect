import type { Metadata } from "next";
import { Configurator } from "@/components/configurator/configurator";

export const metadata: Metadata = {
  title: "MY LOCKS DESIGN — Crée ton projet de locks",
  description:
    "Compose ton projet de locks étape par étape : type de projet, longueur, couleur, texture, épaisseur, matière. Obtiens une estimation indicative et envoie ton projet à LP LOCKS.",
};

export default function MyLocksDesignPage() {
  return <Configurator />;
}
