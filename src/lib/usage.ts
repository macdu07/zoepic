"use server";

import { db } from "@/db/db";
import { userProfiles, conversionLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

import { PLANS, type UserProfile, type PlanKey, type ConversionLog, type UsageCheck } from "./usage-types";

// ─── Get or create user profile ──────────────────────────────────────
export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  // Try to fetch existing profile
  const existingProfiles = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);

  // Return existing profile if found
  if (existingProfiles.length > 0) {
    return existingProfiles[0] as unknown as UserProfile;
  }

  // Auto-create a starter profile if not found
  const plan = PLANS.starter;
  try {
    const newProfile = await db.insert(userProfiles).values({
      userId: userId,
      plan: "starter",
      aiConversionsUsed: 0,
      aiConversionsLimit: plan.aiConversionsLimit,
      maxBatchSize: plan.maxBatchSize,
      periodStart: new Date(),
    }).returning();

    if (newProfile.length > 0) {
      return newProfile[0] as unknown as UserProfile;
    }
  } catch (insertErr) {
    console.error("Error creating user profile:", insertErr);
    // Likely a unique constraint violation (race condition) — fetch again
    const retryData = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
    
    if (retryData.length > 0) {
      return retryData[0] as unknown as UserProfile;
    }
  }

  return null;
}

// ─── Check usage limits ──────────────────────────────────────────────


export async function checkUsageLimit(
  userId: string,
  fileCount: number,
  useAi: boolean,
): Promise<UsageCheck> {
  const profile = await getUserProfile(userId);

  if (!profile) {
    return {
      allowed: false,
      remaining: 0,
      limit: PLANS.starter.aiConversionsLimit,
      used: 0,
      maxBatchSize: PLANS.starter.maxBatchSize,
      plan: "starter",
    };
  }

  // Check if the period needs to be reset (monthly)
  const periodStart = new Date(profile.periodStart);
  const now = new Date();
  const daysSincePeriodStart = Math.floor(
    (now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysSincePeriodStart >= 30 && profile.plan !== "unlimited") {
    // Reset the period
    await db.update(userProfiles).set({
      aiConversionsUsed: 0,
      periodStart: now,
    }).where(eq(userProfiles.userId, userId));

    profile.aiConversionsUsed = 0;
    profile.periodStart = now;
  }

  // If not using AI, always allow (WebP conversion is free)
  if (!useAi) {
    return {
      allowed: true,
      remaining: profile.aiConversionsLimit - profile.aiConversionsUsed,
      limit: profile.aiConversionsLimit,
      used: profile.aiConversionsUsed,
      maxBatchSize: profile.maxBatchSize,
      plan: profile.plan as PlanKey,
    };
  }

  const remaining = profile.aiConversionsLimit - profile.aiConversionsUsed;
  const allowed = remaining >= fileCount;

  return {
    allowed,
    remaining,
    limit: profile.aiConversionsLimit,
    used: profile.aiConversionsUsed,
    maxBatchSize: profile.maxBatchSize,
    plan: profile.plan as PlanKey,
  };
}

// ─── Log a conversion ────────────────────────────────────────────────
export async function logConversion(
  userId: string,
  fileCount: number,
  aiUsed: boolean,
): Promise<void> {
  // Insert the conversion log
  await db.insert(conversionLogs).values({
    userId,
    fileCount,
    aiUsed,
  });

  // If AI was used, increment the counter
  if (aiUsed) {
    const profile = await getUserProfile(userId);
    if (profile) {
      await db.update(userProfiles).set({
        aiConversionsUsed: profile.aiConversionsUsed + fileCount,
      }).where(eq(userProfiles.userId, userId));
    }
  }
}

// ─── Get conversion history ──────────────────────────────────────────
export async function getConversionHistory(
  userId: string,
  limit = 20,
): Promise<ConversionLog[]> {
   try {
    const logs = await db.select()
      .from(conversionLogs)
      .where(eq(conversionLogs.userId, userId))
      .orderBy(desc(conversionLogs.createdAt))
      .limit(limit);
      
    return logs as unknown as ConversionLog[];
   } catch (error) {
     console.error("Error fetching conversion history:", error);
     return [];
   }
}
