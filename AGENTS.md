---
description: Instructions building apps with MCP
globs: *
alwaysApply: true
---

# Zoe Convert - Agent Guidelines

## Project Overview

Zoe Convert es una aplicación web desarrollada con Next.js (App Router) para convertir imágenes (JPG, JPEG, PNG) al formato WebP con IA. Usa InsForge como BaaS para autenticación y base de datos.

---

## Commands

### Development
```bash
npm run dev              # Start dev server on port 9002
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript type checking
```

### Genkit (AI Flows)
```bash
npm run genkit:dev       # Start Genkit dev server
npm run genkit:watch     # Watch mode for AI flows
```

---

## Code Style Guidelines

### General Rules
- Use TypeScript with strict mode enabled
- Use functional components with hooks (no class components)
- Use `"use client"` directive for client-side code
- Prefer `async/await` over `.then()` chains
- Use early returns to avoid nested conditionals
- Keep functions small and focused (single responsibility)

### Imports
```typescript
// React hooks first
import { useState, useCallback, useEffect } from "react";

// External libraries
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";
import { useUser } from "@insforge/nextjs";

// Internal modules - use @/ alias
import { generateImageName, type GenerateImageNameInput } from "@/ai/flows/generate-image-name";
import { getImageMetadata, convertToWebP, type ImageMetadata } from "@/lib/imageUtils";

// Local components (relative import)
import { ImageUploader } from "./ImageUploader";
```

- Group imports: React hooks → external libs → @/ modules → local components
- Use type-only imports when appropriate: `import { type Foo } from ...`
- Use barrel exports from `index.ts` files when available

### Naming Conventions
- **Components**: PascalCase (`ConversionPage`, `ImageUploader`)
- **Hooks**: camelCase with `use` prefix (`useToast`, `useMobile`)
- **Functions**: camelCase (`getImageMetadata`, `convertToWebP`)
- **Interfaces/Types**: PascalCase (`ImageMetadata`, `WebPConversionResult`)
- **Files**: kebab-case for utilities (`image-utils.ts`), PascalCase for components
- **Constants**: SCREAMING_SNAKE_CASE for config values

### Types
- Always define return types for functions, especially async ones
- Use interfaces for object shapes, types for unions/intersections
- Avoid `any`, use `unknown` when type is truly unknown
- Export types that are used across modules

```typescript
// Good
export interface ImageMetadata {
  dataUrl: string;
  sizeBytes: number;
  type: string;
  name: string;
  width: number;
  height: number;
}

export async function getImageMetadata(file: File): Promise<ImageMetadata> {
  // ...
}
```

### Error Handling
- Use try/catch with specific error messages
- Provide fallback values when errors are non-critical
- Log errors appropriately (console.error for unexpected errors)
- Show user-friendly error messages via toast/UI

```typescript
// Good pattern
try {
  const result = await riskyOperation();
  return result;
} catch (e) {
  const errorMsg = e instanceof Error ? e.message : "Error desconocido";
  console.error("Operation failed:", e);
  return fallbackValue;
}
```

### UI Components (ShadCN/Tailwind)
- Use existing UI components from `@/components/ui/`
- Follow component prop patterns (variant, size, etc.)
- Use Tailwind utility classes for styling
- Use semantic HTML elements

```typescript
<Card className="shadow-lg bg-card text-card-foreground">
  <CardHeader>
    <CardTitle className="text-xl font-semibold">
      Title
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-6">
    {children}
  </CardContent>
</Card>
```

### State Management
- Use `useState` for local component state
- Use `useCallback` for event handlers passed to children
- Use `useEffect` for side effects (data fetching, subscriptions)
- Use InsForge SDK for server state (user, database)

### API Routes (Next.js App Router)
- Use Route Handlers (`route.ts`) with named exports: `GET`, `POST`, etc.
- Return `NextResponse` objects
- Handle errors and return appropriate status codes
- Validate request bodies with Zod

---

## InsForge SDK Guidelines

### Critical: Always Fetch Latest Docs
Before writing InsForge integration code, use the `fetch-docs` or `fetch-sdk-docs` MCP tool to get up-to-date implementation patterns.

### SDK Usage
- Create client in `@/lib/insforge.ts`:
```typescript
import { createClient } from '@insforge/sdk';

export const client = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
});
```

- SDK returns `{data, error}` structure for all operations
- Database inserts require array format: `[{...}]`
- Use `@insforge/nextjs` for Next.js authentication hooks

### Important Notes
- Use Tailwind CSS 3.4 (do NOT upgrade to v4)
- Use `@insforge/nextjs` for authentication (not custom JWT implementation)
- Store sensitive values in `.env`, access via `process.env`

---

## File Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Protected dashboard pages
│   ├── login/            # Login page
│   ├── page.tsx          # Home/conversion page
│   └── layout.tsx        # Root layout
├── components/
│   ├── core/             # Feature components
│   └── ui/               # ShadCN UI components
├── lib/                  # Utilities and helpers
├── hooks/                # Custom React hooks
└── ai/                   # Genkit AI flows
```

---

## Common Patterns

### Client Component with Form
```typescript
"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Component() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      // async logic
    } catch (e) {
      toast({ title: "Error", description: "...", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []); // deps

  return <Button onClick={handleSubmit} disabled={loading}>Submit</Button>;
}
```

### Loading Data with useEffect
```typescript
useEffect(() => {
  if (!isReady) return;
  
  fetchData().then((data) => {
    setData(data);
  });
}, [isReady]); // minimal deps
```
