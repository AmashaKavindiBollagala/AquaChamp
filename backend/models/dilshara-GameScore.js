import mongoose from 'mongoose';

const gameScoreSchema = new mongoose.Schema(
  {
    gameId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
    userId:     { type: String, required: true },
    score:      { type: Number, required: true, min: 0 },
    maxScore:   { type: Number, required: true },
    percentage: { type: Number, default: 0 },
    passed:     { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('GameScore', gameScoreSchema);