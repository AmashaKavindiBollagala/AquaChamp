import mongoose from "mongoose";

const securityPasswordOTPSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  otp: {
    type: String,
    required: true,
  },

  attempts: {
    type: Number,
    default: 0, // number of wrong tries
  },

  expiresAt: {
    type: Date,
    required: true,
  }
});

// automatically remove expired OTPs
securityPasswordOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model(
  "SecurityPasswordOTP",
  securityPasswordOTPSchema
);