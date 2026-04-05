// kaveesha-delete-unverified-users.js
import cron from "node-cron";
import User from "./models/dushani-User.js";
import SecurityEmailVerification from "./models/securityEmailVerification.js";

// Delete unverified users whose verification tokens have expired
const deleteUnverifiedUsers = async () => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago (matches token expiry)

    // Find all expired verification tokens
    const expiredTokens = await SecurityEmailVerification.find({
      createdAt: { $lt: oneHourAgo }
    });

    if (expiredTokens.length === 0) {
      console.log(`No expired verification tokens found at ${now.toISOString()}`);
      return;
    }

    // Get user IDs with expired tokens
    const userIds = expiredTokens.map(token => token.userId);

    // Delete users who are still unverified and have expired tokens
    const result = await User.deleteMany({
      _id: { $in: userIds },
      isVerified: false,
    });

    // Clean up the expired tokens
    await SecurityEmailVerification.deleteMany({
      createdAt: { $lt: oneHourAgo }
    });

    console.log(
      `${result.deletedCount} unverified user(s) with expired tokens deleted at ${now.toISOString()}`
    );
  } catch (error) {
    console.error("Error deleting unverified users:", error.message);
  }
};

// Schedule: "0 * * * *" → every hour at minute 0
cron.schedule("0 * * * *", async () => {
  console.log("Running unverified user cleanup...");
  await deleteUnverifiedUsers();
});

console.log("Cron job scheduled: deletes unverified users every hour");