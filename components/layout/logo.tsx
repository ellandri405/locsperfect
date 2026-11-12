import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";
import { cn } from "@/lib/cn";

/**
 * Logo officiel LP LOCKS (pastille) accompagné du nom de la marque.
 * Pour changer de fichier : remplacer les images de /public/assets/brand
 * ou modifier `logo` dans data/site.ts.
 */
export function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={`${site.name} — retour à l'accueil`}
      className={cn("inline-flex h-11 items-center gap-2.5", className)}
    >
      <Image src={site.logo.onLight} alt="" width={44} height={44} priority className="size-10 lg:size-11" />
      <span aria-hidden className="text-[1.0625rem] font-extrabold tracking-[0.2em]">
        {site.name}
      </span>
    </Link>
  );
}
