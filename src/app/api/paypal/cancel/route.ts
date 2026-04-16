import { NextRequest, NextResponse } from "next/server";
import { cancelPayPalSubscription } from "@/lib/paypal";
import { PLANS } from "@/lib/usage-types";
import { db } from "@/db/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/paypal/cancel
 * Cancels a user's PayPal subscription and downgrades to Starter.
 * Body: { userId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Get the user's current subscription
    const profileRecords = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    if (!profileRecords || profileRecords.length === 0) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 },
      );
    }

    const profile = profileRecords[0];

    if (!profile.paypalSubscriptionId) {
      return NextResponse.json(
        { error: "No active subscription to cancel" },
        { status: 400 },
      );
    }

    // Cancel with PayPal
    await cancelPayPalSubscription(
      profile.paypalSubscriptionId,
      "Usuario solicitó cancelación",
    );

    // Downgrade to Starter
    const starter = PLANS.starter;
    try {
      await db.update(userProfiles)
        .set({
          plan: "starter",
          aiConversionsLimit: starter.aiConversionsLimit,
          maxBatchSize: starter.maxBatchSize,
          paypalSubscriptionId: null,
          subscriptionStatus: "cancelled",
        })
        .where(eq(userProfiles.userId, userId));
    } catch (updateErr) {
      console.error("DB update error:", updateErr);
      return NextResponse.json(
        { error: "Failed to update user profile" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled. Downgraded to Starter.",
    });
  } catch (error) {
    console.error("Cancel error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
