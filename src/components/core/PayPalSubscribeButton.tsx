"use client";

import { useState, useCallback } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useUser } from "@insforge/nextjs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface PayPalSubscribeButtonProps {
  planKey: "pro" | "agency";
  planLabel: string;
  onSuccess?: () => void;
}

export default function PayPalSubscribeButton({
  planKey,
  planLabel,
  onSuccess,
}: PayPalSubscribeButtonProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [paypalPlanId, setPaypalPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activating, setActivating] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  // Fetch the PayPal plan ID on first render
  const fetchPlanId = useCallback(async () => {
    if (paypalPlanId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/paypal/plan-id?plan=${planKey}`);
      const data = await res.json();
      if (data.planId) {
        setPaypalPlanId(data.planId);
      } else {
        toast({
          title: "Error",
          description: "No se pudo obtener el plan de PayPal.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Error al conectar con PayPal.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [planKey, paypalPlanId, toast]);

  // Fetch on mount
  useState(() => {
    fetchPlanId();
  });

  if (!clientId) {
    return <p className="text-sm text-destructive">PayPal no configurado</p>;
  }

  if (loading || !paypalPlanId) {
    return (
      <div className="w-full h-11 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (activating) {
    return (
      <div className="w-full h-11 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Activando tu plan...
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        vault: true,
        intent: "subscription",
      }}
    >
      <PayPalButtons
        style={{
          shape: "rect",
          color: "blue",
          layout: "vertical",
          label: "subscribe",
        }}
        createSubscription={(_data, actions) => {
          return actions.subscription.create({
            plan_id: paypalPlanId,
          });
        }}
        onApprove={async (data) => {
          setActivating(true);
          try {
            const res = await fetch("/api/paypal/activate", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                subscriptionId: data.subscriptionID,
                userId: user?.id,
                planKey,
              }),
            });

            const result = await res.json();

            if (result.success) {
              toast({
                title: "¡Suscripción Activada!",
                description: `Tu plan ${planLabel} está activo. ¡Disfruta de las funciones premium!`,
              });
              onSuccess?.();
            } else {
              toast({
                title: "Error",
                description:
                  result.error || "No se pudo activar la suscripción.",
                variant: "destructive",
              });
            }
          } catch {
            toast({
              title: "Error",
              description: "Error al activar la suscripción. Contacta soporte.",
              variant: "destructive",
            });
          } finally {
            setActivating(false);
          }
        }}
        onError={(err) => {
          console.error("PayPal error:", err);
          toast({
            title: "Error de PayPal",
            description: "Hubo un problema con PayPal. Inténtalo de nuevo.",
            variant: "destructive",
          });
        }}
        onCancel={() => {
          toast({
            title: "Cancelado",
            description: "Cancelaste el proceso de suscripción.",
          });
        }}
      />
    </PayPalScriptProvider>
  );
}
