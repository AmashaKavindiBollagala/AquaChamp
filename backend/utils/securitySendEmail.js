import nodemailer from "nodemailer";

// Create transporter once (not on every call)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 10000,
});

export const securitySendEmail = async (to, subject, html) => {
  const emailPromise = transporter.sendMail({
    from: `"AquaChamp" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Email sending timed out after 8s")), 8000)
  );

  await Promise.race([emailPromise, timeoutPromise]);
};