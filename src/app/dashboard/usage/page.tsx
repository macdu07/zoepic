"use client";

import { useEffect, useState } from "react";
import { useUser } from "@insforge/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Crown,
  Sparkles,
  Calendar,
  ImageIcon,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  getUserProfile,
  getConversionHistory,
  PLANS,
  type UserProfile,
  type ConversionLog,
  type PlanKey,
} from "@/lib/usage";
import PayPalSubscribeButton from "@/components/core/PayPalSubscribeButton";
import { useToast } from "@/hooks/use-toast";

export default function UsagePage() {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<ConversionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const [p, h] = await Promise.all([
      getUserProfile(user.id),
      getConversionHistory(user.id, 20),
    ]);
    setProfile(p);
    setHistory(h);
    setLoading(false);
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user]);

  const handleCancelSubscription = async () => {
    if (
      !user ||
      !confirm(
        "¿Estás seguro que deseas cancelar tu suscripción? Volverás al plan Starter.",
      )
    )
      return;

    setCancelLoading(true);
    try {
      const res = await fetch("/api/paypal/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Suscripción Cancelada",
          description: "Has vuelto al plan Starter.",
        });
        await fetchData();
        setShowUpgrade(false);
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo cancelar.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Error al cancelar la suscripción.",
        variant: "destructive",
      });
    } finally {
      setCancelLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        No se pudo cargar el perfil.
      </div>
    );
  }

  const usagePercent = Math.min(
    Math.round(
      (profile.ai_conversions_used / profile.ai_conversions_limit) * 100,
    ),
    100,
  );
  const planInfo = PLANS[profile.plan as PlanKey] ?? PLANS.starter;
  const periodStart = new Date(profile.period_start);
  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodEnd.getDate() + 30);

  const hasActiveSubscription =
    profile.subscription_status === "active" && profile.paypal_subscription_id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Uso & Plan</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Current Plan */}
        <Card className="shadow-lg bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Tu Plan Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">{planInfo.name}</span>
              {planInfo.price > 0 && (
                <span className="text-muted-foreground text-sm">
                  ${planInfo.price}/mes
                </span>
              )}
              {planInfo.price === 0 && (
                <span className="text-sm text-muted-foreground">Gratis</span>
              )}
            </div>

            {/* Subscription status badge */}
            {hasActiveSubscription && (
              <div className="flex items-center gap-1.5 text-sm text-emerald-500 font-medium">
                <CheckCircle className="h-4 w-4" />
                Suscripción activa vía PayPal
              </div>
            )}

            <ul className="text-sm space-y-1.5 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {planInfo.aiConversionsLimit.toLocaleString()} renombrados
                IA/mes
              </li>
              <li className="flex items-center gap-2">
                <ImageIcon className="h-3.5 w-3.5 text-primary" />
                Hasta {planInfo.maxBatchSize} imágenes por lote
              </li>
              <li className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Periodo: {periodStart.toLocaleDateString()} —{" "}
                {periodEnd.toLocaleDateString()}
              </li>
            </ul>

            {/* Upgrade / Cancel buttons */}
            {profile.plan === "starter" && !showUpgrade && (
              <Button
                className="w-full font-semibold mt-2"
                onClick={() => setShowUpgrade(true)}
              >
                Mejorar Plan
              </Button>
            )}

            {hasActiveSubscription && (
              <Button
                variant="outline"
                className="w-full font-semibold mt-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
              >
                {cancelLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Cancelar Suscripción
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Usage Meter */}
        <Card className="shadow-lg bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Uso de IA este periodo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <span className="text-4xl font-extrabold text-primary">
                {profile.ai_conversions_used}
              </span>
              <span className="text-muted-foreground text-lg">
                {" "}
                / {profile.ai_conversions_limit.toLocaleString()}
              </span>
            </div>
            <Progress value={usagePercent} className="h-3" />
            <p className="text-xs text-center text-muted-foreground">
              {usagePercent}% utilizado — te quedan{" "}
              {(
                profile.ai_conversions_limit - profile.ai_conversions_used
              ).toLocaleString()}{" "}
              conversiones AI
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Section */}
      {showUpgrade && profile.plan === "starter" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-lg bg-card border-primary/30 ring-1 ring-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Plan Pro — $7/mes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm space-y-1.5 text-muted-foreground">
                <li>✓ 3,000 renombrados con IA/mes</li>
                <li>✓ Hasta 50 imágenes por lote</li>
                <li>✓ Soporte prioritario</li>
              </ul>
              <PayPalSubscribeButton
                planKey="pro"
                planLabel="Pro"
                onSuccess={() => {
                  setShowUpgrade(false);
                  fetchData();
                }}
              />
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-card border-accent/30 ring-1 ring-accent/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Crown className="h-5 w-5 text-accent" />
                Plan Agency — $24/mes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm space-y-1.5 text-muted-foreground">
                <li>✓ 20,000 renombrados con IA/mes</li>
                <li>✓ Hasta 100 imágenes por lote</li>
                <li>✓ Soporte prioritario</li>
              </ul>
              <PayPalSubscribeButton
                planKey="agency"
                planLabel="Agency"
                onSuccess={() => {
                  setShowUpgrade(false);
                  fetchData();
                }}
              />
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => setShowUpgrade(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Conversion History */}
      <Card className="shadow-lg bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Historial de Conversiones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              Aún no has realizado ninguna conversión.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Fecha</th>
                    <th className="pb-2 font-medium">Imágenes</th>
                    <th className="pb-2 font-medium">IA</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-2.5">
                        {new Date(log.created_at).toLocaleString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2.5">{log.file_count}</td>
                      <td className="py-2.5">
                        {log.ai_used ? (
                          <span className="inline-flex items-center gap-1 text-primary font-medium">
                            <Sparkles className="h-3 w-3" />
                            Sí
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
