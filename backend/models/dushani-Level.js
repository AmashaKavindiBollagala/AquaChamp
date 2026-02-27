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
    min: [0, 'Minimum points cannot be negative'],
    validate: {
      validator: function(value) {
        return value < this.maxPoints;
      },
      message: 'Minimum points must be less than maximum points'
    }
  },
  maxPoints: {
    type: Number,
    required: [true, 'Maximum points required'],
    min: [1, 'Maximum points must be positive'],
    validate: {
      validator: function(value) {
        return value > this.minPoints;
      },
      message: 'Maximum points must be greater than minimum points'
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
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps
levelSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Ensure no overlapping level ranges
levelSchema.statics.validateLevelRanges = async function(excludeId = null) {
  const levels = await this.find(
    excludeId ? { _id: { $ne: excludeId } } : {}
  ).sort({ minPoints: 1 });

  for (let i = 0; i < levels.length - 1; i++) {
    if (levels[i].maxPoints >= levels[i + 1].minPoints) {
      throw new Error(`Level ranges overlap between ${levels[i].levelName} and ${levels[i + 1].levelName}`);
    }
  }
};

// Get level by points
levelSchema.statics.getLevelByPoints = async function(points) {
  const level = await this.findOne({
    minPoints: { $lte: points },
    maxPoints: { $gte: points },
    isActive: true
  });
  
  return level;
};

// Get all active levels
levelSchema.statics.getActiveLevels = async function() {
  return await this.find({ isActive: true }).sort({ minPoints: 1 });
};

// Index for better query performance
levelSchema.index({ minPoints: 1 });
levelSchema.index({ maxPoints: 1 });
levelSchema.index({ isActive: 1 });

export default mongoose.model('Level', levelSchema);