import { NextResponse } from "next/server";
import { cancelEfipaySubscription } from "@/lib/efipay";
import { PLANS } from "@/lib/usage-types";
import { db } from "@/db/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth-server";
import { sendEmail, emailWrapper } from "@/lib/email";

/**
 * POST /api/efipay/cancel
 * Cancela la suscripción de EfyPay del usuario autenticado y lo regresa al plan Starter.
 * El userId se obtiene siempre de la sesión del servidor — nunca del body.
 */
export async function POST() {
  try {
    const { session, errorResponse } = await requireSession();
    if (errorResponse) return errorResponse;
    const userId = session.user.id;

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

    if (!profile.efipaySubscriptionId) {
      return NextResponse.json(
        { error: "No hay suscripción activa para cancelar" },
        { status: 400 },
      );
    }

    // Cancelar en EfyPay. Si falla (ej. ya terminada), continuamos con la baja.
    try {
      await cancelEfipaySubscription(profile.efipaySubscriptionId);
    } catch (cancelErr) {
      console.error("EfyPay cancel warning:", cancelErr);
    }

    const starter = PLANS.starter;
    try {
      await db
        .update(userProfiles)
        .set({
          plan: "starter",
          aiConversionsLimit: starter.aiConversionsLimit,
          maxBatchSize: starter.maxBatchSize,
          efipaySubscriptionId: null,
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

    sendEmail(
      session.user.email,
      "Tu suscripción de ZoePic ha sido cancelada",
      emailWrapper(`
        <h2 style="color:#668f3d">Suscripción cancelada</h2>
        <p>Tu suscripción en <strong>ZoePic</strong> ha sido cancelada exitosamente. Has vuelto al plan Starter.</p>
        <div style="background:#f0f5e8;border-radius:8px;padding:24px;margin:24px 0">
          <p style="margin:8px 0"><strong>Plan actual:</strong> Starter (gratuito)</p>
          <p style="margin:8px 0"><strong>Conversiones IA / mes:</strong> No incluidas (plan gratuito)</p>
          <p style="margin:8px 0"><strong>Conversiones WebP / día:</strong> ${starter.webpConversionsLimit}</p>
          <p style="margin:8px 0"><strong>Tamaño máximo de lote:</strong> ${starter.maxBatchSize} imágenes</p>
        </div>
        <p>Si cambias de opinión, puedes reactivar tu plan en cualquier momento desde tu <a href="https://zoepic.online/dashboard/usage" style="color:#668f3d">panel de uso</a>.</p>
        <p style="color:#666;font-size:13px">Gracias por haber usado ZoePic.</p>
      `)
    ).catch(err => console.error("Error enviando email de cancelación:", err));

    return NextResponse.json({
      success: true,
      message: "Suscripción cancelada. Has vuelto al plan Starter.",
    });
  } catch (error) {
    console.error("Cancel error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
