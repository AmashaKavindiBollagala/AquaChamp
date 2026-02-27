import mongoose from "mongoose";


const activitySchema = new mongoose.Schema(
  {
    // Admin-created activities have no userId (global); user-created ones do
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    name: {
      type: String,
      required: [true, "Activity name is required"],
      trim: true,
      maxlength: [100, "Activity name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description cannot exceed 300 characters"],
    },

    icon: {
      type: String,
      default: "🧼",
    },

    // 'system' = created by admin, 'custom' = created by user
    source: {
      type: String,
      enum: ["system", "custom"],
      default: "custom",
    },

    // Points awarded when this activity is completed
    points: {
      type: Number,
      default: 10,
      min: [1, "Points must be at least 1"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);