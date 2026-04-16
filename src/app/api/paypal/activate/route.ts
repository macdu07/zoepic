import { NextRequest, NextResponse } from "next/server";
import { getPayPalAccessToken, getPayPalSubscription } from "@/lib/paypal";
import { PLANS, type PlanKey } from "@/lib/usage-types";
import { db } from "@/db/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/paypal/activate
 * Called after PayPal approval to verify and activate the subscription.
 * Body: { subscriptionId: string, userId: string, planKey: 'pro' | 'agency' }
 */
export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, userId, planKey } = await request.json();

    if (!subscriptionId || !userId || !planKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (planKey !== "pro" && planKey !== "agency") {
      return NextResponse.json({ error: "Invalid plan key" }, { status: 400 });
    }

    // Verify the subscription with PayPal
    const subscription = await getPayPalSubscription(subscriptionId);

    if (
      subscription.status !== "ACTIVE" &&
      subscription.status !== "APPROVED"
    ) {
      return NextResponse.json(
        {
          error: `Subscription not active. Status: ${subscription.status}`,
        },
        { status: 400 },
      );
    }

    // Update the user's profile
    const plan = PLANS[planKey as PlanKey];
    try {
      await db.update(userProfiles)
        .set({
          plan: planKey,
          aiConversionsLimit: plan.aiConversionsLimit,
          maxBatchSize: plan.maxBatchSize,
          aiConversionsUsed: 0,
          periodStart: new Date(),
          paypalSubscriptionId: subscriptionId,
          subscriptionStatus: "active",
        })
        .where(eq(userProfiles.userId, userId));
    } catch (error) {
      console.error("DB update error:", error);
      return NextResponse.json(
        { error: "Failed to update user profile" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      plan: planKey,
      message: `Successfully upgraded to ${plan.name}!`,
    });
  } catch (error) {
    console.error("Activation error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
