import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import ConversionPage from "@/components/core/ConversionPage";
import { BrandLogo } from "@/components/icons/BrandLogo";
import NavbarActions from "@/components/landing/NavbarActions";
import { AnimatedSection } from "@/components/core/AnimatedSection";

export const metadata: Metadata = {
  title: "Conversor WebP Gratis | ZoePic",
  description:
    "Convierte imágenes a WebP sin iniciar sesión. Crea una cuenta solo si quieres usar renombrado con IA o gestionar tu suscripción.",
  alternates: { canonical: "/convert" },
};

export default function ConvertPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandLogo className="h-7 w-auto text-foreground" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
            <NavbarActions />
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center relative">
          <AnimatedSection variant="fadeUp" delay={0.08}>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Conversión pública a WebP
            </div>
          </AnimatedSection>
          <AnimatedSection variant="fadeUp" delay={0.16}>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4">
              Convierte imágenes a WebP sin iniciar sesión
            </h1>
          </AnimatedSection>
          <AnimatedSection variant="fadeUp" delay={0.24}>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Usa el conversor gratis con hasta 100 imágenes al día. Si quieres
              renombrado con IA o gestionar tu suscripción, necesitas una
              cuenta.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <ConversionPage />
      </main>

      <footer className="border-t border-border/50 bg-card/20">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo className="h-6 w-auto text-foreground" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/politica-de-privacidad"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Política de Privacidad
            </Link>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ZoePic. Todos los derechos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
