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

export default mongoose.model('GameScore', gameScoreSchema);