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
    contentType: { type: String, enum: ["text", "pdf", "presentation"], default: "text" },
    contentFiles: {
      type: [
        {
          name: { type: String },
          url: { type: String },
          type: { type: String },
          size: { type: Number },
          uploadedAt: { type: Date }
        }
      ],
      default: []
    },

    // multimedia
    images: [String],
    videoUrl: String,
    videoType: { type: String, enum: ["youtube", "upload"], default: "youtube" },

    order: Number,

    isLocked: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Subtopic", subtopicSchema);