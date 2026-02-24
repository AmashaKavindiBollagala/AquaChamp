import nodemailer from "nodemailer";

export const securitySendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"AquaChamp" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};