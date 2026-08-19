import { NextRequest, NextResponse } from "next/server";
import { verifyEfipayWebhookSignature } from "@/lib/efipay";
import { db } from "@/db/db";
import { userProfiles, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PLANS } from "@/lib/usage-types";
import { sendEmail, emailWrapper } from "@/lib/email";

/**
 * POST /api/efipay/webhook
 * Recibe los eventos de suscripción de EfyPay. La firma viaja en el header "Signature".
 * Eventos: renew, renewed, retry, finished, finished time, plan_changed.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  let event: Record<string, any>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const signature = request.headers.get("Signature");
  if (!verifyEfipayWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  const subscription = event.subscription ?? {};
  const subscriptionId = subscription.id as string | undefined;
  const statusKey = (event.status?.key as string) ?? "";

  if (!subscriptionId) {
    return NextResponse.json({ ok: true });
  }

  const profiles = await db
    .select({ userId: userProfiles.userId })
    .from(userProfiles)
    .where(eq(userProfiles.efipaySubscriptionId, subscriptionId))
    .limit(1);

  if (profiles.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const { userId } = profiles[0];

  if (statusKey === "retry") {
    const users = await db
      .select({ email: user.email, name: user.name })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (users.length > 0) {
      const { email, name } = users[0];
      sendEmail(
        email,
        "Problema con el pago de tu suscripción ZoePic",
        emailWrapper(`
          <h2 style="color:#668f3d">No pudimos procesar tu pago</h2>
          <p>Hola ${name ?? email}, hubo un problema al procesar el pago de tu suscripción en <strong>ZoePic</strong>.</p>
          <div style="background:#f0f5e8;border-radius:8px;padding:24px;margin:24px 0">
            <p style="margin:0;color:#555">EfyPay reintentará el cobro automáticamente. Para evitar interrupciones en tu servicio, verifica que tu método de pago esté actualizado.</p>
          </div>
          <p style="color:#666;font-size:13px">Si necesitas ayuda, contáctanos en <a href="mailto:privacy@zoepic.online" style="color:#668f3d">privacy@zoepic.online</a>.</p>
        `)
      ).catch(err => console.error("Error enviando email de pago fallido:", err));
    }
  } else if (statusKey === "finished" || statusKey === "finished time") {
    const starter = PLANS.starter;
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
  } else if (statusKey === "renew" || statusKey === "renewed") {
    await db
      .update(userProfiles)
      .set({ subscriptionStatus: "active" })
      .where(eq(userProfiles.userId, userId));
  }

  return NextResponse.json({ ok: true });
}
