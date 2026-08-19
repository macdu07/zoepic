import { NextResponse } from "next/server";
import { createEfipayPlan, createEfipayGroup, getEfipayGroups } from "@/lib/efipay";
import { requireSession } from "@/lib/auth-server";

const GROUP_NAME = "ZoePic";
const ANNUAL_DISCOUNT = 0.25;

function annualPrice(monthly: number): number {
  return Math.round(monthly * 12 * (1 - ANNUAL_DISCOUNT) * 100) / 100;
}

/**
 * POST /api/efipay/setup-plans
 * Setup de una sola vez: crea (o reutiliza) el grupo "ZoePic" y los planes
 * de facturación en EfyPay. Protegido: solo accesible por administradores.
 */
export async function POST() {
  try {
    const { session, errorResponse } = await requireSession();
    if (errorResponse) return errorResponse;

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      return NextResponse.json(
        { error: "Endpoint de administración no configurado" },
        { status: 403 },
      );
    }
    if (session.user.email !== adminEmail) {
      return NextResponse.json(
        { error: "Acceso denegado: se requieren privilegios de administrador" },
        { status: 403 },
      );
    }

    // Resolver el grupo: usar EFIPAY_GROUP_ID si está configurado, si no
    // reutilizar el grupo "ZoePic" existente o crearlo.
    let groupId = process.env.EFIPAY_GROUP_ID ?? "";
    if (!groupId) {
      const groups = await getEfipayGroups();
      const existing = groups.find((g) => g.name === GROUP_NAME);
      groupId = existing ? existing.id : await createEfipayGroup(GROUP_NAME);
    }

    const proPlanId = await createEfipayPlan({
      name: "ZoePic Pro (Mensual)",
      description:
        "3,000 renombrados con IA/mes, hasta 50 imágenes por lote, soporte prioritario",
      price: 6.99,
      currencyType: "USD",
      subscriptionGroupId: groupId,
      invoiceInterval: "month",
    });

    const proAnnualPlanId = await createEfipayPlan({
      name: "ZoePic Pro (Anual)",
      description:
        "3,000 renombrados con IA/mes, hasta 50 imágenes por lote, soporte prioritario",
      price: annualPrice(6.99),
      currencyType: "USD",
      subscriptionGroupId: groupId,
      invoiceInterval: "year",
    });

    const agencyPlanId = await createEfipayPlan({
      name: "ZoePic Agency (Mensual)",
      description:
        "20,000 renombrados con IA/mes, hasta 100 imágenes por lote, soporte prioritario",
      price: 23.99,
      currencyType: "USD",
      subscriptionGroupId: groupId,
      invoiceInterval: "month",
    });

    const agencyAnnualPlanId = await createEfipayPlan({
      name: "ZoePic Agency (Anual)",
      description:
        "20,000 renombrados con IA/mes, hasta 100 imágenes por lote, soporte prioritario",
      price: annualPrice(23.99),
      currencyType: "USD",
      subscriptionGroupId: groupId,
      invoiceInterval: "year",
    });

    return NextResponse.json({
      success: true,
      groupId,
      proPlanId,
      proAnnualPlanId,
      agencyPlanId,
      agencyAnnualPlanId,
      message:
        "¡Planes creados! Agrega estos IDs a tus variables EFIPAY_PLAN_ID_PRO, EFIPAY_PLAN_ID_PRO_ANNUAL, EFIPAY_PLAN_ID_AGENCY y EFIPAY_PLAN_ID_AGENCY_ANNUAL.",
    });
  } catch (error) {
    console.error("EfyPay setup error:", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
