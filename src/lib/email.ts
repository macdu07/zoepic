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
  console.log("[sendEmail] Sending to:", to, "| Subject:", subject);
  console.log("[sendEmail] SMTP config:", {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    passSet: !!process.env.SMTP_PASS,
  });
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM ?? "ZoePic <noreply@zoepic.online>",
      to,
      subject,
      html,
    });
    console.log("[sendEmail] OK:", info.messageId, "| Response:", info.response);
  } catch (err) {
    console.error("[sendEmail] ERROR:", err);
    throw err;
  }
}
