import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { userProfiles, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getPayPalAccessToken } from "@/lib/paypal";
import { sendEmail, emailWrapper } from "@/lib/email";

const PAYPAL_BASE_URL = "https://api-m.paypal.com";

async function verifyPayPalWebhook(
  headers: Headers,
  rawBody: string,
  parsedEvent: unknown,
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;

  try {
    const token = await getPayPalAccessToken();
    const res = await fetch(
      `${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transmission_id: headers.get("paypal-transmission-id"),
          transmission_time: headers.get("paypal-transmission-time"),
          cert_url: headers.get("paypal-cert-url"),
          auth_algo: headers.get("paypal-auth-algo"),
          transmission_sig: headers.get("paypal-transmission-sig"),
          webhook_id: webhookId,
          webhook_event: parsedEvent,
        }),
      },
    );

    if (!res.ok) return false;
    const data = await res.json();
    return data.verification_status === "SUCCESS";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const isValid = await verifyPayPalWebhook(request.headers, rawBody, event);
  if (!isValid) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  const eventType = event.event_type as string;

  if (eventType === "BILLING.SUBSCRIPTION.PAYMENT.FAILED") {
    const resource = event.resource as Record<string, unknown> | undefined;
    const subscriptionId = resource?.id as string | undefined;
    if (!subscriptionId) return NextResponse.json({ ok: true });

    const profiles = await db
      .select({ userId: userProfiles.userId })
      .from(userProfiles)
      .where(eq(userProfiles.paypalSubscriptionId, subscriptionId))
      .limit(1);

    if (profiles.length === 0) return NextResponse.json({ ok: true });

    const { userId } = profiles[0];

    const users = await db
      .select({ email: user.email, name: user.name })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (users.length === 0) return NextResponse.json({ ok: true });

    const { email, name } = users[0];

    sendEmail(
      email,
      "Problema con el pago de tu suscripción ZoePic",
      emailWrapper(`
        <h2 style="color:#668f3d">No pudimos procesar tu pago</h2>
        <p>Hola ${name ?? email}, hubo un problema al procesar el pago de tu suscripción en <strong>ZoePic</strong>.</p>
        <div style="background:#f0f5e8;border-radius:8px;padding:24px;margin:24px 0">
          <p style="margin:0;color:#555">PayPal reintentará el cobro automáticamente. Para evitar interrupciones en tu servicio, verifica que tu método de pago esté actualizado.</p>
        </div>
        <p>
          <a href="https://www.paypal.com/myaccount/autopay" style="background:#668f3d;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">
            Actualizar método de pago
          </a>
        </p>
        <p style="color:#666;font-size:13px">Si necesitas ayuda, contáctanos en <a href="mailto:privacy@zoepic.online" style="color:#668f3d">privacy@zoepic.online</a>.</p>
      `)
    ).catch(err => console.error("Error enviando email de pago fallido:", err));
  }

  return NextResponse.json({ ok: true });
}
