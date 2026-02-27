import mongoose from "mongoose";


const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },

    // Store the date as a date-only string (YYYY-MM-DD) for easy querying
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"],
    },

    status: {
      type: String,
      enum: ["completed", "skipped"],
      default: "completed",
    },

    // Points awarded for this log entry
    pointsEarned: {
      type: Number,
      default: 0,
    },

    notes: {
      type: String,
      maxlength: [200, "Notes cannot exceed 200 characters"],
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent duplicate logs for the same user + activity + date
activityLogSchema.index({ userId: 1, activityId: 1, date: 1 }, { unique: true });

export default mongoose.model("ActivityLog", activityLogSchema);