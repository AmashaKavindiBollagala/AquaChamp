import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BadgeNotification from './models/dushani-BadgeNotification.js';

dotenv.config();

const deleteAllUserNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const userId = '69d601a3d6452c80bb8ca0f6'; // vidu's user ID
    
    console.log('\n🗑️ DELETING ALL NOTIFICATIONS FOR USER...\n');
    
    const result = await BadgeNotification.deleteMany({ userId });
    
    console.log(`✅ Deleted ${result.deletedCount} notifications`);
    console.log('🎯 All old notifications removed!');
    console.log('📌 New notifications will ONLY be created when badges are actually earned.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

deleteAllUserNotifications();
