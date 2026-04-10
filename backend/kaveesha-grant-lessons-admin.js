import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/dushani-User.js";

dotenv.config();

const grantLessonsAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find all users
    const users = await User.find({}, "username email roles");
    
    console.log("\n📋 Available users:");
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email}) - Roles: ${user.roles.join(", ")}`);
    });

    // Update all users to have Lessons_ADMIN role
    console.log("\n🔄 Granting Lessons_ADMIN role to all users...");
    
    const result = await User.updateMany(
      {},
      { 
        $addToSet: { roles: "Lessons_ADMIN" } 
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} user(s)`);

    // Verify the update
    const updatedUsers = await User.find({}, "username email roles");
    console.log("\n📋 Updated users:");
    updatedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email}) - Roles: ${user.roles.join(", ")}`);
    });

    console.log("\n✨ Done! You can now access the lesson admin features.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

grantLessonsAdmin();
