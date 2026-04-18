import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Obtiene la sesión del usuario actual desde el servidor.
 * Usar en route handlers para evitar confiar en datos del cliente.
 */
export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * Verifica que haya una sesión activa. Si no la hay, retorna un NextResponse 401.
 * Usar con early return en route handlers.
 *
 * @example
 * const { session, errorResponse } = await requireSession();
 * if (errorResponse) return errorResponse;
 * const userId = session.user.id;
 */
export async function requireSession(): Promise<
  | { session: Awaited<ReturnType<typeof getServerSession>> & {}; errorResponse: null }
  | { session: null; errorResponse: NextResponse }
> {
  const session = await getServerSession();

  if (!session) {
    return {
      session: null,
      errorResponse: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  return { session, errorResponse: null };
}
