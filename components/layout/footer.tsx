import Image from "next/image";
import Link from "next/link";
import { mainNav, site } from "@/data/site";
import { whatsappUrl } from "@/lib/whatsapp";

export function Footer() {
  const link = "inline-flex min-h-9 items-center text-white/75 transition-colors hover:text-white";
  return (
    <footer className="on-dark mt-auto bg-ink text-white">
      <div className="lp-container grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:py-20">
        <div>
          <div className="flex items-center gap-4">
            <Image src={site.logo.onDark} alt={`Logo ${site.name}`} width={88} height={88} className="size-20" />
            <p className="text-[1.0625rem] font-extrabold tracking-[0.2em]">{site.name}</p>
          </div>
          <p className="type-h3 mt-5 max-w-sm text-white/90">
            Une marque dédiée exclusivement aux locks, à {site.city}.
          </p>
        </div>

        <nav aria-label="Pied de page">
          <h2 className="type-eyebrow text-white/50">Explorer</h2>
          <ul className="mt-4">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={link}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/faq" className={link}>
                FAQ
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="type-eyebrow text-white/50">Contact</h2>
          <ul className="mt-4">
            <li>
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={link}>
                WhatsApp : {site.contact.whatsappDisplay}
              </a>
            </li>
            <li>
              <a href={site.contact.instagramUrl} target="_blank" rel="noopener noreferrer" className={link}>
                Instagram : @{site.contact.instagramHandle}
              </a>
            </li>
            <li className="flex min-h-9 items-center text-white/75">
              {site.city}, {site.country}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="lp-container flex flex-col gap-2 py-6 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {site.name}. Tous droits réservés.
          </p>
          <Link href="/legal" className="inline-flex min-h-9 items-center hover:text-white">
            Mentions légales et confidentialité
          </Link>
        </div>
      </div>
    </footer>
  );
}
