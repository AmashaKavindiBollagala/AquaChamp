import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BadgeNotification from './models/dushani-BadgeNotification.js';
import Badge from './models/dushani-Badge.js';
import StudentProgress from './models/dushani-StudentProgress.js';
import User from './models/dushani-User.js';

dotenv.config();

const cleanupAndRefresh = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('\n🧹 CLEANING UP BADGE NOTIFICATIONS...\n');
    
    const userId = '69d601a3d6452c80bb8ca0f6'; // vidu's user ID
    
    // Step 1: Show current notifications
    const currentNotifications = await BadgeNotification.find({ userId }).sort({ earnedAt: -1 });
    console.log(`📊 Current notifications for vidu: ${currentNotifications.length}`);
    currentNotifications.forEach((n, i) => {
      console.log(`   ${i + 1}. ${n.badgeDetails?.badgeName} - Triggered: ${n.animationTriggered} - Earned: ${n.earnedAt}`);
    });
    
    // Step 2: Delete ALL notifications for this user
    console.log('\n🗑️ Deleting all notifications...');
    const deleteResult = await BadgeNotification.deleteMany({ userId });
    console.log(`✅ Deleted ${deleteResult.deletedCount} notifications\n`);
    
    // Step 3: Get user's current badges from StudentProgress
    const studentProgress = await StudentProgress.findOne({ userId });
    const user = await User.findById(userId);
    
    if (studentProgress && user) {
      console.log(`👤 ${user.username} has ${studentProgress.badgesEarned.length} badges, ${studentProgress.totalPoints} points\n`);
      
      // Step 4: Create fresh notifications for each badge they have
      console.log('🔄 Creating fresh notifications for existing badges...\n');
      
      for (const badgeEntry of studentProgress.badgesEarned) {
        const badge = await Badge.findById(badgeEntry.badgeId);
        if (badge) {
          // Create notification with animationTriggered: true (already earned before)
          const notification = await BadgeNotification.create({
            userId,
            badgeId: badge._id,
            badgeDetails: {
              badgeName: badge.badgeName,
              badgeIcon: badge.badgeIcon,
              description: badge.description,
              badgeType: badge.badgeType
            },
            earnedAt: badgeEntry.earnedAt,
            isRead: false,
            animationTriggered: true // Already shown in the past
          });
          
          console.log(`  ✅ Created notification for "${badge.badgeName}" (triggered: true)`);
        }
      }
      
      console.log('\n✨ DONE! All notifications refreshed.');
      console.log('🎯 The animation will only appear for NEW badges earned from now on.\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

cleanupAndRefresh();
