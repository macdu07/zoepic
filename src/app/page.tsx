import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, FileImage, ShieldCheck, Sparkles } from "lucide-react";
import { PublicShell } from "@/components/site/PublicShell";
import PricingSection from "@/components/landing/PricingSection";
import FaqAccordion from "@/components/landing/FaqAccordion";

export const metadata: Metadata = {
  title: "Convertidor WebP para profesionales web",
  description: "Convierte JPG y PNG a WebP, ajusta dimensiones y prepara nombres claros. Procesamiento WebP local en tu navegador.",
  alternates: { canonical: "/" },
};

const FAQ_ITEMS = [
  { question: "¿Dónde se procesan las imágenes?", answer: "La conversión, el cambio de tamaño y la compresión WebP ocurren en tu navegador. Si activas el renombrado con IA, ZoePic envía una versión reducida de la imagen al servicio de IA para analizar su contenido." },
  { question: "¿Qué formatos puedo seleccionar?", answer: "ZoePic acepta archivos JPG, JPEG y PNG. El resultado se descarga en formato WebP." },
  { question: "¿La IA mejora por sí sola el posicionamiento SEO?", answer: "No. La IA propone nombres descriptivos para mantener una biblioteca ordenada. El posicionamiento depende también del contenido, el contexto de la página, el texto alternativo y el rendimiento." },
  { question: "¿Puedo convertir varias imágenes?", answer: "Sí. El tamaño máximo del lote depende del plan. Cada archivo muestra sus dimensiones, peso final y porcentaje de cambio antes de descargarlo." },
  { question: "¿Puedo conservar las dimensiones originales?", answer: "Sí. El modo Original mantiene las dimensiones. También puedes elegir tamaños habituales, relaciones de aspecto o medidas personalizadas." },
  { question: "¿Puedo cancelar mi suscripción?", answer: "Sí. Puedes gestionar o cancelar la suscripción desde tu cuenta, de acuerdo con las condiciones del servicio." },
];

const workflow = [
  { title: "Selecciona", text: "Arrastra JPG o PNG y revisa el lote antes de procesarlo.", icon: FileImage },
  { title: "Ajusta", text: "Define calidad y abre dimensiones y opciones de nombre solo cuando las necesites.", icon: Sparkles },
  { title: "Comprueba y descarga", text: "Compara peso, tamaño y estado por archivo; descarga uno o crea un ZIP.", icon: Check },
];

export default function LandingPage() {
  return (
    <PublicShell ads>
      <main>
        <section className="overflow-hidden border-b border-border/70">
          <div className="shell grid items-center gap-14 py-16 md:py-24 lg:grid-cols-[1.02fr_.98fr] lg:py-28">
            <div className="max-w-2xl animate-[enter_.6s_cubic-bezier(.16,1,.3,1)_both]">
              <h1 className="font-display text-5xl font-medium leading-[.98] tracking-[-.035em] sm:text-6xl lg:text-[5.25rem]">Imágenes más ligeras, listas para publicar.</h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">Convierte JPG y PNG a WebP, ajusta dimensiones y organiza nombres de archivo desde un flujo pensado para sitios web, tiendas y equipos de contenido.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/convert" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[0_12px_28px_-16px_hsl(var(--primary))] hover:bg-primary/90">Abrir conversor <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/guias" className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-semibold hover:bg-muted">Consultar las guías</Link>
              </div>
              <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="h-4 w-4 text-primary" /> La conversión WebP ocurre localmente en tu navegador.</p>
            </div>

            <div className="relative mx-auto w-full max-w-xl" aria-label="Ejemplo de un lote optimizado">
              <div className="absolute -inset-8 -z-10 rounded-full bg-primary/[.07] blur-3xl" />
              <div className="overflow-hidden rounded-2xl bg-[#1e2821] text-white shadow-[0_28px_70px_-38px_rgba(17,29,20,.75)]">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><span className="text-sm font-semibold">Lote de producto</span><span className="rounded-full bg-white/10 px-3 py-1 text-xs">3 archivos</span></div>
                <div className="space-y-1 p-3">
                  {[["camiseta-lino-natural.webp", "1.8 MB", "284 KB", "84%"], ["detalle-costura-frontal.webp", "920 KB", "176 KB", "81%"], ["lookbook-verano-portada.webp", "2.4 MB", "438 KB", "82%"]].map(([name, from, to, saved]) => (
                    <div key={name} className="grid grid-cols-[2.25rem_1fr_auto] items-center gap-3 rounded-xl px-3 py-3 hover:bg-white/[.05]">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#dfe7d7] text-[#286044]"><FileImage className="h-4 w-4" /></div>
                      <div className="min-w-0"><p className="truncate text-sm font-medium">{name}</p><p className="mt-0.5 text-xs text-white/55">{from} → {to}</p></div>
                      <span className="text-sm font-semibold tabular-nums text-[#a9d9b9]">−{saved}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-white/10 px-5 py-4 text-sm"><span className="text-white/60">Ahorro ilustrativo</span><strong className="tabular-nums">4.2 MB</strong></div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="shell py-20 md:py-28">
          <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
            <div><h2 className="font-display text-4xl font-medium tracking-[-.025em] md:text-5xl">Un flujo breve para una tarea repetitiva.</h2><p className="mt-5 max-w-md leading-7 text-muted-foreground">Cada paso mantiene visible lo que importa: los archivos, el ajuste aplicado y el resultado real.</p></div>
            <div className="divide-y divide-border border-y border-border">
              {workflow.map(({ title, text, icon: Icon }) => <div key={title} className="grid gap-4 py-7 sm:grid-cols-[3rem_1fr]"><Icon className="h-5 w-5 text-primary" /><div><h3 className="text-lg font-semibold">{title}</h3><p className="mt-2 leading-7 text-muted-foreground">{text}</p></div></div>)}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-[#eef0e9]"><div className="shell grid gap-10 py-20 md:grid-cols-3 md:py-24">
          <div><p className="font-display text-3xl">Conversión local</p><p className="mt-3 text-sm leading-6 text-muted-foreground">Tus archivos no necesitan viajar a un servidor para convertirse o cambiar de tamaño.</p></div>
          <div><p className="font-display text-3xl">Control por lote</p><p className="mt-3 text-sm leading-6 text-muted-foreground">Aplica una configuración coherente y revisa cada resultado antes de descargar.</p></div>
          <div><p className="font-display text-3xl">IA opcional</p><p className="mt-3 text-sm leading-6 text-muted-foreground">Actívala cuando quieras propuestas de nombres descriptivos y tu plan la incluya.</p></div>
        </div></section>

        <PricingSection />

        <section className="shell grid gap-12 py-20 md:grid-cols-[.7fr_1.3fr] md:py-28"><div><h2 className="font-display text-4xl font-medium tracking-[-.025em]">Preguntas frecuentes</h2><p className="mt-4 text-muted-foreground">Respuestas directas sobre archivos, privacidad y planes.</p></div><FaqAccordion items={FAQ_ITEMS} /></section>

        <section className="shell pb-12"><div className="grid items-center gap-8 rounded-2xl bg-[#1e2821] px-7 py-10 text-white md:grid-cols-[1fr_auto] md:px-12 md:py-12"><div><h2 className="font-display text-4xl font-medium">Prepara tu próximo lote.</h2><p className="mt-3 max-w-xl text-white/65">No necesitas una cuenta para empezar. La IA y la suscripción se activan desde tu plan.</p></div><Link href="/convert" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-[#1e2821] hover:bg-[#eef0e9]">Abrir conversor <ArrowRight className="h-4 w-4" /></Link></div></section>
      </main>
    </PublicShell>
  );
}
