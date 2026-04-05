// controllers/securityController.js

import User from "../models/dushani-User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  checkPasswordStrength,
  hashPassword,
} from "../utils/securityPassword.js";
import SecurityEmailVerification from "../models/securityEmailVerification.js";
import SecurityPasswordOTP from "../models/securityPasswordOTP.js";
import SecurityPasswordReset from "../models/SecurityPasswordReset.js";
import { v4 as uuidv4 } from "uuid";
import { securitySendEmail } from "../utils/securitySendEmail.js";
import { generateOTP } from "../utils/securityGenerateOTP.js";

/**
 * ===============================
 * CHANGE PASSWORD (direct change)
 * PUT /api/security/change-password/:id
 * ===============================
 */
export const securityChangePassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password incorrect" });

    checkPasswordStrength(newPassword);

    user.password = await hashPassword(newPassword);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * ===============================
 * RESET PASSWORD (direct reset via email)
 * POST /api/security/reset-password
 * ===============================
 */
export const securityResetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    checkPasswordStrength(newPassword);

    user.password = await hashPassword(newPassword);
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * ===============================
 * VERIFY EMAIL
 * GET /api/security/verify-email/:token
 * ===============================
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    console.log(`\n🔐 Email verification attempt`);
    console.log(`   Token: ${token}`);

    const record = await SecurityEmailVerification.findOne({ token });
    if (!record) {
      console.log(`❌ Invalid or expired token - not found in database`);
      return res.status(400).send("Invalid or expired token");
    }

    console.log(`✅ Token found in database`);
    console.log(`   Token ID: ${record._id}`);
    console.log(`   User ID: ${record.userId}`);
    console.log(`   Created at: ${record.createdAt}`);

    // Check if verification link has expired (1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (record.createdAt < oneHourAgo) {
      console.log(`⏰ Token expired - older than 1 hour`);
      await SecurityEmailVerification.deleteOne({ _id: record._id });
      console.log(`🗑️ Deleted expired token`);
      return res
        .status(400)
        .send("Link expired. Please resend verification email.");
    }

    console.log(`✅ Token is valid and not expired`);

    const user = await User.findById(record.userId);
    if (!user) {
      console.log(`❌ User not found for token`);
      return res.status(404).send("User not found");
    }

    console.log(`   User email: ${user.email}`);
    console.log(`   Current verified status: ${user.isVerified}`);

    user.isVerified = true;
    await user.save();
    console.log(`✅ User marked as verified`);

    await SecurityEmailVerification.deleteOne({ _id: record._id });
    console.log(`🗑️ Deleted used verification token`);

    console.log(`🎉 Redirecting to email-verified page\n`);
    res.redirect("http://localhost:5173/email-verified");
  } catch (error) {
    console.error(`❌ Verification error:`, error.message);
    console.error(error.stack);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ===============================
 * RESEND EMAIL VERIFICATION
 * POST /api/security/resend-verification
 * ===============================
 */
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`\n🔄 Resend verification request for: ${email}`);

    // ✅ Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(404).json({ message: "User not found" });
    }

    // Already verified?
    if (user.isVerified) {
      console.log(`⚠️ User already verified: ${email}`);
      return res.json({ message: "Email already verified" });
    }

    console.log(`   User ID: ${user._id}`);

    // Check existing tokens before deletion
    const existingTokens = await SecurityEmailVerification.find({
      userId: user._id,
    });
    console.log(`📋 Found ${existingTokens.length} existing token(s):`);
    existingTokens.forEach((t, i) => {
      console.log(
        `   Token ${i + 1}: ${t.token.substring(0, 8)}... | Created: ${t.createdAt}`,
      );
    });

    // Delete any existing verification tokens for this user - use deleteMany with await
    const deleteResult = await SecurityEmailVerification.deleteMany({
      userId: user._id,
    });
    console.log(
      `🗑️ Deleted ${deleteResult.deletedCount} old verification token(s)`,
    );

    // Verify deletion
    const remainingTokens = await SecurityEmailVerification.find({
      userId: user._id,
    });
    console.log(
      `✅ Remaining tokens after deletion: ${remainingTokens.length}`,
    );

    // Create a new token
    const token = uuidv4();
    console.log(`🆕 Creating new token: ${token.substring(0, 8)}...`);

    const newToken = await SecurityEmailVerification.create({
      userId: user._id,
      token,
    });
    console.log(`✅ New token created successfully`);
    console.log(`   Token ID: ${newToken._id}`);
    console.log(`   Token value: ${token}`);

    const verifyLink = `http://localhost:4000/api/security/verify-email/${token}`;
    console.log(`🔗 Full verification link:`);
    console.log(`   ${verifyLink}`);

    // Send the verification email
    console.log(`📧 Sending verification email...`);
    const html = `
<div style="font-family: Arial, sans-serif; background:#EAF5FF; padding:40px 0;">
  <div style="max-width:500px;margin:auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg,#042C53,#185FA5,#1D9E75); padding:25px; text-align:center; color:white;">
      
      <img src="http://localhost:4000/uploads/images/AquaChampLogo.png" alt="AquaChamp Logo" style="width:60px;height:60px;border-radius:12px;margin-bottom:10px;" />
      
      <h1 style="margin:0;font-size:24px;">💧 AquaChamp</h1>
      <p style="margin:5px 0 0;font-size:12px;">Clean Water · Safe Futures</p>
    </div>

    <!-- Body -->
    <div style="padding:30px; text-align:center;">
      <h2 style="color:#0f172a;">👋 Welcome, Hero!</h2>

      <p style="color:#475569; font-size:14px; line-height:1.6;">
        You're one step away from starting your hygiene adventure 🎮✨
      </p>

      <p style="color:#475569; font-size:14px;">
        Click below to verify your email:
      </p>

      <!-- Button -->
      <a href="${verifyLink}" 
         style="display:inline-block;margin-top:20px;padding:14px 28px;
         background:linear-gradient(135deg,#0284c7,#10b981);
         color:white;text-decoration:none;border-radius:10px;
         font-weight:bold;font-size:15px;">
         🚀 Verify My Account
      </a>

      <p style="margin-top:20px;font-size:12px;color:#94a3b8;">
        ⏳ This link expires in 1 hour
      </p>

      <p style="margin-top:10px;font-size:12px;color:#94a3b8;">
        If you didn’t create this account, you can safely ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f1f5f9;padding:15px;text-align:center;font-size:11px;color:#64748b;">
      © 2026 AquaChamp 🌊 | Stay Clean, Stay Healthy 💙
    </div>

  </div>
</div>
`;

    await securitySendEmail(email, "Verify Your Email", html);

    console.log(`✅ Verification email sent successfully to: ${email}\n`);
    res.json({ message: "Verification email sent!" });
  } catch (error) {
    console.error(`❌ Resend verification error:`, error.message);
    console.error(error.stack);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ===============================
 * LOGIN USER
 * POST /api/security/login
 * ===============================
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (!user.isVerified)
      return res
        .status(401)
        .json({ message: "Please verify your email before login" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ===============================
 * STEP 1: Request OTP for changing password
 * POST /api/security/change-password/request-otp
 * ===============================
 */
export const requestChangePasswordOTP = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password incorrect" });

    checkPasswordStrength(newPassword);

    // delete old OTPs
    await SecurityPasswordOTP.deleteMany({ userId: user._id });

    // generate OTP
    const otp = generateOTP();

    // expiry time (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // save OTP
    await SecurityPasswordOTP.create({
      userId: user._id,
      otp,
      expiresAt,
    });
    await securitySendEmail(
      user.email,
      "OTP for Password Change",
      `<h2>Your OTP for password change is:</h2><p>${otp}</p><p>It expires in 5 minutes</p>`,
    );

    res.json({ message: "OTP sent to registered email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ===============================
 * STEP 2: Verify OTP and change password
 * POST /api/security/change-password/verify-otp
 * ===============================
 */
export const verifyChangePasswordOTP = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;

    const record = await SecurityPasswordOTP.findOne({ userId });

    if (!record)
      return res.status(400).json({ message: "OTP expired. Request new one." });

    // expiry check
    if (record.expiresAt < new Date()) {
      await SecurityPasswordOTP.deleteOne({ _id: record._id });
      return res.status(400).json({ message: "OTP expired" });
    }

    // attempt limit
    if (record.attempts >= 3) {
      await SecurityPasswordOTP.deleteOne({ _id: record._id });
      return res
        .status(400)
        .json({ message: "Too many attempts. Request new OTP." });
    }

    // incorrect OTP
    if (record.otp !== otp) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    // correct OTP → change password
    const user = await User.findById(userId);
    user.password = await hashPassword(newPassword);
    await user.save();

    await SecurityPasswordOTP.deleteOne({ _id: record._id });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ===============================
 * STEP 1 (Forgot Password): Request password reset link
 * POST /api/security/forgot-password
 * ===============================
 */
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(200)
        .json({ message: "If this email exists, a reset link has been sent" });

    const token = uuidv4();

    await SecurityPasswordReset.create({ userId: user._id, token });

    const resetLink = `http://localhost:4000/api/security/forgot-password/verify-token/${token}`;

    await securitySendEmail(
      email,
      "Reset Your Password",
      `<h2>Password Reset Request</h2>
       <p>Click the link below to reset your password. It expires in 5 minutes.</p>
       <a href="${resetLink}">${resetLink}</a>`,
    );

    res.json({ message: "If this email exists, a reset link has been sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ===============================
 * STEP 2: Verify reset token from link
 * GET /api/security/forgot-password/verify-token/:token
 * ===============================
 */
export const verifyPasswordResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    const record = await SecurityPasswordReset.findOne({ token });
    if (!record)
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });

    res.json({ message: "Token valid", userId: record.userId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ===============================
 * STEP 3: Request OTP after clicking reset link
 * POST /api/security/forgot-password/request-otp
 * ===============================
 */
export const requestResetPasswordOTP = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    checkPasswordStrength(newPassword);
    await SecurityPasswordOTP.deleteMany({ userId });

    const otp = generateOTP();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await SecurityPasswordOTP.create({
      userId,
      otp,
      expiresAt,
    });

    await securitySendEmail(
      user.email,
      "OTP for Password Reset",
      `<h2>Your OTP for password reset is:</h2><p>${otp}</p><p>It expires in 5 minutes</p>`,
    );

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ===============================
 * STEP 4: Verify OTP and set new password
 * POST /api/security/forgot-password/verify-otp
 * ===============================
 */
export const verifyResetPasswordOTP = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;

    const record = await SecurityPasswordOTP.findOne({ userId });

    if (!record)
      return res.status(400).json({ message: "OTP expired. Request new one." });

    if (record.expiresAt < new Date()) {
      await SecurityPasswordOTP.deleteOne({ _id: record._id });
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.attempts >= 3) {
      await SecurityPasswordOTP.deleteOne({ _id: record._id });
      return res
        .status(400)
        .json({ message: "Too many attempts. Request new OTP." });
    }

    if (record.otp !== otp) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    const user = await User.findById(userId);
    user.password = await hashPassword(newPassword);
    await user.save();

    await SecurityPasswordOTP.deleteOne({ _id: record._id });
    await SecurityPasswordReset.deleteMany({ userId });

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
