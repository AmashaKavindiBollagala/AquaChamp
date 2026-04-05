// routes/securityRoutes.js
import express from "express";
import {
  securityChangePassword,
  securityResetPassword,
  verifyEmail,
  requestChangePasswordOTP,
  verifyChangePasswordOTP,
  requestPasswordReset,
  verifyPasswordResetToken,
  requestResetPasswordOTP,
  verifyResetPasswordOTP,
  resendVerificationEmail
} from "../controllers/securityController.js";

const router = express.Router();

// ------------------ Change Password ------------------
// Update existing user password
router.put("/change-password/:id", securityChangePassword);

// Request OTP before password change
router.post("/change-password/request-otp", requestChangePasswordOTP);

// Verify OTP and change password
router.post("/change-password/verify-otp", verifyChangePasswordOTP);

// ------------------ Reset Password (Forgot Password) ------------------
// Step 1: Request reset link
router.post("/forgot-password", requestPasswordReset);

// Step 2: Verify reset token from email link
router.get("/forgot-password/verify-token/:token", verifyPasswordResetToken);

// Step 3: Request OTP after user clicks link
router.post("/forgot-password/request-otp", requestResetPasswordOTP);

// Step 4: Verify OTP and set new password
router.post("/forgot-password/verify-otp", verifyResetPasswordOTP);

// ------------------ Email Verification ------------------
router.get("/verify-email/:token", verifyEmail);

router.post("/resend-verification", resendVerificationEmail);

// ------------------ Login (if you have it later) ------------------
// router.post("/login", loginUser);

export default router;