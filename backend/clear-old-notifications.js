import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BadgeNotification from './models/dushani-BadgeNotification.js';

dotenv.config();

const clearAllNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const userId = '69d601a3d6452c80bb8ca0f6'; // vidu's user ID
    
    console.log('\n🗑️ Clearing ALL badge notifications for user...');
    
    // Mark all as triggered to clear them
    const result = await BadgeNotification.updateMany(
      { userId, animationTriggered: false },
      { animationTriggered: true }
    );
    
    console.log(`✅ Marked ${result.modifiedCount} notifications as triggered\n`);
    console.log('🎯 Now when you recalculate badges, new notifications will be created for earned badges!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

clearAllNotifications();
