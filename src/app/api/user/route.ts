import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { user, session as sessionTable, account, userProfiles, conversionLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth-server";
import { cancelPayPalSubscription } from "@/lib/paypal";

export async function DELETE() {
  try {
    const { session, errorResponse } = await requireSession();
    if (errorResponse) return errorResponse;
    const userId = session.user.id;

    // 1. Obtener perfil
    const profileRecords = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    // 2. Si tiene suscripción activa en PayPal, cancelarla primero
    if (profileRecords && profileRecords.length > 0) {
      const profile = profileRecords[0];
      if (profile.paypalSubscriptionId && profile.subscriptionStatus === "active") {
        try {
          await cancelPayPalSubscription(
            profile.paypalSubscriptionId,
            "Usuario eliminó su cuenta de forma definitiva"
          );
        } catch (paypalError) {
          console.error("No se pudo cancelar la suscripción de PayPal al borrar cuenta:", paypalError);
          // Seguiremos con el borrado de la cuenta aunque falle o la subscripción no exista,
          // pero al menos lo intentamos.
        }
      }
    }

    // 3. Borrar registros ordenadamente para evitar fallos de Foreign Key
    // si no hubiese CASCADE en Neon/Drizzle.
    await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
    await db.delete(account).where(eq(account.userId, userId));
    await db.delete(conversionLogs).where(eq(conversionLogs.userId, userId));
    await db.delete(userProfiles).where(eq(userProfiles.userId, userId));
    
    // Y finalmente el usuario
    await db.delete(user).where(eq(user.id, userId));

    return NextResponse.json({ success: true, message: "Cuenta eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar cuenta:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al eliminar la cuenta" },
      { status: 500 }
    );
  }
}
