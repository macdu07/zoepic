import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { db } from "../db/db";
import nodemailer from "nodemailer";

// Reusar el transporter para toda la vida del proceso
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },
    plugins: [
        emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
                const subjects: Record<string, string> = {
                    "email-verification": "Verifica tu cuenta en ZoePic",
                    "forget-password": "Recupera tu contraseña en ZoePic",
                    "sign-in": "Tu código de acceso en ZoePic",
                };

                const bodies: Record<string, string> = {
                    "email-verification": `
                        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
                            <h2 style="color:#7c3aed">Verifica tu correo electrónico</h2>
                            <p>Gracias por registrarte en <strong>ZoePic</strong>. Usa el siguiente código para verificar tu cuenta:</p>
                            <div style="background:#f3f0ff;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
                                <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#7c3aed">${otp}</span>
                            </div>
                            <p style="color:#666;font-size:13px">Este código expira en 10 minutos. Si no creaste esta cuenta, ignora este mensaje.</p>
                        </div>
                    `,
                    "forget-password": `
                        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
                            <h2 style="color:#7c3aed">Recupera tu contraseña</h2>
                            <p>Recibimos una solicitud para restablecer tu contraseña en <strong>ZoePic</strong>. Usa este código:</p>
                            <div style="background:#f3f0ff;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
                                <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#7c3aed">${otp}</span>
                            </div>
                            <p style="color:#666;font-size:13px">Este código expira en 10 minutos. Si no solicitaste esto, ignora este mensaje.</p>
                        </div>
                    `,
                    "sign-in": `
                        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
                            <h2 style="color:#7c3aed">Tu código de acceso</h2>
                            <p>Usa el siguiente código para iniciar sesión en <strong>ZoePic</strong>:</p>
                            <div style="background:#f3f0ff;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
                                <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#7c3aed">${otp}</span>
                            </div>
                            <p style="color:#666;font-size:13px">Este código expira en 10 minutos.</p>
                        </div>
                    `,
                };

                await transporter.sendMail({
                    from: process.env.SMTP_FROM ?? "ZoePic <noreply@zepic.online>",
                    to: email,
                    subject: subjects[type] ?? "Tu código de verificación",
                    html: bodies[type] ?? `<p>Tu código: <strong>${otp}</strong></p>`,
                });
            },
        }),
    ],
});
