import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/dilshara-Admin.js";

dotenv.config();

const checkAndUpdateAdmins = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find all admins
    const admins = await Admin.find({}, "username email roles");
    
    console.log("\n📋 Current Admin accounts:");
    if (admins.length === 0) {
      console.log("   No admin accounts found in the database.");
      console.log("\n💡 You should login using the regular User login (amasha-login.jsx) instead.");
      console.log("   All User accounts now have Lessons_ADMIN role.");
    } else {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.username} (${admin.email}) - Roles: ${admin.roles.join(", ")}`);
      });

      // Update all admins to have Lessons_ADMIN role
      console.log("\n🔄 Granting Lessons_ADMIN role to all admins...");
      
      const result = await Admin.updateMany(
        {},
        { 
          $addToSet: { roles: "Lessons_ADMIN" } 
        }
      );

      console.log(`✅ Updated ${result.modifiedCount} admin(s)`);

      // Verify the update
      const updatedAdmins = await Admin.find({}, "username email roles");
      console.log("\n📋 Updated admin accounts:");
      updatedAdmins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.username} (${admin.email}) - Roles: ${admin.roles.join(", ")}`);
      });
    }

    console.log("\n✨ Done!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

checkAndUpdateAdmins();
