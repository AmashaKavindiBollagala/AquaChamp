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

    const record = await SecurityEmailVerification.findOne({ token });
    if (!record) return res.status(400).send("Invalid or expired token");

    const user = await User.findById(record.userId);
    user.isVerified = true;
    await user.save();

    await SecurityEmailVerification.deleteOne({ _id: record._id });

    res.send("<h2>Email verified successfully. You can login now.</h2>");
  } catch (error) {
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


// STEP 2: Verify OTP and change password

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


 // STEP 1 (Forgot Password): Request password reset link
 
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


 // STEP 2: Verify reset token from link
 
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
