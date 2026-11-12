"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { MaterialId, Product } from "@/types";
import { lengthOptions } from "@/data/configurator";
import { materialLabels } from "@/data/products";
import {
  distinctValues,
  emptyFilters,
  filterProducts,
  sortProducts,
  type ProductFilters,
  type ProductSort,
} from "@/lib/catalogue";
import { formatFcfa, formatPrice } from "@/lib/format";
import { buildProjectMessage, whatsappUrl } from "@/lib/whatsapp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/field";
import { MediaSlot } from "@/components/ui/media-slot";
import { FilterChips } from "@/components/shared/filter-chips";
import { WhatsAppIcon } from "@/components/layout/whatsapp-icon";

const priceSteps = [500, 800, 1000, 1300];

const lengthText = (id: string | null) => {
  const option = lengthOptions.find((o) => o.id === id);
  return option ? `${option.description} · ${option.detail}` : "Plusieurs longueurs";
};

export function Catalogue({ products }: { products: Product[] }) {
  const [filters, setFilters] = useState<ProductFilters>(emptyFilters);
  const [sort, setSort] = useState<ProductSort>("longueur");
  const set = (patch: Partial<ProductFilters>) => setFilters((f) => ({ ...f, ...patch }));

  const materials = useMemo(
    () =>
      (Object.keys(materialLabels) as MaterialId[])
        .map((id) => ({ id, label: materialLabels[id], count: products.filter((p) => p.material === id).length }))
        .filter((m) => m.count > 0),
    [products],
  );
  const lengths = lengthOptions.filter((o) => products.some((p) => p.lengthId === o.id));
  const colors = distinctValues(products, "color");
  const textures = distinctValues(products, "texture");

  const visible = sortProducts(filterProducts(products, filters), sort);
  const active = Object.values(filters).some((v) => v !== null);

  return (
    <div className="lp-container pb-20 md:pb-32">
      <div className="flex flex-col gap-5 border-y border-line py-5">
        <FilterChips
          label="Filtrer par matière"
          options={materials}
          value={filters.material}
          onChange={(v) => set({ material: v as MaterialId | null })}
          allLabel="Toutes les matières"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SelectField label="Longueur" value={filters.lengthId ?? ""} onChange={(e) => set({ lengthId: e.target.value || null })}>
            <option value="">Toutes les longueurs</option>
            {lengths.map((o) => (
              <option key={o.id} value={o.id}>
                {o.description} ({o.detail})
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Prix par mèche"
            value={filters.maxPrice ?? ""}
            onChange={(e) => set({ maxPrice: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">Tous les prix</option>
            {priceSteps.map((step) => (
              <option key={step} value={step}>
                Jusqu&apos;à {formatFcfa(step)}
              </option>
            ))}
          </SelectField>
          {colors.length > 1 && (
            <SelectField label="Couleur" value={filters.color ?? ""} onChange={(e) => set({ color: e.target.value || null })}>
              <option value="">Toutes les couleurs</option>
              {colors.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </SelectField>
          )}
          {textures.length > 1 && (
            <SelectField label="Texture" value={filters.texture ?? ""} onChange={(e) => set({ texture: e.target.value || null })}>
              <option value="">Toutes les textures</option>
              {textures.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </SelectField>
          )}
          <SelectField label="Trier par" value={sort} onChange={(e) => setSort(e.target.value as ProductSort)}>
            <option value="longueur">Longueur croissante</option>
            <option value="prix-croissant">Prix croissant</option>
            <option value="prix-decroissant">Prix décroissant</option>
          </SelectField>
        </div>
      </div>

      <div className="flex min-h-14 items-center justify-between gap-4 py-3">
        <p aria-live="polite" className="text-sm text-charcoal">
          <span className="font-bold text-ink">{visible.length}</span> {visible.length > 1 ? "produits" : "produit"}
        </p>
        {active && (
          <Button variant="ghost" size="sm" onClick={() => setFilters(emptyFilters)}>
            Effacer les filtres
          </Button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-card bg-mist p-8 text-center sm:p-12">
          <p className="type-h3">Aucun produit ne correspond à ces filtres.</p>
          <p className="mt-2 text-charcoal">Élargis ta recherche ou demande directement à LP LOCKS.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={() => setFilters(emptyFilters)}>Effacer les filtres</Button>
            <Button href={whatsappUrl()} external variant="secondary">
              Demander sur WhatsApp
            </Button>
          </div>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((product) => (
              <motion.li
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProductCard product={product} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const message = buildProjectMessage([
    ["Produit", product.name],
    ["Matière", materialLabels[product.material]],
    ["Longueur", product.lengthId ? lengthText(product.lengthId) : null],
    ["Prix affiché", formatPrice(product.price)],
  ]);
  const specs: Array<[string, string]> = [
    ["Matière", materialLabels[product.material]],
    ["Longueur", lengthText(product.lengthId)],
    ["Couleur", product.color ?? "Au choix, à préciser"],
    ["Texture", product.texture ?? "Au choix, à préciser"],
  ];
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card border border-line bg-white">
      <div className="relative aspect-[4/3]">
        <MediaSlot media={product.images[0]} sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" />
        {product.availability && (
          <Badge tone="forest" className="absolute top-3 right-3">
            {product.availability}
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold text-sage-ink">{product.category}</p>
        <h2 className="type-h3 mt-1 !text-[1.25rem]">{product.name}</h2>
        <p className="mt-2 text-sm leading-relaxed text-charcoal">{product.description}</p>
        <dl className="mt-4 space-y-1.5 text-sm">
          {specs.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="text-charcoal">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-auto pt-5">
          <p className="flex flex-wrap items-center gap-2">
            <span className="type-h3 !text-[1.375rem]">{formatPrice(product.price)}</span>
            {product.price.amount !== null && <span className="text-sm text-charcoal">la mèche</span>}
            {product.price.amount !== null && product.price.status !== "valide" && <Badge tone="warning">à confirmer</Badge>}
          </p>
          <Button
            href={whatsappUrl(message)}
            external
            className="mt-4 w-full"
            icon={<WhatsAppIcon className="size-4.5" />}
            aria-label={`Commander sur WhatsApp : ${product.name}`}
          >
            Commander sur WhatsApp
          </Button>
        </div>
      </div>
    </article>
  );
}
