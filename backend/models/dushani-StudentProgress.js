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

    // If no level matches (including 0 points), return 'N/A'
    return 'N/A';
  } catch (error) {
    console.error('Calculate level error:', error);
    // On error, keep a sensible default instead of failing
    return this.currentLevel || 'N/A';
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
  // STRICT comparison using toString() to handle ObjectId vs string
  return this.badgesEarned.some(badge => 
    badge.badgeId.toString() === badgeId.toString()
  );
};

// Add badge to student (DUPLICATE-SAFE)
studentProgressSchema.methods.addBadge = function(badge) {
  // STRICT check for existing badge using toString()
  const alreadyExists = this.badgesEarned.some(b => 
    b.badgeId.toString() === badge._id.toString()
  );

  // Prevent duplicate - return false if already exists
  if (alreadyExists) {
    console.log(`⚠️  addBadge: Duplicate prevented for badge ${badge.badgeName} (${badge._id})`);
    return false;
  }

  // Add new badge
  this.badgesEarned.push({
    badgeId: badge._id,
    badgeDetails: {
      badgeName: badge.badgeName,
      badgeIcon: badge.badgeIcon,
      description: badge.description
    },
    earnedAt: new Date()
  });
  
  console.log(`✅ addBadge: Added badge ${badge.badgeName} (${badge._id})`);
  return true;
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