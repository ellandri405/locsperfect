"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { mainNav, site } from "@/data/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { WhatsAppIcon } from "./whatsapp-icon";

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  // Menu mobile : blocage du défilement de la page et fermeture avec Échap.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-white/85 backdrop-blur-md">
      <div className="lp-container flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
        <Logo onClick={close} />

        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 items-center rounded-full px-3.5 text-sm font-semibold transition-colors duration-200",
                    !item.featured && "text-charcoal hover:text-ink aria-[current=page]:text-ink",
                    item.featured && "mx-1.5",
                    item.featured &&
                      (isActive(item.href) ? "bg-forest text-white" : "bg-mist text-forest hover:bg-soft"),
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            href={whatsappUrl()}
            external
            variant="primary"
            size="sm"
            aria-label={`Contacter ${site.name} sur WhatsApp`}
            icon={<WhatsAppIcon className="size-4.5" />}
            className="max-sm:w-11 max-sm:px-0 max-sm:[&>span]:sr-only"
          >
            WhatsApp
          </Button>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            className="grid size-11 place-items-center rounded-full border border-line transition-colors hover:bg-mist lg:hidden"
          >
            {menuOpen ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <div
        id="menu-mobile"
        inert={!menuOpen}
        className={cn(
          // « absolute » et non « fixed » : le flou d'arrière-plan de l'en-tête crée son propre repère.
          "absolute inset-x-0 top-full h-[calc(100dvh-4rem)] overflow-y-auto bg-white transition-[opacity,transform] duration-300 ease-soft lg:hidden",
          menuOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        <nav aria-label="Navigation mobile" className="lp-container flex min-h-full flex-col pt-4 pb-8">
          <ul className="flex flex-col">
            {mainNav.map((item) => (
              <li key={item.href} className="border-b border-line">
                <Link
                  href={item.href}
                  onClick={close}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="flex min-h-16 items-center justify-between gap-4 py-3"
                >
                  <span className={cn("type-h3", item.featured && "text-forest")}>{item.label}</span>
                  {item.featured && (
                    <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold text-forest">
                      Configurateur
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col gap-3 pt-8">
            <Button href="/my-locks-design" size="lg" arrow onClick={close}>
              Créer mon projet
            </Button>
            <Button
              href={whatsappUrl()}
              external
              variant="secondary"
              size="lg"
              icon={<WhatsAppIcon className="size-5" />}
            >
              {site.contact.whatsappDisplay}
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
