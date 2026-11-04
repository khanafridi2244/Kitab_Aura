import nodemailer from "nodemailer";

let transporter; // created the first time an email is sent

const isConfigured = () => !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const getTransporter = () => {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // true only for port 465, other ports upgrade the connection themselves
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
};

// Makes user text safe to put inside an HTML email
export const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Sends one email. It never throws: it returns true when sent and false when not,
// so a mail problem can never break the request that triggered it
export default async function sendEmail({ to, subject, text, html }) {
  if (!to) return false;

  if (!isConfigured()) {
    console.log(`[email skipped, SMTP is not configured] to=${to} subject="${subject}"`);
    return false;
  }

  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || `KitabAura <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch (err) {
    console.error("Email failed:", err.message);
    return false;
  }
}