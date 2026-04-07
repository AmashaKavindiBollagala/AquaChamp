
import mongoose from "mongoose";
import dotenv from "dotenv";
import Activity from "./models/amasha-activity.js";

dotenv.config();

const systemActivities = [
  { name: "Brush Teeth (Morning)", description: "Brush teeth for at least 2 minutes after waking up", icon: "🪥", points: 10 },
  { name: "Brush Teeth (Night)", description: "Brush teeth before bedtime", icon: "🌙", points: 10 },
  { name: "Wash Hands Before Meals", description: "Wash hands with soap for 20 seconds before eating", icon: "🧼", points: 10 },
  { name: "Wash Hands After Toilet", description: "Always wash hands with soap after using the toilet", icon: "🚽", points: 10 },
  { name: "Take a Shower/Bath", description: "Clean your body daily with soap and water", icon: "🚿", points: 15 },
  { name: "Trim/Clean Fingernails", description: "Keep nails short and clean to prevent germs", icon: "✂️", points: 10 },
  { name: "Comb/Brush Hair", description: "Keep hair clean and tidy", icon: "💇", points: 5 },
  { name: "Change Into Clean Clothes", description: "Wear fresh, clean clothes every day", icon: "👕", points: 10 },
];

const seed = async () => {
  try {
    await mongoose.connect('mongodb+srv://amashakav23_db_user:V5kypgjEgWAYqqMD@cluster0.y4e3wr3.mongodb.net/AquaChamp?retryWrites=true&w=majority');
    console.log("✅ Connected to MongoDB");

    let created = 0;
    let skipped = 0;

    for (const activity of systemActivities) {
      const exists = await Activity.findOne({ name: activity.name, source: "system" });
      if (!exists) {
        await Activity.create({ ...activity, source: "system", userId: null });
        console.log(`  ✅ Created: ${activity.icon} ${activity.name}`);
        created++;
      } else {
        console.log(`  ⏭️  Skipped (exists): ${activity.name}`);
        skipped++;
      }
    }

    console.log(`\n🌱 Seeding complete — ${created} created, ${skipped} skipped.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};

seed();