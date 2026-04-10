import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    options: {
      type: [String],
      required: true,
    },
    correctAnswer: {
      type: String,
      required: [true, "Correct answer is required"],
      trim: true,
    },
  },
  { _id: true }
);

questionSchema.path("options").validate(function (v) {
  const nonEmpty = (v || []).filter((o) => String(o || "").trim().length > 0);
  return nonEmpty.length >= 2;
}, "Each question needs at least 2 non-empty options");

// Mongoose 9: subdocument pre("validate") does not receive `next`; use sync hook only.
questionSchema.pre("validate", function () {
  const opts = (this.options || []).map((o) => String(o || "").trim()).filter(Boolean);
  const ca = String(this.correctAnswer || "").trim();
  if (opts.length >= 2 && ca && !opts.includes(ca)) {
    this.invalidate("correctAnswer", "Correct answer must be one of the options");
  }
});

const miniQuizSchema = new mongoose.Schema(
  {
    subtopicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subtopic",
      required: true,
    },

    ageGroup: {
      type: String,
      enum: ["6-10", "11-15"],
      required: true,
    },

    questions: {
      type: [questionSchema],
      validate: [
        (arr) => Array.isArray(arr) && arr.length > 0,
        "At least one question is required",
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.model("MiniQuiz", miniQuizSchema);
