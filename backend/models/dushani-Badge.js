import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  badgeName: {
    type: String,
    required: [true, 'Badge name is required'],
    trim: true,
    unique: true
  },
  badgeType: {
    type: String,
    required: [true, 'Badge type is required'],
    enum: ['Milestone', 'Section Completion', 'Special'],
    default: 'Milestone'
  },
  pointsRequired: {
    type: Number,
    default: 0,
    min: [0, 'Points required must be positive']
  },
  sectionName: {
    type: String,
    trim: true,
    default: null
  },
  badgeIcon: {
    type: String,
    trim: true,
    default: '⭐'
  },
  description: {
    type: String,
    required: [true, 'Badge description is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  earnedCount: {
    type: Number,
    default: 0,
    min: [0, 'Earned count cannot be negative']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
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
badgeSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Index for better query performance
badgeSchema.index({ badgeType: 1 });
badgeSchema.index({ status: 1 });
badgeSchema.index({ pointsRequired: 1 });

export default mongoose.model('Badge', badgeSchema);