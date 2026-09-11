import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/site/PublicShell";
import { getGuideReadingTime, guides } from "@/content/guides";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, guideCollectionSchema, organizationSchema, SITE_URL, websiteSchema } from "@/lib/seo";

export const metadata: Metadata = { title: "Guías de imágenes para la web", description: "Guías prácticas y originales sobre convertir a WebP, elegir calidad, ajustar dimensiones y nombrar imágenes.", alternates: { canonical: "/guias" }, openGraph: { url: "/guias" } };

export default function GuidesPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      guideCollectionSchema(guides),
      breadcrumbSchema([
        { name: "Inicio", url: SITE_URL },
        { name: "Guías", url: `${SITE_URL}/guias` },
      ]),
    ],
  };

  return <PublicShell><JsonLd data={schema} /><main className="shell py-16 md:py-24"><div className="max-w-3xl"><h1 className="font-display text-5xl font-medium tracking-[-.03em] md:text-6xl">Guías para optimizar imágenes web.</h1><p className="mt-6 text-lg leading-8 text-muted-foreground">Decisiones prácticas sobre formato, dimensiones y nombres. Cada guía explica qué medir, qué revisar y dónde están los límites.</p></div><div className="mt-16 divide-y divide-border border-y border-border">{guides.map((guide) => <article key={guide.slug} className="grid gap-5 py-8 md:grid-cols-[1fr_auto] md:items-center"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">{getGuideReadingTime(guide)} de lectura</p><h2 className="mt-3 font-display text-3xl font-medium"><Link href={`/guias/${guide.slug}`} className="hover:text-primary">{guide.title}</Link></h2><p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{guide.description}</p></div><Link href={`/guias/${guide.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">Leer guía <ArrowRight className="h-4 w-4" /></Link></article>)}</div></main></PublicShell>;
}
