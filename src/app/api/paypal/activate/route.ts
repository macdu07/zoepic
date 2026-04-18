import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPayPalSubscription, getPayPalPlanId } from "@/lib/paypal";
import { PLANS, type PlanKey } from "@/lib/usage-types";
import { db } from "@/db/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth-server";

const ActivateSchema = z.object({
  subscriptionId: z.string().min(1, "subscriptionId requerido"),
  planKey: z.enum(["pro", "agency"], { message: "planKey debe ser 'pro' o 'agency'" }),
});

/**
 * POST /api/paypal/activate
 * Verifica y activa la suscripción de PayPal para el usuario autenticado.
 * El userId se obtiene siempre de la sesión del servidor — nunca del body.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verificar sesión — 401 si no autenticado
    const { session, errorResponse } = await requireSession();
    if (errorResponse) return errorResponse;
    const userId = session.user.id;

    // 2. Validar body con Zod
    const rawBody = await request.json();
    const parsed = ActivateSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }
    const { subscriptionId, planKey } = parsed.data;

    // 3. Verificar la suscripción con PayPal
    const subscription = await getPayPalSubscription(subscriptionId);

    if (
      subscription.status !== "ACTIVE" &&
      subscription.status !== "APPROVED"
    ) {
      return NextResponse.json(
        { error: `Suscripción no activa. Estado: ${subscription.status}` },
        { status: 400 },
      );
    }

    // 4. Validar que el plan_id de PayPal coincide con el planKey solicitado
    const expectedPlanId = getPayPalPlanId(planKey);
    const subscriptionPlanId = (subscription.plan_id as string) ?? "";
    if (expectedPlanId && subscriptionPlanId && subscriptionPlanId !== expectedPlanId) {
      return NextResponse.json(
        { error: "El plan de la suscripción no coincide con el plan solicitado" },
        { status: 400 },
      );
    }

    // 5. Actualizar el perfil del usuario autenticado
    const plan = PLANS[planKey as PlanKey];
    try {
      await db
        .update(userProfiles)
        .set({
          plan: planKey,
          aiConversionsLimit: plan.aiConversionsLimit,
          maxBatchSize: plan.maxBatchSize,
          aiConversionsUsed: 0,
          periodStart: new Date(),
          paypalSubscriptionId: subscriptionId,
          subscriptionStatus: "active",
        })
        .where(eq(userProfiles.userId, userId));
    } catch (error) {
      console.error("DB update error:", error);
      return NextResponse.json(
        { error: "Error al actualizar el perfil de usuario" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      plan: planKey,
      message: `¡Plan ${plan.name} activado con éxito!`,
    });
  } catch (error) {
    console.error("Activation error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
