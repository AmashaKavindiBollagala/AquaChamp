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
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // OTP expires in 5 minutes
  }
});

export default mongoose.model(
  "SecurityPasswordOTP",
  securityPasswordOTPSchema
);