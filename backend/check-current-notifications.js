import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BadgeNotification from './models/dushani-BadgeNotification.js';

dotenv.config();

const checkNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const userId = '69d601a3d6452c80bb8ca0f6'; // vidu's user ID
    
    console.log('\n📊 CHECKING CURRENT NOTIFICATIONS...\n');
    
    const notifications = await BadgeNotification.find({ userId })
      .sort({ earnedAt: -1 })
      .limit(20);
    
    console.log(`Total notifications (latest 20): ${notifications.length}\n`);
    
    notifications.forEach((n, i) => {
      console.log(`${i + 1}. ${n.badgeDetails?.badgeName}`);
      console.log(`   Triggered: ${n.animationTriggered}`);
      console.log(`   Earned: ${n.earnedAt}\n`);
    });
    
    // Count by badge name
    const allNotifications = await BadgeNotification.find({ userId });
    const badgeCounts = {};
    allNotifications.forEach(n => {
      const name = n.badgeDetails?.badgeName || 'Unknown';
      badgeCounts[name] = (badgeCounts[name] || 0) + 1;
    });
    
    console.log('\n📈 SUMMARY BY BADGE:');
    Object.entries(badgeCounts).forEach(([name, count]) => {
      console.log(`   ${name}: ${count} notifications`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkNotifications();
