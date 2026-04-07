import mongoose from "mongoose";

const kaveeshaLessonsProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subtopicId: { type: mongoose.Schema.Types.ObjectId, ref: "Subtopic", required: true },
  videoCompleted: { type: Boolean, default: false },
  textCompleted: { type: Boolean, default: false },
  imagesCompleted: { type: Boolean, default: false },
  miniQuizCompleted: { type: Boolean, default: false },
  isSubtopicCompleted: { type: Boolean, default: false },
  completedAt: Date
}, { 
  timestamps: true,
  collection: "lessonprogress"
});

export default mongoose.model("KaveeshaLessonsProgress", kaveeshaLessonsProgressSchema);