import { NextResponse } from "next/server";
import { createPayPalProduct, createPayPalBillingPlan } from "@/lib/paypal";

/**
 * POST /api/paypal/setup-plans
 * One-time setup: creates PayPal products and billing plans for Pro and Agency.
 * Returns the plan IDs to be saved in the PAYPAL_PLANS config.
 */
export async function POST() {
  try {
    // Create the ZoePic product
    const productId = await createPayPalProduct(
      "ZoePic",
      "ZoePic - Conversión inteligente de imágenes a WebP con renombrado automático por IA",
    );

    // Create Pro plan
    const proPlanId = await createPayPalBillingPlan(
      productId,
      "ZoePic Pro",
      "6.99",
      "3,000 renombrados con IA/mes, hasta 50 imágenes por lote, soporte prioritario",
    );

    // Create Agency plan
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
        "Plans created! Add these IDs to your PAYPAL_PLAN_ID_PRO and PAYPAL_PLAN_ID_AGENCY env vars.",
    });
  } catch (error) {
    console.error("PayPal setup error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
