import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Zap, Shield, FileImage, Download } from "lucide-react";
import { BrandLogo } from "@/components/icons/BrandLogo";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/core/AnimatedSection";
import NavbarActions from "@/components/landing/NavbarActions";
import HeroButtons from "@/components/landing/HeroButtons";
import PricingSection from "@/components/landing/PricingSection";
import FaqAccordion from "@/components/landing/FaqAccordion";

export const metadata: Metadata = {
  title: "Convierte imágenes a WebP con IA — Renombrado SEO Automático",
  description:
    "Convierte tus imágenes a WebP y renómbralas automáticamente con IA para mejorar tu SEO. Compresión hasta 80% menor tamaño, privacidad total. Gratis para empezar.",
  alternates: { canonical: "/" },
};

const FAQ_ITEMS = [
  {
    question: "¿Mis imágenes se suben a un servidor?",
    answer:
      "No. La conversión a WebP se realiza completamente en tu navegador. Tus imágenes nunca abandonan tu dispositivo, lo que garantiza privacidad total.",
  },
  {
    question: "¿Qué formatos de imagen acepta ZoePic?",
    answer:
      "Actualmente soportamos JPG, JPEG y PNG. Estamos trabajando para añadir soporte para más formatos próximamente.",
  },
  {
    question: "¿Cómo funciona el renombrado con IA?",
    answer:
      "Nuestra IA analiza el contenido visual de cada imagen y genera un nombre descriptivo y optimizado para SEO. Por ejemplo, 'IMG_2041.jpg' puede convertirse en 'zapatos-deportivos-rojos-running.webp'.",
  },
  {
    question: "¿Qué pasa cuando llego al límite de renombrados IA?",
    answer:
      "En el plan gratuito puedes convertir hasta 100 imágenes a WebP por mes. Simplemente el renombrado automático con IA se desactiva hasta que renueves tu periodo o actualices tu plan.",
  },
  {
    question: "¿Puedo cancelar mi suscripción en cualquier momento?",
    answer:
      "Sí, puedes cancelar desde tu dashboard en cualquier momento. No hay permanencia ni penalizaciones.",
  },
  {
    question: "¿El plan anual se puede cambiar a mensual?",
    answer:
      "Actualmente los planes disponibles son mensuales. El descuento anual refleja el ahorro al comprometerte con un año completo de suscripción.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://zoepic.online/#website",
      url: "https://zoepic.online",
      name: "ZoePic",
      description:
        "Convierte imágenes a WebP y renómbralas con IA para mejorar tu SEO.",
      inLanguage: "es",
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://zoepic.online/#app",
      name: "ZoePic",
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web",
      url: "https://zoepic.online",
      description:
        "Conversor de imágenes a WebP con renombrado automático usando inteligencia artificial para mejorar el SEO.",
      inLanguage: "es",
      offers: [
        {
          "@type": "Offer",
          name: "Starter",
          price: "0",
          priceCurrency: "USD",
          description: "100 conversiones WebP/mes, 50 renombrados IA/mes.",
        },
        {
          "@type": "Offer",
          name: "Pro",
          price: "6.99",
          priceCurrency: "USD",
          billingPeriod: "P1M",
          description: "WebP ilimitado, 3,000 renombrados IA/mes.",
        },
        {
          "@type": "Offer",
          name: "Agency",
          price: "23.99",
          priceCurrency: "USD",
          billingPeriod: "P1M",
          description: "WebP ilimitado, 20,000 renombrados IA/mes.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandLogo className="h-7 w-auto text-foreground" />
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
            >
              Precios
            </a>
            <NavbarActions />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <AnimatedSection variant="fadeUp" delay={0.1}>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-8">
              <Sparkles className="h-3.5 w-3.5" />
              Conversión inteligente de imágenes
            </div>
          </AnimatedSection>

          <AnimatedSection variant="fadeUp" delay={0.22}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6">
              Convierte a WebP y
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                renombra con IA
              </span>
            </h1>
          </AnimatedSection>

          <AnimatedSection variant="fadeUp" delay={0.34}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              La herramienta definitiva para optimizar imágenes. Compresión WebP
              inteligente y{" "}
              <span className="font-semibold text-foreground">
                renombrado automático con IA
              </span>{" "}
              para mejorar tu SEO y organización.
            </p>
          </AnimatedSection>

          <AnimatedSection variant="fadeUp" delay={0.46}>
            <HeroButtons showLearnMore primaryLabel="Comenzar Gratis" />
          </AnimatedSection>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-24">
        <AnimatedSection variant="fadeUp" className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Todo lo que necesitas
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Herramientas poderosas para optimizar tus imágenes de forma
            profesional.
          </p>
        </AnimatedSection>

        <StaggerContainer
          className="grid md:grid-cols-3 gap-6"
          staggerDelay={0.12}
          delay={0.05}
        >
          {[
            {
              icon: Sparkles,
              title: "Renombrado con IA",
              description:
                "Olvídate de 'IMG_2024'. Nuestra IA analiza el contenido y renombra tus archivos automáticamente para mejorar tu SEO.",
            },
            {
              icon: Zap,
              title: "Conversión Instantánea",
              description:
                "Transforma tus imágenes a WebP en milisegundos. Compresión inteligente que reduce el peso hasta un 80%.",
            },
            {
              icon: Shield,
              title: "Privacidad Total",
              description:
                "El procesamiento se realiza en tu navegador. Tus imágenes nunca salen de tu dispositivo ni se suben a servidores.",
            },
          ].map((feature, index) => (
            <StaggerItem key={index} variant="fadeUp">
              <Card className="group border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 h-full">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* How It Works */}
      <section className="bg-card/30 backdrop-blur-sm border-y border-border/30">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <AnimatedSection variant="fadeUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Tres simples pasos para optimizar tus imágenes.
            </p>
          </AnimatedSection>

          <StaggerContainer
            className="grid md:grid-cols-3 gap-8"
            staggerDelay={0.15}
            delay={0.05}
          >
            {[
              {
                step: "01",
                icon: FileImage,
                title: "Sube tus imágenes",
                description:
                  "Arrastra y suelta o selecciona tus archivos PNG, JPEG, GIF, BMP o TIFF.",
              },
              {
                step: "02",
                icon: Sparkles,
                title: "Ajusta la calidad",
                description:
                  "Elige el nivel de compresión ideal y previsualiza los resultados en tiempo real.",
              },
              {
                step: "03",
                icon: Download,
                title: "Descarga en WebP",
                description:
                  "Obtén tus imágenes optimizadas listas para usar en tu sitio web o aplicación.",
              },
            ].map((item, index) => (
              <StaggerItem key={index} variant="scale">
                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-5">
                    <div className="absolute inset-0 rounded-2xl bg-primary/10" />
                    <div className="absolute inset-0 rounded-2xl flex items-center justify-center">
                      <item.icon className="h-7 w-7 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                    {item.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Pricing — client component (billing toggle + PayPal) */}
      <PricingSection />

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <AnimatedSection variant="fadeUp" className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Todo lo que necesitas saber sobre ZoePic.
          </p>
        </AnimatedSection>
        <FaqAccordion items={FAQ_ITEMS} />
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <AnimatedSection variant="scale" amount={0.2}>
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border border-primary/20 p-12 text-center">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                ¿Listo para optimizar tus imágenes?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
                Crea tu cuenta gratuita y comienza a convertir imágenes a WebP en
                segundos.
              </p>
              <HeroButtons primaryLabel="Empezar Ahora" />
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/20">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrandLogo className="h-6 w-auto text-foreground" />
          </div>
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
