import mongoose from 'mongoose';

const dailyLoginSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  loginDate: {
    type: Date,
    required: [true, 'Login date is required'],
    index: true
  },
  pointsAwarded: {
    type: Number,
    default: 10,
    min: [0, 'Points cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one login reward per user per day
dailyLoginSchema.index({ userId: 1, loginDate: 1 }, { unique: true });

// Method to check if user already logged in today
dailyLoginSchema.statics.hasLoggedInToday = async function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const existingLogin = await this.findOne({
    userId,
    loginDate: {
      $gte: today,
      $lt: tomorrow
    }
  });
  
  return !!existingLogin;
};

// Method to record daily login
dailyLoginSchema.statics.recordLogin = async function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const loginRecord = new this({
    userId,
    loginDate: today,
    pointsAwarded: 10
  });
  
  await loginRecord.save();
  return loginRecord;
};

export default mongoose.model('DailyLogin', dailyLoginSchema);