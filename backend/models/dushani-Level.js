import mongoose from 'mongoose';

const levelSchema = new mongoose.Schema({
  levelName: {
    type: String,
    required: [true, 'Level name is required'],
    trim: true,
    unique: true
  },
  minPoints: {
    type: Number,
    required: [true, 'Minimum points required'],
    min: [0, 'Minimum points cannot be negative']
  },
  maxPoints: {
    type: Number,
    default: null, // null means unlimited (Level 5)
    validate: {
      validator: function (value) {
        if (value === null) return true; // allow unlimited
        return value >= this.minPoints; // Allow maxPoints to equal minPoints
      },
      message: 'Maximum points must be greater than or equal to minimum points'
    }
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });


   //Validate No Overlapping Ranges

levelSchema.statics.validateLevelRanges = async function (excludeId = null) {
  const levels = await this.find(
    excludeId ? { _id: { $ne: excludeId } } : {}
  ).sort({ minPoints: 1 });

  for (let i = 0; i < levels.length - 1; i++) {
    const currentMax = levels[i].maxPoints ?? Infinity;
    const nextMin = levels[i + 1].minPoints;

    if (currentMax >= nextMin) {
      throw new Error(
        `Level ranges overlap between ${levels[i].levelName} and ${levels[i + 1].levelName}`
      );
    }
  }
};


   //Get Level By Points

levelSchema.statics.getLevelByPoints = async function (points) {

  // 0 points = No level
  if (points <= 0) return null;

  return await this.findOne({
    minPoints: { $lte: points },
    $or: [
      { maxPoints: { $gte: points } },
      { maxPoints: null } // unlimited level
    ],
    isActive: true
  });
};


   //Get All Active Levels

levelSchema.statics.getActiveLevels = async function () {
  return await this.find({ isActive: true }).sort({ minPoints: 1 });
};


  // Indexes

levelSchema.index({ minPoints: 1 });
levelSchema.index({ maxPoints: 1 });
levelSchema.index({ isActive: 1 });

export default mongoose.model('Level', levelSchema);