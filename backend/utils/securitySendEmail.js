import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

export const securitySendEmail = async (to, subject, html) => {
  console.log("📧 Attempting to send to:", to);
  console.log("🔑 BREVO_USER exists:", !!process.env.BREVO_USER);
  console.log("🔑 BREVO_PASS exists:", !!process.env.BREVO_PASS);

  await transporter.sendMail({
    from: '"AquaChamp" <amashakav23@gmail.com>',
    to,
    subject,
    html,
  });

  console.log("✅ Email sent successfully");
};