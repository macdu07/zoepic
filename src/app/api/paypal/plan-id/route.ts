import { NextRequest, NextResponse } from "next/server";
import { getPayPalPlanId } from "@/lib/paypal";
import { requireSession } from "@/lib/auth-server";

/**
 * GET /api/paypal/plan-id?plan=pro|agency
 * Retorna el PayPal plan ID para el plan solicitado.
 * Requiere sesión autenticada.
 */
export async function GET(request: NextRequest) {
  // 1. Verificar sesión
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  // 2. Validar parámetro de plan
  const planKey = request.nextUrl.searchParams.get("plan");

  if (!planKey || (planKey !== "pro" && planKey !== "agency")) {
    return NextResponse.json(
      { error: "Plan inválido. Debe ser 'pro' o 'agency'" },
      { status: 400 },
    );
  }

  const planId = getPayPalPlanId(planKey);

  if (!planId) {
    return NextResponse.json({ error: "Plan no configurado" }, { status: 500 });
  }

  return NextResponse.json({ planId });
}
