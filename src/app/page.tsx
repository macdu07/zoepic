"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ImagePlay,
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
  FileImage,
  Download,
  ChevronDown,
  Check,
  X,
  ChevronRight,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import PayPalSubscribeButton from "@/components/core/PayPalSubscribeButton";
import { BrandLogo } from "@/components/icons/BrandLogo";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/core/AnimatedSection";
import { motion } from "framer-motion";

const ANNUAL_DISCOUNT = 0.25; // 25% descuento anual

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

export default function LandingPage() {
  const { data: sessionData, isPending } = useSession();
  const user = sessionData?.user as any;
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const initial =
    user?.name?.charAt(0)?.toUpperCase() ??
    user?.email?.charAt(0)?.toUpperCase() ??
    "U";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <motion.nav
        className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandLogo className="h-7 w-auto text-foreground" />
          </div>
          <div className="flex items-center gap-3">
            {!user && !isPending && (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-medium"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="text-sm font-semibold">
                    Crear Cuenta
                  </Button>
                </Link>
              </>
            )}
            {user && (
              <>
                <Link href="/dashboard">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-sm font-medium"
                  >
                    Ir al Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/account">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary hover:bg-primary/20 transition-colors cursor-pointer overflow-hidden flex-shrink-0">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={user?.name ?? "Foto de perfil"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initial
                    )}
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!user && !isPending && (
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="h-12 px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
                  >
                    Comenzar Gratis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
              {user && (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="h-12 px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
                  >
                    Ir al Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
              <a href="#features">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 text-base font-medium"
                >
                  Saber más
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
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

        <StaggerContainer className="grid md:grid-cols-3 gap-6" staggerDelay={0.12} delay={0.05}>
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

          <StaggerContainer className="grid md:grid-cols-3 gap-8" staggerDelay={0.15} delay={0.05}>
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

      {/* Pricing Section */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-24">
        <AnimatedSection variant="fadeUp" className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Planes y Precios
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Elige el plan que mejor se adapte a tus necesidades.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 bg-card/60 border border-border/50 rounded-full px-4 py-2">
            <button
              onClick={() => setBillingAnnual(false)}
              className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${
                !billingAnnual
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingAnnual(true)}
              className={`text-sm font-medium px-3 py-1 rounded-full transition-colors flex items-center gap-1.5 ${
                billingAnnual
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Anual
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  billingAnnual
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-primary/15 text-primary"
                }`}
              >
                -25%
              </span>
            </button>
          </div>
        </AnimatedSection>

        <StaggerContainer className="grid md:grid-cols-3 gap-6" staggerDelay={0.13} delay={0.05}>
          {/* Starter Plan */}
          <StaggerItem variant="fadeUp">
            <Card className="relative border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
              <CardContent className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-1">Starter</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold">Gratis</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Perfecto para probar la herramienta.
                </p>
                <ul className="space-y-3 text-sm mb-8 flex-grow">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    100 conversiones WebP/mes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    50 renombrados con IA/mes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    Hasta 5 imágenes por lote
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    Soporte prioritario
                  </li>
                </ul>
                {!user && !isPending && (
                  <Link href="/signup">
                    <Button variant="outline" className="w-full font-semibold">
                      Comenzar Gratis
                    </Button>
                  </Link>
                )}
                {user && (
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full font-semibold">
                      Ir al Dashboard
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Pro Plan */}
          <StaggerItem variant="fadeUp">
            <Card className="relative border-primary/50 bg-card/50 backdrop-blur-sm shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full ring-2 ring-primary/30">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  Popular
                </span>
              </div>
              <CardContent className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-1">Pro</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-extrabold">
                    $
                    {billingAnnual
                      ? (6.99 * (1 - ANNUAL_DISCOUNT)).toFixed(2)
                      : "6.99"}
                  </span>
                  <span className="text-muted-foreground text-sm">/mes</span>
                </div>
                {billingAnnual && (
                  <p className="text-xs text-primary font-medium mb-3">
                    Facturado anualmente — $
                    {(6.99 * 12 * (1 - ANNUAL_DISCOUNT)).toFixed(2)}/año
                  </p>
                )}
                <p
                  className={`text-sm text-muted-foreground mb-6 ${!billingAnnual ? "mt-4" : ""}`}
                >
                  Ideal para creadores de contenido.
                </p>
                <ul className="space-y-3 text-sm mb-8 flex-grow">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    Conversión WebP ilimitada
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    3,000 renombrados con IA/mes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    Hasta 50 imágenes por lote
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    Soporte prioritario
                  </li>
                </ul>
                {user && (
                  <PayPalSubscribeButton
                    planKey="pro"
                    planLabel="Pro"
                    onSuccess={() => (window.location.href = "/dashboard/usage")}
                  />
                )}
                {!user && !isPending && (
                  <Link href="/signup">
                    <Button className="w-full font-semibold shadow-md">
                      Crear Cuenta para Suscribirte
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Agency Plan */}
          <StaggerItem variant="fadeUp">
            <Card className="relative border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                  Mejor Valor
                </span>
              </div>
              <CardContent className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-1">Agency</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-extrabold">
                    $
                    {billingAnnual
                      ? (23.99 * (1 - ANNUAL_DISCOUNT)).toFixed(2)
                      : "23.99"}
                  </span>
                  <span className="text-muted-foreground text-sm">/mes</span>
                </div>
                {billingAnnual && (
                  <p className="text-xs text-primary font-medium mb-3">
                    Facturado anualmente — $
                    {(23.99 * 12 * (1 - ANNUAL_DISCOUNT)).toFixed(2)}/año
                  </p>
                )}
                <p
                  className={`text-sm text-muted-foreground mb-6 ${!billingAnnual ? "mt-4" : ""}`}
                >
                  Para agencias y equipos grandes.
                </p>
                <ul className="space-y-3 text-sm mb-8 flex-grow">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    Conversión WebP ilimitada
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    20,000 renombrados con IA/mes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    Hasta 100 imágenes por lote
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    Soporte prioritario
                  </li>
                </ul>
                {user && (
                  <PayPalSubscribeButton
                    planKey="agency"
                    planLabel="Agency"
                    onSuccess={() => (window.location.href = "/dashboard/usage")}
                  />
                )}
                {!user && !isPending && (
                  <Link href="/signup">
                    <Button className="w-full font-semibold shadow-md">
                      Crear Cuenta para Suscribirte
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <AnimatedSection variant="fadeUp" className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Todo lo que necesitas saber sobre ZoePic.
          </p>
        </AnimatedSection>

        <StaggerContainer className="space-y-3" staggerDelay={0.07} delay={0.05}>
          {FAQ_ITEMS.map((faq, index) => (
            <StaggerItem key={index} variant="fadeLeft">
              <div className="border border-border/50 rounded-xl bg-card/40 backdrop-blur-sm overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-primary/5 transition-colors"
                  aria-expanded={openFaq === index}
                >
                  <span className="text-sm font-semibold pr-4">
                    {faq.question}
                  </span>
                  <ChevronRight
                    className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${
                      openFaq === index ? "rotate-90" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* CTA Section */}
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
              {!user && !isPending && (
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="h-12 px-8 text-base font-semibold shadow-lg"
                  >
                    Empezar Ahora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
              {user && (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="h-12 px-8 text-base font-semibold shadow-lg"
                  >
                    Ir al Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <AnimatedSection variant="fadeIn">
        <footer className="border-t border-border/50 bg-card/20">
          <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BrandLogo className="h-6 w-auto text-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ZoePic. Todos los derechos
              reservados.
            </p>
          </div>
        </footer>
      </AnimatedSection>
    </div>
  );
}
