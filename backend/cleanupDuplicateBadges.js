import mongoose from 'mongoose';
import dotenv from 'dotenv';
import StudentProgress from './models/dushani-StudentProgress.js';
import User from './models/dushani-User.js';

dotenv.config();

const cleanupDuplicateBadges = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all students
    const allStudents = await StudentProgress.find();
    console.log(`📊 Found ${allStudents.length} students in database\n`);

    let totalDuplicatesRemoved = 0;
    let studentsCleaned = 0;

    for (const student of allStudents) {
      const user = await User.findById(student.userId);
      const username = user ? user.username : 'Unknown';

      console.log(`\n👤 Checking ${username} (ID: ${student.userId})`);
      console.log(`   Current badges: ${student.badgesEarned.length}`);

      // Show all badges
      student.badgesEarned.forEach((badge, index) => {
        console.log(`   ${index + 1}. ${badge.badgeDetails?.badgeName || 'Unknown'} (${badge.badgeId})`);
      });

      // Find duplicates
      const badgeCounts = {};
      const duplicateBadgeIds = [];

      student.badgesEarned.forEach((badge, index) => {
        const badgeIdStr = badge.badgeId.toString();
        if (badgeCounts[badgeIdStr]) {
          duplicateBadgeIds.push(index);
          console.log(`   🚨 DUPLICATE FOUND: ${badge.badgeDetails?.badgeName} at index ${index}`);
        } else {
          badgeCounts[badgeIdStr] = 1;
        }
      });

      // Remove duplicates
      if (duplicateBadgeIds.length > 0) {
        console.log(`\n   🧹 Removing ${duplicateBadgeIds.length} duplicate(s)...`);
        
        // Keep only unique badges
        const uniqueBadges = [];
        const seenBadgeIds = new Set();

        student.badgesEarned.forEach(badge => {
          const badgeIdStr = badge.badgeId.toString();
          if (!seenBadgeIds.has(badgeIdStr)) {
            seenBadgeIds.add(badgeIdStr);
            uniqueBadges.push(badge);
          }
        });

        student.badgesEarned = uniqueBadges;
        await student.save();

        console.log(`   ✅ Cleaned! Now has ${student.badgesEarned.length} unique badge(s)`);
        totalDuplicatesRemoved += duplicateBadgeIds.length;
        studentsCleaned++;
      } else {
        console.log(`   ✅ No duplicates found`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 CLEANUP SUMMARY:');
    console.log(`   Total students checked: ${allStudents.length}`);
    console.log(`   Students cleaned: ${studentsCleaned}`);
    console.log(`   Total duplicates removed: ${totalDuplicatesRemoved}`);
    console.log('='.repeat(60) + '\n');

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

cleanupDuplicateBadges();
