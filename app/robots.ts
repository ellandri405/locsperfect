import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // La page de démonstration du design system est un outil interne.
    rules: { userAgent: "*", allow: "/", disallow: ["/design-system"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
