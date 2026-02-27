import mongoose from "mongoose";

const miniQuizSchema = new mongoose.Schema(
  {
    subtopicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subtopic",
      required: true
    },

    ageGroup: {
      type: String,
      enum: ["6-10", "11-15"],
      required: true
    },

    questions: [
      {
        question: {
          type: String,
          required: true
        },

        options: {
          type: [String],
          required: true
        },

        correctAnswer: {
          type: String,
          required: true
        }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("MiniQuiz", miniQuizSchema);