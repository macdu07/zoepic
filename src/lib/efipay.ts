// ─── EfyPay Configuration ─────────────────────────────────────────────
// Works with the EfyPay REST API v1 (suscriptciones recurrentes).
// Docs: https://efipay.co/docs/1.0/subscription

import { createHmac, timingSafeEqual } from "crypto";

const EFIPAY_BASE_URL = process.env.EFIPAY_BASE_URL ?? "https://sag.efipay.co";

// ─── Credentials helpers ──────────────────────────────────────────────
function getApiToken(): string {
  const token = process.env.EFIPAY_API_TOKEN;
  if (!token) {
    throw new Error("EfyPay API token no configurado (EFIPAY_API_TOKEN)");
  }
  return token;
}

function getOffice(): number {
  const office = Number(process.env.EFIPAY_OFFICE);
  if (!office) {
    throw new Error("EfyPay sucursal no configurada (EFIPAY_OFFICE)");
  }
  return office;
}

// ─── Generic request helper ───────────────────────────────────────────
async function efipayFetch<T = Record<string, unknown>>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const res = await fetch(`${EFIPAY_BASE_URL}/api/v1${path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${getApiToken()}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(extractEfipayError(data, res.status, text));
  }

  return data as T;
}

function extractEfipayError(
  data: unknown,
  status: number,
  raw: string,
): string {
  const obj = data as Record<string, unknown> | null;
  if (obj) {
    const message = obj.message ?? obj.error ?? obj.detail;
    if (typeof message === "string" && message) return message;

    const errors = obj.errors;
    if (errors && typeof errors === "object") {
      const first = Object.values(errors as Record<string, unknown>).flat();
      if (Array.isArray(first) && first.length > 0) {
        return String(first[0]);
      }
    }
  }

  // Si no es JSON, puede ser una página de error HTML. Extraer texto legible.
  const text = stripHtml(raw);
  if (text) {
    return `EfyPay error ${status}: ${text.slice(0, 400)}`;
  }
  return `EfyPay error ${status}`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Webhook signature verification ───────────────────────────────────
export function verifyEfipayWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  const webhookToken = process.env.EFIPAY_WEBHOOK_TOKEN;
  if (!webhookToken) {
    // Sin token configurado no se puede verificar; se acepta y se loguea.
    console.warn("[EfyPay] EFIPAY_WEBHOOK_TOKEN no configurado. Se omite la verificación de firma.");
    return true;
  }
  if (!signature) return false;

  const expected = createHmac("sha256", webhookToken)
    .update(rawBody, "utf8")
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;

  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// ─── Plan mapping ─────────────────────────────────────────────────────
export type BillingPeriod = "monthly" | "annual";

export function getEfipayPlanId(
  planKey: string,
  billingPeriod: BillingPeriod = "monthly",
): string {
  if (planKey === "pro") {
    return billingPeriod === "annual"
      ? (process.env.EFIPAY_PLAN_ID_PRO_ANNUAL ?? "")
      : (process.env.EFIPAY_PLAN_ID_PRO ?? "");
  }
  if (planKey === "agency") {
    return billingPeriod === "annual"
      ? (process.env.EFIPAY_PLAN_ID_AGENCY_ANNUAL ?? "")
      : (process.env.EFIPAY_PLAN_ID_AGENCY ?? "");
  }
  return "";
}

// ─── Groups ───────────────────────────────────────────────────────────
export interface EfipayGroup {
  id: string;
  name: string;
}

export async function getEfipayGroups(): Promise<EfipayGroup[]> {
  const data = await efipayFetch<unknown>("/subscriptions/group");
  if (Array.isArray(data)) {
    return data as EfipayGroup[];
  }
  // Laravel paginator puede devolver { data: [...] }
  const obj = data as { data?: EfipayGroup[] };
  return obj.data ?? [];
}

export async function createEfipayGroup(name: string): Promise<string> {
  const data = await efipayFetch<{ id: string }>("/subscriptions/group", {
    method: "POST",
    body: { name, office: getOffice() },
  });
  return data.id;
}

// ─── Plans ────────────────────────────────────────────────────────────
export interface CreateEfipayPlanInput {
  name: string;
  description: string;
  price: number;
  currencyType?: "COP" | "USD" | "EUR";
  subscriptionGroupId?: string;
  invoiceInterval?: "day" | "week" | "month" | "year";
}

export async function createEfipayPlan(
  input: CreateEfipayPlanInput,
): Promise<string> {
  const data = await efipayFetch<{ id: string }>("/subscriptions/plan", {
    method: "POST",
    body: {
      name: input.name,
      description: input.description,
      price: input.price,
      currency_type: input.currencyType ?? "USD",
      invoice_period: 1,
      invoice_interval: input.invoiceInterval ?? "month",
      ...(input.subscriptionGroupId
        ? { subscription_group_id: input.subscriptionGroupId }
        : {}),
      office: getOffice(),
    },
  });
  return data.id;
}

// ─── Subscribers ──────────────────────────────────────────────────────
export interface EfipaySubscriberInput {
  identificationType: string;
  idNumber: string;
  name: string;
  lastName: string;
  email: string;
  phoneCode: number;
  cellphoneNumber: string;
  billingAddress: string;
  billingCity: string;
  billingCountry: string;
}

export async function createEfipaySubscriber(
  input: EfipaySubscriberInput,
): Promise<{ id: string }> {
  return efipayFetch<{ id: string }>("/subscriptions/subscriber/", {
    method: "POST",
    body: {
      identification_type: input.identificationType,
      id_number: input.idNumber,
      name: input.name,
      last_name: input.lastName,
      email: input.email,
      phone_code: input.phoneCode,
      cellphone_number: input.cellphoneNumber,
      billing_address: input.billingAddress,
      billing_city: input.billingCity,
      billing_country: input.billingCountry,
      office: getOffice(),
    },
  });
}

export async function getEfipaySubscriberByEmail(
  email: string,
): Promise<{ id: string } | null> {
  try {
    return await efipayFetch<{ id: string }>(
      `/subscriptions/subscriber/${encodeURIComponent(email)}`,
    );
  } catch {
    return null;
  }
}

// ─── Subscriptions ────────────────────────────────────────────────────
export interface EfipayCardInformation {
  holder: string;
  number: string;
  datetime: string; // yyyy-mm
  cvv: number;
}

export interface CreateEfipaySubscriptionInput {
  planId: string;
  subscriberId: string;
  cardInformation: EfipayCardInformation;
  description?: string;
  webhookUrl?: string;
}

export async function createEfipaySubscription(
  input: CreateEfipaySubscriptionInput,
): Promise<Record<string, unknown>> {
  return efipayFetch<Record<string, unknown>>("/subscriptions/subscription", {
    method: "POST",
    body: {
      plan_id: input.planId,
      subscriber_id: input.subscriberId,
      card_information: input.cardInformation,
      ...(input.description ? { description: input.description } : {}),
      ...(input.webhookUrl ? { webhook_url: input.webhookUrl } : {}),
      office: getOffice(),
    },
  });
}

export async function getEfipaySubscription(
  subscriptionId: string,
): Promise<Record<string, unknown>> {
  return efipayFetch<Record<string, unknown>>(
    `/subscriptions/subscription/${subscriptionId}`,
  );
}

export async function cancelEfipaySubscription(
  subscriptionId: string,
): Promise<void> {
  await efipayFetch(`/subscriptions/subscription/cancel/${subscriptionId}`, {
    method: "PUT",
  });
}
