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


// ─── Helper: send email without blocking the response ───────────────────────
const sendEmailSafely = (to, subject, html, label = "Email") => {
  securitySendEmail(to, subject, html)
    .then(() => console.log(`✅ ${label} sent to: ${to}`))
    .catch((err) =>
      console.error(`⚠️ ${label} failed (non-blocking): ${err.message}`)
    );
};


// CHANGE PASSWORD (direct change)

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


// RESET PASSWORD (direct reset via email)

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


// VERIFY EMAIL

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


// RESEND EMAIL VERIFICATION
// POST /api/security/resend-verification

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

    // Delete any existing verification tokens for this user
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
        If you didn't create this account, you can safely ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f1f5f9;padding:15px;text-align:center;font-size:11px;color:#64748b;">
      © 2026 AquaChamp 🌊 | Stay Clean, Stay Healthy 💙
    </div>

  </div>
</div>
`;

    // Send the verification email — await here so user gets clear success/failure
    console.log(`📧 Sending verification email...`);
    await securitySendEmail(email, "Verify Your Email", html);
    console.log(`✅ Verification email sent successfully to: ${email}\n`);

    res.json({ message: "Verification email sent!" });
  } catch (error) {
    console.error(`❌ Resend verification error:`, error.message);
    console.error(error.stack);
    res.status(500).json({ message: error.message });
  }
};


// LOGIN USER

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


// STEP 1: Request OTP for changing password

export const requestChangePasswordOTP = async (req, res) => {
  try {
    console.log("\n🔐 Request Change Password OTP");

    // Get username from JWT token (set by verifyJWT middleware)
    const username = req.user;
    console.log("   Username from token:", username);

    if (!username) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { currentPassword, newPassword } = req.body;
    console.log("   Validating passwords...");

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      console.log("❌ User not found:", username);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("   User found:", user.email);

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.log("❌ Current password incorrect");
      return res.status(400).json({ message: "Current password incorrect" });
    }
    console.log("✅ Current password verified");

    // Validate new password strength (same as registration)
    try {
      checkPasswordStrength(newPassword);
      console.log("✅ New password meets requirements");
    } catch (error) {
      console.log("❌ Password validation failed:", error.message);
      return res.status(400).json({ message: error.message });
    }

    // Delete old OTPs for this user
    await SecurityPasswordOTP.deleteMany({ userId: user._id });
    console.log("🗑️ Deleted old OTPs");

    // Generate new OTP
    const otp = generateOTP();
    console.log("🆕 Generated OTP:", otp);

    // Set expiry time (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP to database
    await SecurityPasswordOTP.create({
      userId: user._id,
      otp,
      expiresAt,
    });
    console.log("✅ OTP saved to database");

    // Send OTP email with beautiful template
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
      <h2 style="color:#0f172a;">🔐 Password Change OTP</h2>

      <p style="color:#475569; font-size:14px; line-height:1.6;">
        Hello ${user.firstName}! You requested to change your password.
      </p>

      <p style="color:#475569; font-size:14px;">
        Use the OTP below to verify your identity:
      </p>

      <!-- OTP Display -->
      <div style="margin:20px 0;padding:20px;background:linear-gradient(135deg,#E6F1FB,#E1F5EE);border-radius:12px;border:2px solid #185FA5;">
        <p style="margin:0;font-size:32px;font-weight:900;color:#042C53;letter-spacing:8px;">${otp}</p>
      </div>

      <p style="color:#475569; font-size:14px;">
        Enter this code in the verification field.
      </p>

      <p style="margin-top:20px;font-size:12px;color:#94a3b8;">
        ⏳ This OTP expires in 5 minutes
      </p>

      <p style="margin-top:10px;font-size:12px;color:#94a3b8;">
        If you didn't request this, please ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f1f5f9;padding:15px;text-align:center;font-size:11px;color:#64748b;">
      © 2026 AquaChamp 🌊 | Stay Clean, Stay Healthy 💙
    </div>

  </div>
</div>
`;

    // ✅ FIX: Respond immediately, send email in background (non-blocking)
    res.json({
      message: `OTP sent to ${user.email}`,
      email: user.email,
    });

    sendEmailSafely(user.email, "OTP for Password Change", html, "Change Password OTP");
  } catch (error) {
    console.error("❌ Request OTP error:", error.message);
    console.error(error.stack);
    res.status(500).json({ message: error.message });
  }
};


// STEP 2: Verify OTP and change password

export const verifyChangePasswordOTP = async (req, res) => {
  try {
    console.log("\n✅ Verify Change Password OTP");

    // Get username from JWT token
    const username = req.user;
    console.log("   Username from token:", username);

    if (!username) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { otp, newPassword } = req.body;
    console.log("   Verifying OTP...");

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Find OTP record for this user
    const record = await SecurityPasswordOTP.findOne({ userId: user._id });

    if (!record) {
      console.log("❌ No OTP found - expired or already used");
      return res.status(400).json({ message: "OTP expired. Request new one." });
    }

    console.log("   OTP record found");

    // Check if OTP has expired
    if (record.expiresAt < new Date()) {
      console.log("⏰ OTP expired");
      await SecurityPasswordOTP.deleteOne({ _id: record._id });
      return res.status(400).json({ message: "OTP expired" });
    }

    // Check attempt limit
    if (record.attempts >= 3) {
      console.log("🚫 Too many attempts");
      await SecurityPasswordOTP.deleteOne({ _id: record._id });
      return res.status(400).json({ message: "Too many attempts. Request new OTP." });
    }

    // Verify OTP
    if (record.otp !== otp) {
      console.log("❌ Incorrect OTP");
      record.attempts += 1;
      await record.save();
      console.log(`   Attempt ${record.attempts}/3`);
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    console.log("✅ OTP verified successfully");

    // Validate new password strength
    try {
      checkPasswordStrength(newPassword);
      console.log("✅ New password meets requirements");
    } catch (error) {
      console.log("❌ Password validation failed:", error.message);
      return res.status(400).json({ message: error.message });
    }

    // Update password
    user.password = await hashPassword(newPassword);
    await user.save();
    console.log("✅ Password updated successfully");

    // Delete used OTP
    await SecurityPasswordOTP.deleteOne({ _id: record._id });
    console.log("🗑️ Deleted used OTP");

    console.log("🎉 Password change completed successfully");
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("❌ Verify OTP error:", error.message);
    console.error(error.stack);
    res.status(500).json({ message: error.message });
  }
};


// RESEND OTP for changing password
// POST /api/security/change-password/resend-otp

export const resendChangePasswordOTP = async (req, res) => {
  try {
    console.log("\n🔄 Resend Change Password OTP");

    // Get username from JWT token
    const username = req.user;
    console.log("   Username from token:", username);

    if (!username) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { newPassword } = req.body;
    console.log("   Resending OTP...");

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("   User found:", user.email);

    // Validate new password strength
    try {
      checkPasswordStrength(newPassword);
      console.log("✅ New password meets requirements");
    } catch (error) {
      console.log("❌ Password validation failed:", error.message);
      return res.status(400).json({ message: error.message });
    }

    // Delete old OTPs (expire them)
    await SecurityPasswordOTP.deleteMany({ userId: user._id });
    console.log("🗑️ Deleted old/expired OTPs");

    // Generate new OTP
    const otp = generateOTP();
    console.log("🆕 Generated new OTP:", otp);

    // Set expiry time (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save new OTP
    await SecurityPasswordOTP.create({
      userId: user._id,
      otp,
      expiresAt,
    });
    console.log("✅ New OTP saved");

    // Send OTP email with beautiful template
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
      <h2 style="color:#0f172a;">🔐 New Password Change OTP</h2>

      <p style="color:#475569; font-size:14px; line-height:1.6;">
        Hello ${user.firstName}! You requested a new OTP.
      </p>

      <p style="color:#475569; font-size:14px;">
        Your previous OTP has been expired. Use this new OTP:
      </p>

      <!-- OTP Display -->
      <div style="margin:20px 0;padding:20px;background:linear-gradient(135deg,#E6F1FB,#E1F5EE);border-radius:12px;border:2px solid #185FA5;">
        <p style="margin:0;font-size:32px;font-weight:900;color:#042C53;letter-spacing:8px;">${otp}</p>
      </div>

      <p style="color:#475569; font-size:14px;">
        Enter this code in the verification field.
      </p>

      <p style="margin-top:20px;font-size:12px;color:#94a3b8;">
        ⏳ This OTP expires in 5 minutes
      </p>

      <p style="margin-top:10px;font-size:12px;color:#94a3b8;">
        If you didn't request this, please ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f1f5f9;padding:15px;text-align:center;font-size:11px;color:#64748b;">
      © 2026 AquaChamp 🌊 | Stay Clean, Stay Healthy 💙
    </div>

  </div>
</div>
`;

    // ✅ FIX: Respond immediately, send email in background (non-blocking)
    res.json({
      message: `New OTP sent to ${user.email}`,
      email: user.email,
    });

    sendEmailSafely(user.email, "New OTP for Password Change", html, "Resend Change Password OTP");
  } catch (error) {
    console.error("❌ Resend OTP error:", error.message);
    console.error(error.stack);
    res.status(500).json({ message: error.message });
  }
};


// STEP 1 (Forgot Password): Request password reset link

export const requestPasswordReset = async (req, res) => {
  try {
    console.log("\n📧 Forgot Password Request");
    const { email } = req.body;
    console.log("   Email:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("   ⚠️ User not found - sending success anyway to prevent enumeration");
      return res
        .status(200)
        .json({ message: "If this email exists, a reset link has been sent" });
    }

    console.log("   ✅ User found:", user.email);

    // Delete any existing reset tokens for this user
    await SecurityPasswordReset.deleteMany({ userId: user._id });
    console.log("   🗑️ Deleted old reset tokens");

    const token = uuidv4();
    console.log("   🆕 Generated reset token");

    await SecurityPasswordReset.create({ userId: user._id, token });
    console.log("   ✅ Reset token saved");

    // Create reset link - points to frontend reset password page
    const resetLink = `http://localhost:5173/reset-password/${token}`;
    console.log("   🔗 Reset link:", resetLink);

    // Send beautiful email
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
      <h2 style="color:#0f172a;">🔐 Password Reset Request</h2>

      <p style="color:#475569; font-size:14px; line-height:1.6;">
        Hello ${user.firstName}! We received a request to reset your password.
      </p>

      <p style="color:#475569; font-size:14px;">
        Click the button below to create a new password:
      </p>

      <!-- Reset Button -->
      <a href="${resetLink}" 
         style="display:inline-block;margin-top:20px;padding:14px 28px;
         background:linear-gradient(135deg,#0284c7,#10b981);
         color:white;text-decoration:none;border-radius:10px;
         font-weight:bold;font-size:15px;">
         🔄 Reset My Password
      </a>

      <p style="margin-top:20px;font-size:12px;color:#94a3b8;">
        ⏳ This link expires in 5 minutes
      </p>

      <p style="margin-top:10px;font-size:12px;color:#94a3b8;">
        If you didn't request this, please ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f1f5f9;padding:15px;text-align:center;font-size:11px;color:#64748b;">
      © 2026 AquaChamp 🌊 | Stay Clean, Stay Healthy 💙
    </div>

  </div>
</div>
`;

    // ✅ FIX: Respond immediately, send email in background (non-blocking)
    res.json({ message: "If this email exists, a reset link has been sent" });

    sendEmailSafely(email, "Reset Your Password", html, "Password Reset");
  } catch (error) {
    console.error("❌ Forgot password error:", error.message);
    console.error(error.stack);
    res.status(500).json({ message: error.message });
  }
};


// STEP 2: Verify reset token from link

export const verifyPasswordResetToken = async (req, res) => {
  try {
    console.log("\n🔐 Verify Reset Token");
    const { token } = req.params;
    console.log("   Token:", token);

    const record = await SecurityPasswordReset.findOne({ token });
    if (!record) {
      console.log("❌ Invalid or expired token");
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    console.log("✅ Token valid");
    console.log("   User ID:", record.userId);

    res.json({ message: "Token valid", userId: record.userId });
  } catch (error) {
    console.error("❌ Verify token error:", error.message);
    res.status(500).json({ message: error.message });
  }
};


// STEP 3: Reset password with token
// POST /api/security/forgot-password/reset

export const resetPasswordWithToken = async (req, res) => {
  try {
    console.log("\n🔄 Reset Password with Token");
    const { token, newPassword } = req.body;
    console.log("   Validating token and password...");

    // Find reset token
    const record = await SecurityPasswordReset.findOne({ token });
    if (!record) {
      console.log("❌ Invalid or expired token");
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    console.log("✅ Token found");

    // Validate password strength
    try {
      checkPasswordStrength(newPassword);
      console.log("✅ Password meets requirements");
    } catch (error) {
      console.log("❌ Password validation failed:", error.message);
      return res.status(400).json({ message: error.message });
    }

    // Find user
    const user = await User.findById(record.userId);
    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("   User found:", user.email);

    // Update password
    user.password = await hashPassword(newPassword);
    await user.save();
    console.log("✅ Password updated successfully");

    // Delete used reset token
    await SecurityPasswordReset.deleteOne({ _id: record._id });
    console.log("🗑️ Deleted used reset token");

    console.log("🎉 Password reset completed successfully");
    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("❌ Reset password error:", error.message);
    console.error(error.stack);
    res.status(500).json({ message: error.message });
  }
};


// STEP 3: Request OTP after clicking reset link

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

    const html = `<h2>Your OTP for password reset is:</h2><p>${otp}</p><p>It expires in 5 minutes</p>`;

    // ✅ FIX: Respond immediately, send email in background (non-blocking)
    res.json({ message: "OTP sent to your email" });

    sendEmailSafely(user.email, "OTP for Password Reset", html, "Reset Password OTP");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// STEP 4: Verify OTP and set new password

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