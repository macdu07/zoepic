// ─── Plan Definitions ────────────────────────────────────────────────
export const PLANS = {
  starter: {
    name: "Starter",
    price: 0,
    aiConversionsLimit: 50,
    maxBatchSize: 5,
  },
  pro: {
    name: "Pro",
    price: 6.99,
    aiConversionsLimit: 3000,
    maxBatchSize: 50,
  },
  agency: {
    name: "Agency",
    price: 23.99,
    aiConversionsLimit: 20000,
    maxBatchSize: 100,
  },
  unlimited: {
    name: "Unlimited",
    price: 0,
    aiConversionsLimit: 1000000,
    maxBatchSize: 1000,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export interface UserProfile {
  id: string;
  userId: string;
  plan: string;
  aiConversionsUsed: number;
  aiConversionsLimit: number;
  maxBatchSize: number;
  periodStart: Date;
  createdAt: Date;
  paypalSubscriptionId: string | null;
  subscriptionStatus: string | null;
}

export interface ConversionLog {
  id: string;
  userId: string;
  fileCount: number;
  aiUsed: boolean;
  createdAt: Date;
}

export interface UsageCheck {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
  maxBatchSize: number;
  plan: PlanKey;
}
