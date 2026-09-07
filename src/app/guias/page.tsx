import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/site/PublicShell";
import { guides } from "@/content/guides";

export const metadata: Metadata = { title: "Guías de imágenes para la web", description: "Guías originales sobre WebP, calidad, dimensiones y nombres de archivo.", alternates: { canonical: "/guias" } };

export default function GuidesPage() {
  return <PublicShell ads><main className="shell py-16 md:py-24"><div className="max-w-3xl"><h1 className="font-display text-5xl font-medium tracking-[-.03em] md:text-6xl">Publicar imágenes con criterio.</h1><p className="mt-6 text-lg leading-8 text-muted-foreground">Decisiones prácticas sobre formato, dimensiones y nombres. Cada guía explica qué medir, qué revisar y dónde están los límites.</p></div><div className="mt-16 divide-y divide-border border-y border-border">{guides.map((guide) => <article key={guide.slug} className="grid gap-5 py-8 md:grid-cols-[1fr_auto] md:items-center"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">{guide.readingTime} de lectura</p><h2 className="mt-3 font-display text-3xl font-medium"><Link href={`/guias/${guide.slug}`} className="hover:text-primary">{guide.title}</Link></h2><p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{guide.description}</p></div><Link href={`/guias/${guide.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">Leer guía <ArrowRight className="h-4 w-4" /></Link></article>)}</div></main></PublicShell>;
}
