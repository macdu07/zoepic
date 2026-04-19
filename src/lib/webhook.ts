/**
 * Utility functions for sending webhooks to n8n.
 */

export type WebhookEvent = 
  | "user.created"
  | "conversion.completed"
  | "subscription.payment_failed"
  | "custom";

export interface WebhookPayload {
  event: WebhookEvent;
  data: Record<string, unknown>;
  timestamp: string;
}

/**
 * Sends a webhook payload to n8n if the N8N_WEBHOOK_URL environment variable is set.
 * Designed to not block the main execution thread by swallowing errors.
 */
export async function sendWebhookToN8n(event: WebhookEvent, data: Record<string, unknown>) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("[Webhook] N8N_WEBHOOK_URL not configured. Skipping webhook dispatch.");
    return;
  }

  const payload: WebhookPayload = {
    event,
    data,
    timestamp: new Date().toISOString()
  };

  try {
    // Send fire-and-forget webhook
    fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }).catch((err) => {
      // In Next.js, floating promises might be canceled or logged, but we try not to crash
      console.error("[Webhook] Failed to send webhook to n8n:", err);
    });
  } catch (error) {
    console.error("[Webhook] Unexpected error sending webhook:", error);
  }
}
