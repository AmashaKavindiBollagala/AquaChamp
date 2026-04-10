// models/dilshara-Game.js
import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText:  { type: String, required: true, trim: true },
  options: {
    type: [String],
    validate: {
      validator: arr => arr.length === 4,
      message: 'Each question must have exactly 4 options',
    },
  },
  correctAnswer: { type: String, required: true, trim: true },
  hint:          { type: String, trim: true },
});

const gameSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    gameType: {
      type: String,
      enum: ['quiz', 'truefalse', 'memory'],
      default: 'quiz',
    },
    subType: {
      type: String,
      enum: ['quiz', 'germcatcher', 'waterdrop', 'memory', 'cleanordirty', 'cleandirtygame'],
      default: 'quiz',
    },
   lessonTopic: {
  type: String,
  required: true,
  enum: [
    'Safe Drinking Water',
    'Handwashing and Personal Hygiene',        
    'Toilet and Sanitation Practices',
    'Water-Borne Diseases and Prevention',
    'Water Conservation and Environmental Care',
  ],
},
    topicId:    { type: String },
    ageGroup:   { type: String, enum: ['5-10', '11-15'], default: '5-10' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    questions:  { type: [questionSchema], default: [] },
    pointsPerQuestion: { type: Number, default: 10 },
    timeLimit:         { type: Number, default: 30 },
    passMark:          { type: Number, default: 60 },
    totalPoints:       { type: Number, default: 0 },
    active:            { type: Boolean, default: true },
    createdBy:         { type: String },
  },
  { timestamps: true }
);

gameSchema.pre('save', async function () {
  this.totalPoints = (this.questions?.length || 0) * this.pointsPerQuestion;
});

export default mongoose.model('Game', gameSchema);