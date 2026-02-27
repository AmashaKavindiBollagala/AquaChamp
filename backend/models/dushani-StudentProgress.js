import mongoose from 'mongoose';

const studentProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: [0, 'Points cannot be negative']
  },
  currentLevel: {
    type: String,
    default: 'Level 1'
  },
  badgesEarned: [{
    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge',
      required: true
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    badgeDetails: {
      badgeName: String,
      badgeIcon: String,
      description: String
    }
  }],
  sectionProgress: [{
    sectionName: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completionDate: {
      type: Date,
      default: null
    },
    pointsEarned: {
      type: Number,
      default: 0,
      min: [0, 'Points cannot be negative']
    }
  }],
  lastActivity: {
    type: Date,
    default: Date.now
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
studentProgressSchema.pre('save', function() {
  this.updatedAt = Date.now();
  // Update last activity when points or badges change
  if (this.isModified('totalPoints') || this.isModified('badgesEarned')) {
    this.lastActivity = Date.now();
  }
});

// Calculate level based on points using editable Level ranges
// Admin can change ranges via the Level CRUD APIs.
studentProgressSchema.methods.calculateLevel = async function() {
  try {
    const Level = (await import('./dushani-Level.js')).default;
    const levelDoc = await Level.getLevelByPoints(this.totalPoints || 0);

    // If a matching Level document is found, use its name
    if (levelDoc) return levelDoc.levelName;

    // Fallback: derive a basic level name if no Level doc matches
    const points = this.totalPoints || 0;
    if (points <= 199) return 'Level 1';
    if (points <= 399) return 'Level 2';
    if (points <= 599) return 'Level 3';
    if (points <= 799) return 'Level 4';
    return 'Level 5';
  } catch (error) {
    console.error('Calculate level error:', error);
    // On error, keep a sensible default instead of failing
    return this.currentLevel || 'Level 1';
  }
};

// Add points to student
studentProgressSchema.methods.addPoints = async function(points) {
  if (points > 0) {
    this.totalPoints += points;
    this.currentLevel = await this.calculateLevel();
    return true;
  }
  return false;
};

// Check if student has earned a specific badge
studentProgressSchema.methods.hasBadge = function(badgeId) {
  return this.badgesEarned.some(badge => 
    badge.badgeId.toString() === badgeId.toString()
  );
};

// Add badge to student
studentProgressSchema.methods.addBadge = function(badge) {
  if (!this.hasBadge(badge._id)) {
    this.badgesEarned.push({
      badgeId: badge._id,
      badgeDetails: {
        badgeName: badge.badgeName,
        badgeIcon: badge.badgeIcon,
        description: badge.description
      }
    });
    return true;
  }
  return false;
};

// Check section completion
studentProgressSchema.methods.isSectionCompleted = function(sectionName) {
  const section = this.sectionProgress.find(sec => sec.sectionName === sectionName);
  return section ? section.completed : false;
};

// Complete section and award points
studentProgressSchema.methods.completeSection = async function(sectionName, points = 50) {
  let section = this.sectionProgress.find(sec => sec.sectionName === sectionName);
  
  if (!section) {
    section = {
      sectionName,
      completed: true,
      completionDate: new Date(),
      pointsEarned: points
    };
    this.sectionProgress.push(section);
  } else if (!section.completed) {
    section.completed = true;
    section.completionDate = new Date();
    section.pointsEarned = points;
  }
  
  await this.addPoints(points);
  return section;
};

// Index for better query performance
// userId index is automatically created by unique: true constraint
studentProgressSchema.index({ totalPoints: -1 });
studentProgressSchema.index({ currentLevel: -1 });
studentProgressSchema.index({ 'badgesEarned.badgeId': 1 });

export default mongoose.model('StudentProgress', studentProgressSchema);