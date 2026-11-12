import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "@/data/site";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  // Lien canonique : chaque page pointe vers sa propre adresse.
  alternates: { canonical: "./" },
  keywords: [
    "locks Abidjan",
    "départ de locks Abidjan",
    "pose de locks Abidjan",
    "locks temporaires Côte d'Ivoire",
    "achat de locks Abidjan",
    "extensions locks",
    "coiffure locks homme",
    "coiffure locks femme",
  ],
  title: {
    default: `${site.name} — Locks à ${site.city} : départ, pose temporaire, achat`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "fr_CI",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: "./",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#174734",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-forest focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
        >
          Aller au contenu
        </a>
        <Providers>
          <Header />
          <main id="contenu" className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
