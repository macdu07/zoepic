"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import PayPalSubscribeButton from "@/components/core/PayPalSubscribeButton";
import { StaggerContainer, StaggerItem } from "@/components/core/AnimatedSection";

const ANNUAL_DISCOUNT = 0.25;

const plans = [
  {
    key: "starter" as const,
    name: "Starter",
    price: null as number | null,
    description: "Perfecto para probar la herramienta.",
    features: [
      { text: "100 conversiones WebP/día", included: true },
      { text: "50 renombrados con IA/mes", included: true },
      { text: "Hasta 5 imágenes por lote", included: true },
      { text: "Soporte prioritario", included: false },
    ],
    popular: false,
    bestValue: false,
  },
  {
    key: "pro" as const,
    name: "Pro",
    price: 6.99,
    description: "Ideal para creadores de contenido.",
    features: [
      { text: "Conversión WebP ilimitada", included: true },
      { text: "3,000 renombrados con IA/mes", included: true },
      { text: "Hasta 50 imágenes por lote", included: true },
      { text: "Soporte prioritario", included: true },
    ],
    popular: true,
    bestValue: false,
  },
  {
    key: "agency" as const,
    name: "Agency",
    price: 23.99,
    description: "Para agencias y equipos grandes.",
    features: [
      { text: "Conversión WebP ilimitada", included: true },
      { text: "20,000 renombrados con IA/mes", included: true },
      { text: "Hasta 100 imágenes por lote", included: true },
      { text: "Soporte prioritario", included: true },
    ],
    popular: false,
    bestValue: true,
  },
];

export default function PricingSection() {
  const [billingAnnual, setBillingAnnual] = useState(false);
  const { data: sessionData, isPending } = useSession();
  const user = sessionData?.user as any;

  return (
    <section id="pricing" className="max-w-5xl mx-auto px-6 py-24">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Planes y Precios</h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
          Elige el plan que mejor se adapte a tus necesidades.
        </p>
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
      </div>

      <StaggerContainer className="grid md:grid-cols-3 gap-6" staggerDelay={0.13} delay={0.05}>
        {plans.map((plan) => (
          <StaggerItem key={plan.key} variant="fadeUp">
            <Card
              className={`relative border-border/50 bg-card/50 backdrop-blur-sm hover:-translate-y-1 transition-all duration-300 flex flex-col h-full ${
                plan.popular
                  ? "border-primary/50 shadow-lg shadow-primary/10 hover:shadow-primary/20 ring-2 ring-primary/30"
                  : "hover:border-primary/30 hover:shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    Popular
                  </span>
                </div>
              )}
              {plan.bestValue && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                    Mejor Valor
                  </span>
                </div>
              )}
              <CardContent className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  {plan.price === null ? (
                    <span className="text-4xl font-extrabold">Gratis</span>
                  ) : (
                    <>
                      <span className="text-4xl font-extrabold">
                        $
                        {billingAnnual
                          ? (plan.price * (1 - ANNUAL_DISCOUNT)).toFixed(2)
                          : plan.price.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground text-sm">/mes</span>
                    </>
                  )}
                </div>
                {billingAnnual && plan.price !== null && (
                  <p className="text-xs text-primary font-medium mb-3">
                    Facturado anualmente — $
                    {(plan.price * 12 * (1 - ANNUAL_DISCOUNT)).toFixed(2)}/año
                  </p>
                )}
                <p
                  className={`text-sm text-muted-foreground mb-6 ${
                    !billingAnnual || plan.price === null ? "mt-4" : ""
                  }`}
                >
                  {plan.description}
                </p>
                <ul className="space-y-3 text-sm mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className={`flex items-center gap-2 ${!feature.included ? "text-muted-foreground" : ""}`}
                    >
                      {feature.included ? (
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      {feature.text}
                    </li>
                  ))}
                </ul>

                {plan.key === "starter" &&
                  (user ? (
                    <Button asChild variant="outline" className="w-full font-semibold">
                      <Link href="/dashboard">Ir al Dashboard</Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="w-full font-semibold">
                      <Link href="/convert">Usar Conversor</Link>
                    </Button>
                  ))}

                {plan.key !== "starter" && !isPending && user && (
                  <PayPalSubscribeButton
                    planKey={plan.key}
                    planLabel={plan.name}
                    onSuccess={() => (window.location.href = "/dashboard/usage")}
                  />
                )}

                {plan.key !== "starter" && !isPending && !user && (
                  <Button asChild className="w-full font-semibold shadow-md">
                    <Link href="/signup">Crear Cuenta para Suscribirte</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}
