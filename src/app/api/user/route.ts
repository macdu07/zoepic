import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { user, session as sessionTable, account, userProfiles, conversionLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth-server";
import { cancelPayPalSubscription } from "@/lib/paypal";
import { sendEmail, emailWrapper } from "@/lib/email";

export async function DELETE() {
  try {
    const { session, errorResponse } = await requireSession();
    if (errorResponse) return errorResponse;
    const userId = session.user.id;
    const userEmail = session.user.email;
    const userName = session.user.name ?? session.user.email;

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
    sendEmail(
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
