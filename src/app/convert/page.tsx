import type { Metadata } from "next";
import ConversionPage from "@/components/core/ConversionPage";
import { AdSlot } from "@/components/ads/AdSlot";
import { PublicShell } from "@/components/site/PublicShell";
import { ADSENSE_SLOTS } from "@/lib/adsense";

export const metadata: Metadata = {
  title: "Conversor WebP gratis",
  description:
    "Convierte imágenes a WebP sin iniciar sesión. El renombrado con IA está disponible solo en planes de pago.",
  alternates: { canonical: "/convert" },
};

export default function ConvertPage() {
  return (
    <PublicShell ads>
      <main className="shell py-12 md:py-16">
        <div className="mb-10 max-w-3xl"><h1 className="font-display text-4xl font-medium tracking-[-.03em] sm:text-5xl">Conversor WebP</h1><p className="mt-4 text-lg leading-8 text-muted-foreground">Selecciona el lote, define la salida y revisa cada archivo. La conversión y el cambio de tamaño se realizan en este navegador.</p></div>
        <ConversionPage />
        <section className="reading mt-16 border-t border-border pt-12"><h2 className="font-display text-3xl font-medium">Antes de publicar</h2><p className="mt-4 leading-7 text-muted-foreground">Comprueba los bordes, el texto y las zonas con detalle fino. Si una imagen convertida pesa más que el original, reduce la calidad, ajusta sus dimensiones o conserva el archivo original.</p><AdSlot slot={ADSENSE_SLOTS.converter} /></section>
      </main>
    </PublicShell>
  );
}
