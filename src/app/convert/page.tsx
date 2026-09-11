import type { Metadata } from "next";
import Link from "next/link";
import ConversionPage from "@/components/core/ConversionPage";
import { PublicShell } from "@/components/site/PublicShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, organizationSchema, SITE_URL, softwareApplicationSchema, websiteSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Conversor WebP gratis",
  description:
    "Convierte JPG, JPEG y PNG a WebP gratis y por lotes sin iniciar sesión. Ajusta dimensiones y revisa el peso antes de descargar.",
  alternates: { canonical: "/convert" },
  openGraph: { url: "/convert" },
};

const conversionSchema = {
  "@context": "https://schema.org",
  "@graph": [
    organizationSchema(),
    websiteSchema(),
    softwareApplicationSchema(`${SITE_URL}/convert`),
    breadcrumbSchema([
      { name: "Inicio", url: SITE_URL },
      { name: "Conversor WebP", url: `${SITE_URL}/convert` },
    ]),
  ],
};

export default function ConvertPage() {
  return (
    <PublicShell>
      <JsonLd data={conversionSchema} />
      <main className="shell py-12 md:py-16">
        <header className="mb-10 max-w-3xl">
          <h1 className="font-display text-4xl font-medium tracking-[-.03em] sm:text-5xl">Conversor WebP</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">Selecciona el lote, define la salida y revisa cada archivo. La conversión y el cambio de tamaño se realizan en este navegador.</p>
        </header>

        <section aria-labelledby="converter-tool-heading">
          <h2 id="converter-tool-heading" className="sr-only">Herramienta de conversión</h2>
          <ConversionPage />
        </section>

        <section id="como-revisar" className="reading mt-16 border-t border-border pt-12">
          <h2 className="font-display text-3xl font-medium">Revisa cada resultado antes de publicar</h2>
          <p className="mt-4 leading-7 text-muted-foreground">El formato no garantiza un ahorro para todas las imágenes. Compara el archivo original y el resultado a tamaño de uso, sobre todo en bordes, texto incrustado, degradados y zonas con ruido.</p>
          <ul className="mt-6 space-y-3 border-l border-primary/30 pl-6 leading-7 text-foreground/80">
            <li>Si pesa más, baja la calidad en pasos pequeños o reduce dimensiones.</li>
            <li>Si recortas, comprueba que el sujeto principal no quede fuera del encuadre.</li>
            <li>Conserva el original para volver a exportar otra variante.</li>
            <li>Descarga un archivo individual para una revisión rápida o el ZIP cuando el lote esté listo.</li>
          </ul>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link href="/guias/convertir-imagenes-webp" className="rounded-xl border border-border p-5 transition-colors hover:border-primary/50 hover:bg-muted"><span className="text-sm font-semibold text-primary">Guía de WebP</span><span className="mt-2 block font-semibold">Cómo convertir sin perder el control</span></Link>
            <Link href="/guias/calidad-dimensiones-imagen-web" className="rounded-xl border border-border p-5 transition-colors hover:border-primary/50 hover:bg-muted"><span className="text-sm font-semibold text-primary">Guía de calidad</span><span className="mt-2 block font-semibold">Elegir dimensiones y calidad</span></Link>
          </div>
        </section>

        <section id="limites" className="reading mt-12 border-t border-border pt-12">
          <h2 className="font-display text-3xl font-medium">Límites y renombrado con IA</h2>
          <p className="mt-4 leading-7 text-muted-foreground">Puedes empezar sin cuenta con hasta 100 conversiones WebP al día y lotes de 5 imágenes. Pro permite lotes de 50 y Agency lotes de 100; la conversión es ilimitada en esos planes. El renombrado con IA requiere una cuenta de pago, envía una versión reducida para análisis y siempre necesita revisión humana.</p>
          <p className="mt-4 leading-7 text-muted-foreground">Cuando un archivo falle, conserva el original, quítalo del lote y vuelve a probarlo con dimensiones o calidad distintas. Un error en una imagen no debe impedir descargar las demás que ya estén listas.</p>
          <Link href="/guias/nombres-archivo-imagenes-seo" className="mt-6 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline">Ver la guía de nombres de archivo →</Link>
        </section>
      </main>
    </PublicShell>
  );
}
