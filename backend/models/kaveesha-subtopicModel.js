import mongoose from "mongoose";

const subtopicSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true
    },

    title: {
      type: String,
      required: true
    },

    ageGroup: {
      type: String,
      enum: ["6-10", "11-15"],
      required: true
    },

    // lesson content
    content: String,

    // multimedia
    images: [String],
    videoUrl: String,

    order: Number,

    isLocked: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Subtopic", subtopicSchema);