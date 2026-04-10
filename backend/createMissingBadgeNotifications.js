import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BadgeNotification from './models/dushani-BadgeNotification.js';
import StudentProgress from './models/dushani-StudentProgress.js';
import Badge from './models/dushani-Badge.js';

dotenv.config();

const createMissingNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all student progress records (without populate to avoid schema issues)
    const allProgress = await StudentProgress.find();
    
    console.log(`📊 Found ${allProgress.length} student progress records\n`);

    let notificationsCreated = 0;

    for (const progress of allProgress) {
      if (!progress.badgesEarned || progress.badgesEarned.length === 0) {
        continue;
      }

      console.log(`\n👤 Checking student: ${progress.userId}`);

      for (const badgeEntry of progress.badgesEarned) {
        // Check if notification exists for this badge
        const existingNotification = await BadgeNotification.findOne({
          userId: progress.userId,
          badgeId: badgeEntry.badgeId
        });

        if (!existingNotification) {
          // Notification doesn't exist, create it
          const badge = await Badge.findById(badgeEntry.badgeId);
          
          if (badge) {
            console.log(`  ⚠️  Missing notification for: ${badge.badgeName}`);
            
            // Create the notification
            await BadgeNotification.createNotification(progress.userId, badge);
            console.log(`  ✅ Created notification for: ${badge.badgeName}`);
            notificationsCreated++;
          } else {
            console.log(`  ❌ Badge not found: ${badgeEntry.badgeId}`);
          }
        } else {
          console.log(`  ✓ Notification exists for: ${existingNotification.badgeDetails?.badgeName}`);
        }
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎉 Total notifications created: ${notificationsCreated}`);
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createMissingNotifications();
