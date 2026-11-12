import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { careArticles, getCareArticle } from "@/data/care";
import { MediaSlot } from "@/components/ui/media-slot";
import { CtaBand } from "@/components/shared/cta-band";

export function generateStaticParams() {
  return careArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps<"/care/[slug]">): Promise<Metadata> {
  const article = getCareArticle((await params).slug);
  return article ? { title: `${article.title} — LP LOCKS CARE`, description: article.summary } : {};
}

export default async function CareArticlePage({ params }: PageProps<"/care/[slug]">) {
  const article = getCareArticle((await params).slug);
  if (!article) notFound();
  const others = careArticles.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <>
      <article className="lp-container max-w-4xl pt-8 pb-20 md:pt-12 md:pb-28">
        <Link href="/care" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-forest hover:underline">
          <ArrowLeft aria-hidden className="size-4" />
          Tous les conseils
        </Link>
        <p className="type-eyebrow mt-6 text-sage-ink">LP LOCKS CARE</p>
        <h1 className="type-h1 mt-4">{article.title}</h1>
        <p className="type-lead mt-5 text-charcoal">{article.summary}</p>

        <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-panel">
          <MediaSlot media={article.image} priority sizes="(min-width: 896px) 56rem, 100vw" />
        </div>

        <div className="mt-12 space-y-12">
          {article.sections.map((section) => (
            <section key={section.title}>
              <h2 className="type-h3">{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-[1.0625rem] leading-relaxed text-charcoal">
                  {paragraph}
                </p>
              ))}
              {section.points && (
                <ul className="mt-4 space-y-3">
                  {section.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-[1.0625rem] leading-relaxed text-charcoal">
                      <span aria-hidden className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-mist text-forest">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <p className="mt-12 rounded-2xl bg-mist p-5 text-sm leading-relaxed text-charcoal">
          Ces conseils sont généraux. Chaque chevelure est différente : LP LOCKS adapte ses recommandations à tes
          cheveux et à ta prestation lors du rendez-vous.
        </p>

        <nav aria-label="Autres conseils" className="mt-14 border-t border-line pt-8">
          <h2 className="type-eyebrow text-sage-ink">À lire aussi</h2>
          <ul className="mt-4 divide-y divide-line">
            {others.map((other) => (
              <li key={other.slug}>
                <Link href={`/care/${other.slug}`} className="flex min-h-14 items-center justify-between gap-4 py-3 font-semibold hover:text-forest">
                  {other.title}
                  <span aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </article>
      <CtaBand />
    </>
  );
}
