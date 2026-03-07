// ─── PayPal Configuration ─────────────────────────────────────────────
// Works with PayPal REST API v1/v2 (sandbox + production)

const PAYPAL_BASE_URL = "https://api-m.paypal.com";

/**
 * Get an OAuth2 access token from PayPal using client credentials.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Mapping from our plan keys to PayPal plan details.
 * Plan IDs are read from env vars (set after running /api/paypal/setup-plans).
 */
export const PAYPAL_PLANS: Record<
  string,
  { name: string; price: string; description: string }
> = {
  pro: {
    name: "ZoePic Pro",
    price: "6.99",
    description:
      "3,000 renombrados con IA/mes, hasta 50 imágenes por lote, soporte prioritario",
  },
  agency: {
    name: "ZoePic Agency",
    price: "23.99",
    description:
      "20,000 renombrados con IA/mes, hasta 100 imágenes por lote, soporte prioritario",
  },
};

export function getPayPalPlanId(planKey: string): string {
  if (planKey === "pro") {
    return process.env.PAYPAL_PLAN_ID_PRO || "";
  }
  if (planKey === "agency") {
    return process.env.PAYPAL_PLAN_ID_AGENCY || "";
  }
  return "";
}

/**
 * Create a PayPal product and billing plan. Run once to set up plans.
 */
export async function createPayPalProduct(
  name: string,
  description: string,
): Promise<string> {
  const token = await getPayPalAccessToken();

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/catalogs/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      description,
      type: "SERVICE",
      category: "SOFTWARE",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create product: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.id;
}

export async function createPayPalBillingPlan(
  productId: string,
  name: string,
  price: string,
  description: string,
): Promise<string> {
  const token = await getPayPalAccessToken();

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/billing/plans`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_id: productId,
      name,
      description,
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: {
            interval_unit: "MONTH",
            interval_count: 1,
          },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0, // Infinite
          pricing_scheme: {
            fixed_price: {
              value: price,
              currency_code: "USD",
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        payment_failure_threshold: 3,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create plan: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.id;
}

/**
 * Cancel a PayPal subscription.
 */
export async function cancelPayPalSubscription(
  subscriptionId: string,
  reason: string = "User requested cancellation",
): Promise<void> {
  const token = await getPayPalAccessToken();

  const res = await fetch(
    `${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to cancel subscription: ${res.status} ${text}`);
  }
}

/**
 * Get subscription details from PayPal.
 */
export async function getPayPalSubscription(
  subscriptionId: string,
): Promise<Record<string, unknown>> {
  const token = await getPayPalAccessToken();

  const res = await fetch(
    `${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get subscription: ${res.status} ${text}`);
  }

  return res.json();
}
