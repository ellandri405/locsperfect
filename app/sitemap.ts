import type { MetadataRoute } from "next";
import { careArticles } from "@/data/care";
import { site } from "@/data/site";

/** Plan du site pour les moteurs de recherche. Les nouveaux articles de conseils y entrent automatiquement. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: Array<[path: string, priority: number]> = [
    ["", 1],
    ["/my-locks-design", 0.9],
    ["/services", 0.9],
    ["/catalogue", 0.8],
    ["/galerie", 0.7],
    ["/care", 0.6],
    ["/faq", 0.6],
    ["/contact", 0.7],
    ...careArticles.map((article): [string, number] => [`/care/${article.slug}`, 0.5]),
  ];
  return pages.map(([path, priority]) => ({ url: `${site.url}${path}`, changeFrequency: "monthly", priority }));
}
