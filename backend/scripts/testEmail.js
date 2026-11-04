import "dotenv/config";
import sendEmail from "../src/utils/sendEmail.js";

const to = process.argv[2] || process.env.ADMIN_EMAIL;

const ok = await sendEmail({
  to,
  subject: "KitabAura test email",
  text: "If you can read this, email is working.",
});

console.log(ok ? `Test email sent to ${to}` : "Email was not sent. Check the SMTP values in .env");