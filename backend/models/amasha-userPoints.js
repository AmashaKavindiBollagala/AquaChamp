import mongoose from "mongoose";


const userPointsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    totalPoints: {
      type: Number,
      default: 0,
    },

    // History of point transactions for auditability
    history: [
      {
        points: { type: Number, required: true },
        reason: { type: String, required: true },
        date: { type: String, required: true }, // YYYY-MM-DD
        activityLogId: { type: mongoose.Schema.Types.ObjectId, ref: "ActivityLog", default: null },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("UserPoints", userPointsSchema);