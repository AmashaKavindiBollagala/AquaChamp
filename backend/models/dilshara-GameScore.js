import mongoose from 'mongoose';

const gameScoreSchema = new mongoose.Schema(
  {
    gameId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
    userId:     { type: String, required: true },
    score:      { type: Number, required: true, min: 0 },
    maxScore:   { type: Number, required: true },
    percentage: { type: Number, default: 0 },
    passed:     { type: Boolean, default: false },
    topicId:    { type: String, default: "" },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
    playedAt:   { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const GameScore = mongoose.model('GameScore', gameScoreSchema);

// ── Topic Completion (Progress Manager reads this) ─────────────────────────
const topicCompletionSchema = new mongoose.Schema(
  {
    userId:               { type: String, required: true },
    topicId:              { type: String, required: true },
    topicLabel:           { type: String },
    ageGroup:             { type: String },
    easyPassed:           { type: Boolean, default: false },
    mediumPassed:         { type: Boolean, default: false },
    hardPassed:           { type: Boolean, default: false },
    lessonsCompleted:     { type: Boolean, default: true },
    completionPercentage: { type: Number,  default: 0 },
    completedAt:          { type: Date,    default: null },
    badgeIssued:          { type: Boolean, default: false },
  },
  { timestamps: true }
);

topicCompletionSchema.index({ userId: 1, topicId: 1 }, { unique: true });

export const TopicCompletion = mongoose.model('TopicCompletion', topicCompletionSchema);