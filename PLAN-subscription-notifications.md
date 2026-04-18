# Plan: Notificaciones de Suscripción en Zoepic

## Contexto

**Sistema de email actual:** Nodemailer SMTP en `src/lib/auth.ts` — el `transporter` es privado y solo se usa dentro del plugin `emailOTP`. No existe una función reutilizable para enviar emails desde otros módulos.

**Estilo de plantillas existente:**
```html
<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
  <h2 style="color:#668f3d">...</h2>
  <div style="background:#f0f5e8;border-radius:8px;padding:24px;...">...</div>
  <p style="color:#666;font-size:13px">...</p>
</div>
```

**Rutas a modificar:**
- `src/app/api/paypal/activate/route.ts` — activa suscripción Pro/Agency
- `src/app/api/paypal/cancel/route.ts` — cancela suscripción → baja a Starter
- `src/app/api/user/route.ts` — DELETE elimina cuenta + cancela suscripción

**Datos disponibles en sesión:** `session.user.id`, `session.user.email` (better-auth incluye el user completo en sesión).

**Planes en `src/lib/usage-types.ts`:**
```ts
PLANS.starter  → aiConversionsLimit: 50,  maxBatchSize: 5
PLANS.pro      → aiConversionsLimit: 3000, maxBatchSize: 50,  price: 6.99
PLANS.agency   → aiConversionsLimit: 20000, maxBatchSize: 100, price: 23.99
```

---

## Fase 1 — Crear utilidad `sendEmail()` en `src/lib/email.ts`

**Objetivo:** Extraer el transporter SMTP a un módulo compartido para reutilizarlo desde cualquier route handler.

### Tarea 1.1 — Crear `src/lib/email.ts`

Crear el archivo con:
1. El mismo `transporter` que está en `auth.ts` (mismas env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`)
2. Una función `sendEmail(to: string, subject: string, html: string): Promise<void>`
3. Un helper `emailWrapper(content: string): string` que envuelve contenido en el div base con el estilo verde de la marca

```ts
// src/lib/email.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: Number(process.env.SMTP_PORT ?? 587) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export function emailWrapper(content: string): string {
  return `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">${content}</div>`;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "ZoePic <noreply@zoepic.online>",
    to,
    subject,
    html,
  });
}
```

### Tarea 1.2 — Actualizar `src/lib/auth.ts`

Reemplazar el `transporter` local y el `sendMail` inline por una llamada a `sendEmail` importada de `./email`. El plugin `emailOTP` continuará funcionando igual.

**Patrón a seguir (línea 68 actual):**
```ts
// antes:
await transporter.sendMail({ from: ..., to: email, subject: ..., html: ... });

// después:
import { sendEmail } from "./email";
await sendEmail(email, subjects[type] ?? "Tu código de verificación", bodies[type] ?? `<p>Tu código: <strong>${otp}</strong></p>`);
```

Eliminar el `transporter` local de `auth.ts` y el `import nodemailer`.

### Verificación Fase 1
- `grep -r "nodemailer" src/lib/auth.ts` → sin resultados (import eliminado)
- `grep -r "sendEmail" src/lib/auth.ts` → encontrado
- `cat src/lib/email.ts` → existe con `export async function sendEmail`
- El flujo de login/OTP sigue funcionando (enviar OTP de prueba)

---

## Fase 2 — Email de suscripción activada

**Archivo:** `src/app/api/paypal/activate/route.ts`

**Trigger:** Después del `db.update(userProfiles).set({...})` exitoso (línea 74 aprox), antes del `return NextResponse.json`.

### Tarea 2.1 — Agregar import

```ts
import { sendEmail, emailWrapper } from "@/lib/email";
```

### Tarea 2.2 — Enviar email después del DB update exitoso

El email debe incluir:
- Nombre del plan activado (`plan.name`)
- Límite de conversiones IA (`plan.aiConversionsLimit`)
- Tamaño máximo de lote (`plan.maxBatchSize`)
- Precio (`plan.price`) — opcional, referencial

Agregar justo antes del `return NextResponse.json({ success: true, ... })`:

```ts
// Fire-and-forget — no bloqueamos la respuesta si el email falla
sendEmail(
  session.user.email,
  `¡Tu plan ${plan.name} está activo en ZoePic!`,
  emailWrapper(`
    <h2 style="color:#668f3d">¡Bienvenido al plan ${plan.name}!</h2>
    <p>Tu suscripción en <strong>ZoePic</strong> ya está activa. Estos son tus nuevos límites:</p>
    <div style="background:#f0f5e8;border-radius:8px;padding:24px;margin:24px 0">
      <p style="margin:8px 0"><strong>Plan:</strong> ${plan.name}</p>
      <p style="margin:8px 0"><strong>Conversiones IA / mes:</strong> ${plan.aiConversionsLimit.toLocaleString()}</p>
      <p style="margin:8px 0"><strong>Tamaño máximo de lote:</strong> ${plan.maxBatchSize} imágenes</p>
      <p style="margin:8px 0"><strong>Conversiones WebP:</strong> Ilimitadas</p>
    </div>
    <p>Puedes gestionar tu suscripción en cualquier momento desde tu <a href="https://zoepic.online/dashboard/plan" style="color:#668f3d">panel de plan</a>.</p>
    <p style="color:#666;font-size:13px">Gracias por confiar en ZoePic.</p>
  `)
).catch(err => console.error("Error enviando email de activación:", err));
```

**Nota:** Se usa `.catch()` para no bloquear la respuesta HTTP si el SMTP falla. La suscripción ya está activa en DB.

### Verificación Fase 2
- Activar un plan Pro en staging/dev
- Verificar que llega email al correo del usuario de prueba
- Verificar que si el SMTP falla, la activación sigue retornando `200 OK`

---

## Fase 3 — Email de suscripción cancelada

**Archivo:** `src/app/api/paypal/cancel/route.ts`

**Trigger:** Después del `db.update(userProfiles).set({ plan: "starter", ... })` exitoso (línea 62 aprox).

**Datos disponibles:** `session.user.email`, `PLANS.starter`

### Tarea 3.1 — Agregar import

```ts
import { sendEmail, emailWrapper } from "@/lib/email";
```

### Tarea 3.2 — Enviar email de cancelación

El email debe incluir:
- Confirmación de cancelación
- Recordatorio de límites del plan Starter
- Opción de reactivar

Agregar antes del `return NextResponse.json({ success: true, ... })`:

```ts
const starter = PLANS.starter; // ya importado en el archivo
sendEmail(
  session.user.email,
  "Tu suscripción de ZoePic ha sido cancelada",
  emailWrapper(`
    <h2 style="color:#668f3d">Suscripción cancelada</h2>
    <p>Tu suscripción en <strong>ZoePic</strong> ha sido cancelada exitosamente. Has vuelto al plan Starter.</p>
    <div style="background:#f0f5e8;border-radius:8px;padding:24px;margin:24px 0">
      <p style="margin:8px 0"><strong>Plan actual:</strong> Starter (gratuito)</p>
      <p style="margin:8px 0"><strong>Conversiones IA / mes:</strong> ${starter.aiConversionsLimit}</p>
      <p style="margin:8px 0"><strong>Conversiones WebP / mes:</strong> ${starter.webpConversionsLimit}</p>
      <p style="margin:8px 0"><strong>Tamaño máximo de lote:</strong> ${starter.maxBatchSize} imágenes</p>
    </div>
    <p>Si cambias de opinión, puedes reactivar tu plan en cualquier momento desde tu <a href="https://zoepic.online/dashboard/plan" style="color:#668f3d">panel de plan</a>.</p>
    <p style="color:#666;font-size:13px">Gracias por haber usado ZoePic.</p>
  `)
).catch(err => console.error("Error enviando email de cancelación:", err));
```

### Verificación Fase 3
- Cancelar suscripción en dev
- Verificar email de confirmación recibido
- Verificar que la respuesta HTTP sigue siendo `200 OK` aunque el email falle

---

## Fase 4 — Email de cuenta eliminada

**Archivo:** `src/app/api/user/route.ts`

**Problema crítico:** El usuario se elimina de la DB al final del handler. El email debe enviarse **antes** de borrar al usuario, pero **después** de cancelar la suscripción en PayPal.

**Datos disponibles:** La sesión ya no será válida tras el borrado, pero `session.user.email` ya está en memoria antes de iniciar las operaciones de borrado.

### Tarea 4.1 — Agregar import

```ts
import { sendEmail, emailWrapper } from "@/lib/email";
```

### Tarea 4.2 — Capturar email antes de borrar

El `session.user.email` ya está disponible en el handler. Guardar en variable local:

```ts
const userEmail = session.user.email;
const userName = session.user.name ?? session.user.email;
```

### Tarea 4.3 — Enviar email antes de `db.delete(user)`

Agregar justo antes de `await db.delete(user).where(...)` (la última operación de borrado):

```ts
// Enviar email de despedida antes de borrar el usuario
await sendEmail(
  userEmail,
  "Tu cuenta de ZoePic ha sido eliminada",
  emailWrapper(`
    <h2 style="color:#668f3d">Cuenta eliminada</h2>
    <p>Hola ${userName}, tu cuenta en <strong>ZoePic</strong> ha sido eliminada permanentemente.</p>
    <div style="background:#f0f5e8;border-radius:8px;padding:24px;margin:24px 0">
      <p style="margin:0;color:#555">Todos tus datos, historial de conversiones y suscripción activa han sido eliminados de nuestros sistemas.</p>
    </div>
    <p>Si esto fue un error o tienes alguna duda, contáctanos en <a href="mailto:privacy@zoepic.online" style="color:#668f3d">privacy@zoepic.online</a>.</p>
    <p style="color:#666;font-size:13px">Gracias por haber usado ZoePic.</p>
  `)
).catch(err => console.error("Error enviando email de cuenta eliminada:", err));
```

**Nota:** Aquí sí usamos `.catch()` también — si el SMTP falla, la cuenta debe eliminarse de todas formas. El usuario ya inició el proceso.

### Verificación Fase 4
- Eliminar cuenta de prueba en dev
- Verificar que llega email de despedida
- Verificar que la cuenta queda eliminada aunque el SMTP falle

---

## Fase 5 — Webhook de PayPal: pago fallido

**Objetivo:** Manejar el evento `BILLING.SUBSCRIPTION.PAYMENT.FAILED` que PayPal envía cuando un cargo de renovación falla.

**Nuevo archivo:** `src/app/api/paypal/webhook/route.ts`

### Tarea 5.1 — Verificar evento PayPal con HMAC

PayPal envía en los headers: `paypal-transmission-id`, `paypal-transmission-time`, `paypal-cert-url`, `paypal-transmission-sig`, `paypal-auth-algo`.

La verificación se hace con `@paypal/paypal-server-sdk` o manualmente. Como el proyecto usa llamadas HTTP directas a la API de PayPal (ver `src/lib/paypal.ts`), implementar la verificación manualmente.

**Env var requerida:** `PAYPAL_WEBHOOK_ID` — se obtiene desde el Dashboard de PayPal al registrar el webhook.

**Endpoint de registro en PayPal Dashboard:**
`https://zoepic.online/api/paypal/webhook`

**Eventos a suscribirse:**
- `BILLING.SUBSCRIPTION.PAYMENT.FAILED`
- `BILLING.SUBSCRIPTION.CANCELLED` (opcional — para sincronizar cancelaciones desde PayPal)

### Tarea 5.2 — Estructura del handler

```ts
// src/app/api/paypal/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { userProfiles, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail, emailWrapper } from "@/lib/email";

export async function POST(request: NextRequest) {
  const body = await request.text(); // texto crudo para verificación de firma
  const event = JSON.parse(body);

  // Verificar que el evento viene de PayPal (ver Tarea 5.3)
  const isValid = await verifyPayPalWebhook(request.headers, body);
  if (!isValid) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  const eventType = event.event_type as string;

  if (eventType === "BILLING.SUBSCRIPTION.PAYMENT.FAILED") {
    const subscriptionId = event.resource?.id as string;
    if (!subscriptionId) return NextResponse.json({ ok: true });

    // Buscar usuario por subscriptionId
    const profiles = await db
      .select({ userId: userProfiles.userId })
      .from(userProfiles)
      .where(eq(userProfiles.paypalSubscriptionId, subscriptionId))
      .limit(1);

    if (profiles.length === 0) return NextResponse.json({ ok: true });

    const { userId } = profiles[0];

    // Obtener email del usuario
    const users = await db
      .select({ email: user.email, name: user.name })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (users.length === 0) return NextResponse.json({ ok: true });

    const { email, name } = users[0];

    await sendEmail(
      email,
      "Problema con el pago de tu suscripción ZoePic",
      emailWrapper(`
        <h2 style="color:#668f3d">No pudimos procesar tu pago</h2>
        <p>Hola ${name ?? email}, hubo un problema al procesar el pago de tu suscripción en <strong>ZoePic</strong>.</p>
        <div style="background:#f0f5e8;border-radius:8px;padding:24px;margin:24px 0">
          <p style="margin:0;color:#555">PayPal reintentará el cobro automáticamente. Para evitar interrupciones en tu servicio, verifica que tu método de pago esté actualizado.</p>
        </div>
        <p>
          <a href="https://www.paypal.com/myaccount/autopay" style="background:#668f3d;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">
            Actualizar método de pago
          </a>
        </p>
        <p style="color:#666;font-size:13px">Si necesitas ayuda, contáctanos en <a href="mailto:privacy@zoepic.online" style="color:#668f3d">privacy@zoepic.online</a>.</p>
      `)
    ).catch(err => console.error("Error enviando email de pago fallido:", err));
  }

  return NextResponse.json({ ok: true });
}
```

### Tarea 5.3 — Función `verifyPayPalWebhook`

Leer `src/lib/paypal.ts` para ver el patrón de llamadas a la API de PayPal. Implementar verificación usando el endpoint de PayPal:

```
POST https://api-m.paypal.com/v1/notifications/verify-webhook-signature
Authorization: Bearer <access_token>
Body: {
  "transmission_id": <header>,
  "transmission_time": <header>,
  "cert_url": <header>,
  "auth_algo": <header>,
  "transmission_sig": <header>,
  "webhook_id": process.env.PAYPAL_WEBHOOK_ID,
  "webhook_event": <parsed event body>
}
```

Respuesta exitosa: `{ "verification_status": "SUCCESS" }`

Reutilizar el helper `getPayPalAccessToken()` que ya existe en `src/lib/paypal.ts`.

### Tarea 5.4 — Registrar webhook en PayPal

En el PayPal Developer Dashboard:
1. Ir a Apps & Credentials → seleccionar la app
2. Webhooks → Add Webhook
3. URL: `https://zoepic.online/api/paypal/webhook`
4. Eventos: `BILLING.SUBSCRIPTION.PAYMENT.FAILED`
5. Copiar el `Webhook ID` → agregar a `.env` y `.env.local` como `PAYPAL_WEBHOOK_ID`

### Verificación Fase 5
- `grep "PAYPAL_WEBHOOK_ID" src/app/api/paypal/webhook/route.ts` → encontrado
- Simular evento desde PayPal Developer Dashboard → "Simulate webhook"
- Verificar que llega el email de pago fallido
- Verificar que una firma inválida retorna `401`

---

## Resumen de Archivos

| Archivo | Acción |
|---------|--------|
| `src/lib/email.ts` | **CREAR** — transporter + `sendEmail()` + `emailWrapper()` |
| `src/lib/auth.ts` | **EDITAR** — usar `sendEmail` importado, eliminar transporter local |
| `src/app/api/paypal/activate/route.ts` | **EDITAR** — agregar email de activación |
| `src/app/api/paypal/cancel/route.ts` | **EDITAR** — agregar email de cancelación |
| `src/app/api/user/route.ts` | **EDITAR** — agregar email de cuenta eliminada |
| `src/app/api/paypal/webhook/route.ts` | **CREAR** — handler de webhooks PayPal |

## Variables de Entorno Requeridas (nuevas)

```env
PAYPAL_WEBHOOK_ID=WH-XXXX   # Solo para Fase 5
```

Las demás (`SMTP_*`) ya existen.

## Orden de Ejecución Recomendado

1. Fase 1 primero — todas las demás la requieren
2. Fases 2, 3, 4 — independientes entre sí, se pueden hacer en cualquier orden
3. Fase 5 — última, requiere acceso al Dashboard de PayPal para registrar el webhook
