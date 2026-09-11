import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import { GuideExperiment } from "@/components/content/GuideExperiment";
import { PublicShell } from "@/components/site/PublicShell";
import { ADSENSE_SLOTS } from "@/lib/adsense";
import { getGuide, getGuideReadingTime, guides } from "@/content/guides";
import { breadcrumbSchema, guideArticleSchema, organizationSchema, SITE_URL, websiteSchema } from "@/lib/seo";

export function generateStaticParams() { return guides.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const guide = getGuide(slug); if (!guide) return {}; return { title: guide.metaTitle, description: guide.description, alternates: { canonical: `/guias/${slug}` }, openGraph: { url: `/guias/${slug}` } }; }

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const guide = getGuide(slug); if (!guide) notFound();
  const relatedGuides = guides.filter((item) => item.slug !== guide.slug).slice(0, 2);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      guideArticleSchema(guide),
      breadcrumbSchema([
        { name: "Inicio", url: SITE_URL },
        { name: "Guías", url: `${SITE_URL}/guias` },
        { name: guide.title, url: `${SITE_URL}/guias/${guide.slug}` },
      ]),
    ],
  };

  return (
    <PublicShell ads>
      <JsonLd data={schema} />
      <main>
        <article className="reading px-5 py-14 sm:px-6 md:py-20">
          <Link href="/guias" className="text-sm font-semibold text-primary">← Todas las guías</Link>
          <p className="mt-10 text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">
            Guía · {getGuideReadingTime(guide)}
          </p>
          <h1 className="mt-4 font-display text-4xl font-medium leading-tight tracking-[-.025em] sm:text-5xl">{guide.title}</h1>
          <p className="mt-6 text-xl leading-8 text-muted-foreground">{guide.description}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Actualizada el <time dateTime={guide.dateModified}>{new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${guide.dateModified}T00:00:00Z`))}</time>
          </p>
          {guide.experiment && <GuideExperiment {...guide.experiment} />}
          <div className="mt-12 space-y-12">
            {guide.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-3xl font-medium">{section.heading}</h2>
                <div className="mt-5 space-y-5 text-[1.0625rem] leading-8 text-foreground/85">
                  {section.paragraphs.map((p) => <p key={p}>{p}</p>)}
                  {section.bullets && <ul className="space-y-3 border-l border-primary/30 pl-6">{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}
                </div>
              </section>
            ))}
          </div>
          <AdSlot slot={ADSENSE_SLOTS.guide} />
          <div className="mt-16 rounded-2xl bg-[#e8eee5] p-7">
            <h2 className="font-display text-2xl">Ponlo en práctica</h2>
            <p className="mt-2 leading-7 text-muted-foreground">Abre el conversor, procesa un lote pequeño y compara cada resultado antes de publicar.</p>
            <Link href="/convert" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Abrir conversor</Link>
          </div>
          {relatedGuides.length > 0 && (
            <section className="mt-16 border-t border-border pt-10">
              <h2 className="font-display text-2xl font-medium">Continúa leyendo</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {relatedGuides.map((related) => (
                  <Link key={related.slug} href={`/guias/${related.slug}`} className="rounded-xl border border-border p-5 transition-colors hover:border-primary/50 hover:bg-muted">
                    <span className="text-sm font-semibold text-primary">Guía relacionada</span>
                    <span className="mt-2 block font-semibold">{related.title}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
    </PublicShell>
  );
}
