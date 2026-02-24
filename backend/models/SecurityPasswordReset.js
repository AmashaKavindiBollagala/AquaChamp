// models/securityPasswordReset.js
import mongoose from "mongoose";

const securityPasswordResetSchema = new mongoose.Schema({
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
    expires: 300 // token expires after 5 minutes
  }
});

export default mongoose.model("SecurityPasswordReset", securityPasswordResetSchema);