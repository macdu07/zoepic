import { NextResponse } from "next/server";
import { cancelPayPalSubscription } from "@/lib/paypal";
import { PLANS } from "@/lib/usage-types";
import { db } from "@/db/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth-server";

/**
 * POST /api/paypal/cancel
 * Cancela la suscripción de PayPal del usuario autenticado y lo regresa al plan Starter.
 * El userId se obtiene siempre de la sesión del servidor — nunca del body.
 */
export async function POST() {
  try {
    // 1. Verificar sesión — 401 si no autenticado
    const { session, errorResponse } = await requireSession();
    if (errorResponse) return errorResponse;
    const userId = session.user.id;

    // 2. Obtener el perfil del usuario autenticado
    const profileRecords = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    if (!profileRecords || profileRecords.length === 0) {
      return NextResponse.json(
        { error: "Perfil de usuario no encontrado" },
        { status: 404 },
      );
    }

    const profile = profileRecords[0];

    if (!profile.paypalSubscriptionId) {
      return NextResponse.json(
        { error: "No hay suscripción activa para cancelar" },
        { status: 400 },
      );
    }

    // 3. Cancelar con PayPal
    await cancelPayPalSubscription(
      profile.paypalSubscriptionId,
      "Usuario solicitó cancelación",
    );

    // 4. Bajar al plan Starter
    const starter = PLANS.starter;
    try {
      await db
        .update(userProfiles)
        .set({
          plan: "starter",
          aiConversionsLimit: starter.aiConversionsLimit,
          maxBatchSize: starter.maxBatchSize,
          paypalSubscriptionId: null,
          subscriptionStatus: "cancelled",
        })
        .where(eq(userProfiles.userId, userId));
    } catch (updateErr) {
      console.error("DB update error:", updateErr);
      return NextResponse.json(
        { error: "Error al actualizar el perfil de usuario" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Suscripción cancelada. Has vuelto al plan Starter.",
    });
  } catch (error) {
    console.error("Cancel error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
