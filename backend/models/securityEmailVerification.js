import mongoose from "mongoose";

const securityEmailVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // auto delete after 1 hour
  },
});

export default mongoose.model(
  "SecurityEmailVerification",
  securityEmailVerificationSchema
);