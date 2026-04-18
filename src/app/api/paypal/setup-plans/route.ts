import { NextResponse } from "next/server";
import { createPayPalProduct, createPayPalBillingPlan } from "@/lib/paypal";
import { requireSession } from "@/lib/auth-server";

/**
 * POST /api/paypal/setup-plans
 * Setup de una sola vez: crea productos y planes de facturación en PayPal.
 * Protegido: solo accesible por administradores (email en ADMIN_EMAIL).
 */
export async function POST() {
  try {
    // 1. Verificar sesión
    const { session, errorResponse } = await requireSession();
    if (errorResponse) return errorResponse;

    // 2. Verificar que sea administrador
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

    // 3. Crear el producto ZoePic
    const productId = await createPayPalProduct(
      "ZoePic",
      "ZoePic - Conversión inteligente de imágenes a WebP con renombrado automático por IA",
    );

    // 4. Crear plan Pro
    const proPlanId = await createPayPalBillingPlan(
      productId,
      "ZoePic Pro",
      "6.99",
      "3,000 renombrados con IA/mes, hasta 50 imágenes por lote, soporte prioritario",
    );

    // 5. Crear plan Agency
    const agencyPlanId = await createPayPalBillingPlan(
      productId,
      "ZoePic Agency",
      "23.99",
      "20,000 renombrados con IA/mes, hasta 100 imágenes por lote, soporte prioritario",
    );

    return NextResponse.json({
      success: true,
      productId,
      proPlanId,
      agencyPlanId,
      message:
        "¡Planes creados! Agrega estos IDs a tus variables PAYPAL_PLAN_ID_PRO y PAYPAL_PLAN_ID_AGENCY.",
    });
  } catch (error) {
    console.error("PayPal setup error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
