import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PLANS, type PlanKey } from "@/lib/usage-types";
import {
  cancelEfipaySubscription,
  createEfipaySubscriber,
  getEfipaySubscriberByEmail,
  createEfipaySubscription,
  getEfipayPlanId,
} from "@/lib/efipay";
import { db } from "@/db/db";
import { userProfiles } from "@/db/schema";
import { and, eq, isNull, or } from "drizzle-orm";
import { requireSession } from "@/lib/auth-server";
import { sendEmail, emailWrapper } from "@/lib/email";

const SubscribeSchema = z.object({
  planKey: z.enum(["pro", "agency"], { message: "planKey debe ser 'pro' o 'agency'" }),
  billingPeriod: z.enum(["monthly", "annual"]).default("monthly"),
  subscriber: z.object({
    identificationType: z.enum([
      "CC",
      "CE",
      "TI",
      "PPT",
      "DNI",
      "NIT",
      "Pasaporte",
      "Otro",
    ]),
    idNumber: z.string().min(5, "Número de documento inválido").max(50),
    name: z.string().min(1, "Nombre requerido"),
    lastName: z.string().min(1, "Apellido requerido"),
    phoneCode: z.number().int().min(1).max(999),
    cellphoneNumber: z.string().min(5, "Celular inválido"),
    billingAddress: z.string().min(1, "Dirección requerida"),
    billingCity: z.string().min(1, "Ciudad requerida"),
    billingCountry: z.string().min(1, "País requerido"),
  }),
  card: z.object({
    holder: z.string().min(1, "Titular requerido").max(80),
    number: z.string().regex(/^\d{14,16}$/, "Número de tarjeta inválido"),
    datetime: z.string().regex(/^\d{4}-\d{2}$/, "Vencimiento inválido (yyyy-mm)"),
    cvv: z.number().int().min(100).max(9999),
  }),
});

/**
 * POST /api/efipay/subscribe
 * Crea (o reutiliza) el suscriptor en EfyPay y genera la suscripción
 * recurrente con los datos de la tarjeta. El userId se obtiene de la sesión.
 */
export async function POST(request: NextRequest) {
  let lockedUserId: string | null = null;
  let previousSubscriptionStatus: string | null = null;
  let createdSubscriptionId: string | null = null;

  try {
    const { session, errorResponse } = await requireSession();
    if (errorResponse) return errorResponse;
    const userId = session.user.id;

    const rawBody = await request.json();
    const parsed = SubscribeSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }
    const { planKey, billingPeriod, subscriber, card } = parsed.data;

    const planId = getEfipayPlanId(planKey, billingPeriod);
    if (!planId) {
      return NextResponse.json(
        { error: "Plan no configurado. Contacta soporte." },
        { status: 500 },
      );
    }

    const profiles = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);
    const profile = profiles[0];

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil de usuario no encontrado" },
        { status: 404 },
      );
    }

    if (
      profile.efipaySubscriptionId ||
      profile.subscriptionStatus === "active"
    ) {
      return NextResponse.json(
        {
          error:
            "Ya tienes una suscripción activa. Cancélala antes de crear otra.",
        },
        { status: 409 },
      );
    }

    previousSubscriptionStatus = profile.subscriptionStatus;
    const lockedProfiles = await db
      .update(userProfiles)
      .set({ subscriptionStatus: "creating" })
      .where(
        and(
          eq(userProfiles.userId, userId),
          isNull(userProfiles.efipaySubscriptionId),
          or(
            isNull(userProfiles.subscriptionStatus),
            eq(userProfiles.subscriptionStatus, "cancelled"),
          ),
        ),
      )
      .returning({ id: userProfiles.id });

    if (lockedProfiles.length === 0) {
      return NextResponse.json(
        {
          error:
            "Ya hay otra operación de suscripción en curso. Espera un momento antes de reintentar.",
        },
        { status: 409 },
      );
    }
    lockedUserId = userId;

    // Reutilizar suscriptor existente (email único en EfyPay)
    const email = session.user.email;
    let subscriberId = (await getEfipaySubscriberByEmail(email))?.id;
    if (!subscriberId) {
      try {
        const created = await createEfipaySubscriber({ ...subscriber, email });
        subscriberId = created.id;
      } catch (err) {
        throw new Error(
          `Error creando suscriptor en EfyPay: ${err instanceof Error ? err.message : err}`,
        );
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://zoepic.online";
    const webhookUrl = `${appUrl}/api/efipay/webhook`;

    const planLabel = `${planKey === "pro" ? "Pro" : "Agency"} ${
      billingPeriod === "annual" ? "(Anual)" : "(Mensual)"
    }`;

    let subscription: Record<string, unknown>;
    try {
      subscription = await createEfipaySubscription({
        planId,
        subscriberId,
        cardInformation: card,
        description: `Suscripción ${planLabel} — ZoePic`,
        webhookUrl,
      });
    } catch (err) {
      throw new Error(
        `Error creando suscripción en EfyPay: ${err instanceof Error ? err.message : err}`,
      );
    }

    const subscriptionId = (subscription as { id?: string })?.id;
    if (!subscriptionId) {
      throw new Error("EfyPay no devolvió el ID de la suscripción");
    }
    createdSubscriptionId = subscriptionId;

    const plan = PLANS[planKey as PlanKey];
    const updatedProfiles = await db
      .update(userProfiles)
      .set({
        plan: planKey,
        aiConversionsLimit: plan.aiConversionsLimit,
        maxBatchSize: plan.maxBatchSize,
        aiConversionsUsed: 0,
        periodStart: new Date(),
        efipaySubscriptionId: subscriptionId,
        subscriptionStatus: "active",
      })
      .where(
        and(
          eq(userProfiles.userId, userId),
          eq(userProfiles.subscriptionStatus, "creating"),
          isNull(userProfiles.efipaySubscriptionId),
        ),
      )
      .returning({ id: userProfiles.id });

    if (updatedProfiles.length === 0) {
      throw new Error("No se pudo vincular la suscripción al perfil bloqueado");
    }
    lockedUserId = null;
    createdSubscriptionId = null;

    sendEmail(
      email,
      `¡Tu plan ${plan.name} está activo en ZoePic!`,
      emailWrapper(`
        <h2 style="color:#668f3d">¡Bienvenido al plan ${plan.name}!</h2>
        <p>Tu suscripción en <strong>ZoePic</strong> ya está activa. Estos son tus nuevos límites:</p>
        <div style="background:#f0f5e8;border-radius:8px;padding:24px;margin:24px 0">
          <p style="margin:8px 0"><strong>Plan:</strong> ${plan.name}</p>
          <p style="margin:8px 0"><strong>Conversiones IA / mes:</strong> ${plan.aiConversionsLimit.toLocaleString()}</p>
          <p style="margin:8px 0"><strong>Tamaño máximo de lote:</strong> ${plan.maxBatchSize} imágenes</p>
          <p style="margin:8px 0"><strong>Conversiones WebP:</strong> Ilimitadas</p>
        </div>
        <p>Puedes gestionar tu suscripción en cualquier momento desde tu <a href="https://zoepic.online/dashboard/usage" style="color:#668f3d">panel de uso</a>.</p>
        <p style="color:#666;font-size:13px">Gracias por confiar en ZoePic.</p>
      `)
    ).catch(err => console.error("Error enviando email de activación:", err));

    return NextResponse.json({
      success: true,
      plan: planKey,
      message: `¡Plan ${plan.name} activado con éxito!`,
    });
  } catch (error) {
    console.error("EfyPay subscribe error:", error);

    if (createdSubscriptionId) {
      try {
        await cancelEfipaySubscription(createdSubscriptionId);
        createdSubscriptionId = null;
      } catch (compensationError) {
        console.error(
          "CRITICAL: no se pudo compensar la suscripción EfyPay:",
          compensationError,
        );

        if (lockedUserId) {
          try {
            await db
              .update(userProfiles)
              .set({
                efipaySubscriptionId: createdSubscriptionId,
                subscriptionStatus: "cancellation_pending",
              })
              .where(eq(userProfiles.userId, lockedUserId));
          } catch (persistenceError) {
            console.error(
              "CRITICAL: tampoco se pudo persistir la suscripción pendiente:",
              persistenceError,
            );
          }
        }

        return NextResponse.json(
          {
            error:
              "La suscripción requiere conciliación. No vuelvas a enviar el pago y contacta soporte.",
          },
          { status: 500 },
        );
      }
    }

    if (lockedUserId) {
      try {
        await db
          .update(userProfiles)
          .set({ subscriptionStatus: previousSubscriptionStatus })
          .where(
            and(
              eq(userProfiles.userId, lockedUserId),
              eq(userProfiles.subscriptionStatus, "creating"),
            ),
          );
      } catch (unlockError) {
        console.error("No se pudo liberar el bloqueo de suscripción:", unlockError);
      }
    }

    return NextResponse.json(
      { error: "No se pudo crear la suscripción. Inténtalo nuevamente." },
      { status: 502 },
    );
  }
}
