import { NextRequest, NextResponse } from "next/server";
import { cancelPayPalSubscription } from "@/lib/paypal";
import { insforge } from "@/lib/insforge";
import { PLANS } from "@/lib/usage";

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
    const { data: profiles, error: fetchErr } = await insforge.database
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .limit(1);

    if (fetchErr || !profiles || profiles.length === 0) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 },
      );
    }

    const profile = profiles[0];

    if (!profile.paypal_subscription_id) {
      return NextResponse.json(
        { error: "No active subscription to cancel" },
        { status: 400 },
      );
    }

    // Cancel with PayPal
    await cancelPayPalSubscription(
      profile.paypal_subscription_id,
      "Usuario solicitó cancelación",
    );

    // Downgrade to Starter
    const starter = PLANS.starter;
    const { error: updateErr } = await insforge.database
      .from("user_profiles")
      .update({
        plan: "starter",
        ai_conversions_limit: starter.aiConversionsLimit,
        max_batch_size: starter.maxBatchSize,
        paypal_subscription_id: null,
        subscription_status: "cancelled",
      })
      .eq("user_id", userId);

    if (updateErr) {
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
