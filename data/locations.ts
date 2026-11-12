import type { TravelZone } from "@/types";

/**
 * Frais de déplacement par zone. `fee: null` = « Frais sur devis ».
 * Zones 3 (5 000 FCFA) et 4 (6 000 FCFA) confirmées par LP LOCKS le 11/11/2026.
 * Les autres montants restent « communiqués, à confirmer ».
 */
export const travelZones: TravelZone[] = [
  {
    id: "zone-1",
    name: "Zone 1",
    localities: ["Bonoumin", "Attoban", "Angré", "Djibi", "Palmeraie", "Abri 2000"],
    fee: 2000,
    status: "a-confirmer",
  },
  {
    id: "zone-2",
    name: "Zone 2",
    localities: [
      "Riviera 1",
      "Riviera 2",
      "Riviera 3",
      "Riviera 4",
      "M'Pouto",
      "Akouédo",
      "Deux-Plateaux",
      "Vallon",
      "Cocody Centre",
      "Danga",
      "Mermoz",
    ],
    fee: 4000,
    status: "a-confirmer",
  },
  {
    id: "zone-3",
    name: "Zone 3",
    localities: ["Anono", "Riviera Golf", "Marcory", "Zone 4", "Biétry", "Plateau", "Adjamé"],
    fee: 5000,
    status: "valide",
  },
  {
    id: "zone-4",
    name: "Zone 4",
    localities: ["Treichville", "Koumassi", "Port-Bouët", "Abobo", "Abobo Baoulé"],
    fee: 6000,
    status: "valide",
  },
  {
    id: "zone-5",
    name: "Zone 5",
    localities: [
      "Yopougon",
      "Niangon",
      "Songon",
      "Anyama",
      "Attécoubé",
      "Zones éloignées de Bingerville",
    ],
    fee: null,
    status: "a-confirmer",
  },
];

/** Retrouve la zone d'une localité (correspondance exacte sur le libellé). */
export function findZoneByLocality(locality: string): TravelZone | undefined {
  return travelZones.find((z) => z.localities.includes(locality));
}
