# ZoePic

Aplicación web desarrollada con **Next.js (App Router)** para convertir imágenes (JPG, JPEG, PNG) al formato WebP con asistencia de **Inteligencia Artificial**. Utiliza **Neon Serverless Postgres y Better Auth** para autenticación y base de datos, **Genkit con Gemini de Google AI** para generar nombres de archivo optimizados para SEO, y **EfiPay** para la gestión de planes de suscripción.

---

## Características Principales

- **Conversión a WebP:** Transforma imágenes JPG, JPEG y PNG al formato WebP con calidad ajustable (5% – 100%, predeterminado 90%).
- **Nombre sugerido con IA:** Genkit + Gemini generan automáticamente un nombre de archivo descriptivo en español, en minúsculas con guiones, optimizado para SEO.
- **Prefijo personalizable:** Opción para añadir un prefijo al nombre generado por la IA.
- **Comparador visual:** Visor interactivo lado a lado para comparar la imagen original con la convertida.
- **Estadísticas detalladas:** Tamaño original, tamaño convertido y porcentaje de reducción de peso.
- **Autenticación Base:** Registro, inicio de sesión y gestión con `better-auth` y validaciones custom.
- **Planes de suscripción:** Integración con EfiPay para planes Pro y Agency con cobro recurrente mensual o anual.
- **Dashboard de usuario:** Panel con información de cuenta, historial de uso y gestión de suscripción.
- **Descarga fácil:** Botón para descargar la imagen WebP con el nombre sugerido.
- **Interfaz moderna:** Diseño con ShadCN UI, Tailwind CSS y tipografía Geist.

---

## Stack Tecnológico

| Categoría      | Tecnología                                           |
| -------------- | ---------------------------------------------------- |
| Framework      | Next.js 15 (App Router, Turbopack)                   |
| Lenguaje       | TypeScript (strict)                                  |
| UI             | React 18, ShadCN UI, Tailwind CSS 3.4                |
| IA             | Genkit + Gemini (Google AI)                          |
| Backend & Auth | Neon Postgres, Drizzle ORM, Better Auth              |
| Pagos          | EfiPay Subscriptions API                              |
| Gráficos       | Recharts                                             |
| Iconos         | Lucide React                                         |
| Tipografía     | Geist                                                |
| Formularios    | React Hook Form + Zod                                |

---

## Estructura del Proyecto

```
src/
├── ai/                     # Flujos de IA con Genkit
├── app/
│   ├── api/
│   │   ├── auth/           # Rutas de autenticación
│   │   └── efipay/         # Suscripciones, cancelación y webhooks
│   ├── dashboard/
│   │   ├── account/        # Gestión de cuenta
│   │   └── usage/          # Historial de uso
│   ├── login/              # Página de inicio de sesión
│   ├── signup/             # Página de registro
│   ├── page.tsx            # Página principal (conversión)
│   └── layout.tsx          # Layout raíz
├── components/
│   ├── core/               # Componentes de funcionalidad
│   └── ui/                 # Componentes ShadCN UI
├── hooks/                  # Custom hooks
├── lib/                    # Utilidades y helpers
└── middleware.ts           # Middleware de autenticación
```

---

## Desarrollo Local

### Requisitos Previos

- Node.js 18+
- pnpm 11.13.1 (mediante Corepack)

### Instalación

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/macdu07/zoepic.git
   cd zoepic
   ```

2. **Instalar dependencias:**

   ```bash
   corepack enable
   pnpm install --frozen-lockfile
   ```

3. **Configurar variables de entorno:**

   Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

   ```env
   GEMINI_API_KEY=tu-api-key-de-google-ai
   DATABASE_URL=postgresql://neondb_owner:.....
   BETTER_AUTH_SECRET=tu-auth-secret
   BETTER_AUTH_URL=http://localhost:9002
   EFIPAY_API_TOKEN=tu-token-de-efipay
   EFIPAY_OFFICE=tu-id-de-sucursal
   EFIPAY_WEBHOOK_TOKEN=tu-token-de-webhook
   EFIPAY_PLAN_ID_PRO=tu-plan-pro-mensual
   EFIPAY_PLAN_ID_PRO_ANNUAL=tu-plan-pro-anual
   EFIPAY_PLAN_ID_AGENCY=tu-plan-agency-mensual
   EFIPAY_PLAN_ID_AGENCY_ANNUAL=tu-plan-agency-anual
   ```

   > Consulta `.env.example` como referencia.

   Antes de desplegar esta versión, aplica `drizzle/0001_efipay_subscription.sql`
   usando una conexión directa —no pooled— de Neon.

4. **Ejecutar el servidor de desarrollo:**

   ```bash
   pnpm dev
   ```

5. Abre tu navegador en `http://localhost:9002`.

### Comandos Disponibles

| Comando                | Descripción                                     |
| ---------------------- | ----------------------------------------------- |
| `pnpm dev`          | Servidor de desarrollo (puerto 9002, Turbopack) |
| `pnpm build`        | Build de producción                             |
| `pnpm start`        | Servidor de producción                          |
| `pnpm lint`         | Ejecutar ESLint                                 |
| `pnpm typecheck`    | Verificación de tipos TypeScript                |
| `pnpm genkit:dev`   | Servidor de desarrollo de Genkit                |
| `pnpm genkit:watch` | Watch mode para flujos de IA                    |

---

## Uso de la Aplicación

1. **Registro / Inicio de sesión:** Crea una cuenta o inicia sesión desde `/signup` o `/login`.
2. **Cargar imagen:** En la página principal, arrastra o selecciona una imagen (JPG, JPEG, PNG).
3. **Configurar conversión:** Ajusta el prefijo y la calidad WebP según tus necesidades.
4. **Convertir:** Haz clic en "Convert and Analyze". La IA generará un nombre optimizado para SEO.
5. **Revisar resultados:** Compara las imágenes y revisa las estadísticas de reducción de tamaño.
6. **Descargar:** Descarga la imagen WebP con el nombre sugerido.
7. **Dashboard:** Accede a `/dashboard` para gestionar tu cuenta, ver historial de uso y administrar tu suscripción.

---

## Licencia

Proyecto privado. Todos los derechos reservados.
