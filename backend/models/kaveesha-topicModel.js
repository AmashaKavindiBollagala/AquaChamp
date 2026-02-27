import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,    
      trim: true
    },
    description: String
  },
  { timestamps: true }
);

export default mongoose.model("Topic", topicSchema);