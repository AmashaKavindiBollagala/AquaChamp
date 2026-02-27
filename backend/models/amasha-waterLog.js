import mongoose from "mongoose";


const waterLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"],
    },

    // Number of cups consumed today (each cup ≈ 250 ml)
    cupsConsumed: {
      type: Number,
      default: 0,
      min: [0, "Cups consumed cannot be negative"],
    },

    // Recommended cups based on age group (set at log creation, can differ over time)
    dailyGoalCups: {
      type: Number,
      required: true,
    },

    ageGroup: {
      type: String,
      enum: ["5-10", "10-15"],
      required: true,
    },
  },
  { timestamps: true }
);

// One log per user per day
waterLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("WaterLog", waterLogSchema);