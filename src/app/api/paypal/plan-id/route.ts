import { NextRequest, NextResponse } from "next/server";
import { getPayPalPlanId } from "@/lib/paypal";

/**
 * GET /api/paypal/plan-id?plan=pro|agency
 * Returns the PayPal plan ID for a given plan key.
 */
export async function GET(request: NextRequest) {
  const planKey = request.nextUrl.searchParams.get("plan");

  if (!planKey || (planKey !== "pro" && planKey !== "agency")) {
    return NextResponse.json(
      { error: "Invalid plan. Must be 'pro' or 'agency'" },
      { status: 400 },
    );
  }

  const planId = getPayPalPlanId(planKey);

  if (!planId) {
    return NextResponse.json({ error: "Plan not configured" }, { status: 500 });
  }

  return NextResponse.json({ planId });
}
