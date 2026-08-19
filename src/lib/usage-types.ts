// ─── Plan Definitions ────────────────────────────────────────────────
export const PLANS = {
  starter: {
    name: "Starter",
    price: 0,
    aiConversionsLimit: 0,
    webpConversionsLimit: 100,
    webpConversionsPeriod: "daily",
    maxBatchSize: 5,
  },
  pro: {
    name: "Pro",
    price: 6.99,
    aiConversionsLimit: 3000,
    webpConversionsLimit: null,
    webpConversionsPeriod: null,
    maxBatchSize: 50,
  },
  agency: {
    name: "Agency",
    price: 23.99,
    aiConversionsLimit: 20000,
    webpConversionsLimit: null,
    webpConversionsPeriod: null,
    maxBatchSize: 100,
  },
  unlimited: {
    name: "Unlimited",
    price: 0,
    aiConversionsLimit: 1000000,
    webpConversionsLimit: null,
    webpConversionsPeriod: null,
    maxBatchSize: 1000,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

// ─── AI access helpers ────────────────────────────────────────────────
// AI (renombrado con IA) está disponible solo en planes de pago.
export function planHasAiAccess(plan: string): boolean {
  const planConfig = PLANS[plan as PlanKey];
  return Boolean(planConfig && planConfig.aiConversionsLimit > 0);
}

export interface UserProfile {
  id: string;
  userId: string;
  plan: string;
  aiConversionsUsed: number;
  aiConversionsLimit: number;
  maxBatchSize: number;
  periodStart: Date;
  createdAt: Date;
  efipaySubscriptionId: string | null;
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
