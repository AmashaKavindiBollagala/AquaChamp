import UserPoints from "../models/amasha-userPoints.js";
import User from "../models/dushani-User.js";

// Helper: get full user document from token username 
const getUser = async (req) => {
  return await User.findOne({ username: req.user }); 
};

// Get My Points 
export const getMyPoints = async (req, res) => {
  try {
    const dbUser = await getUser(req);
    if (!dbUser) return res.status(404).json({ success: false, message: "User not found" });

    let profile = await UserPoints.findOne({ userId: dbUser._id });
    if (!profile) {
      return res.status(200).json({ success: true, data: { totalPoints: 0, history: [] } });
    }

    const recentHistory = [...profile.history].reverse().slice(0, 20);

    return res.status(200).json({
      success: true,
      data: {
        totalPoints: profile.totalPoints,
        recentHistory,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//  Get Any User's Points (Admin only) 
export const getUserPoints = async (req, res) => {
  try {
    const isAdmin = req.roles?.includes("Activity_ADMIN");
    if (!isAdmin) return res.status(403).json({ success: false, message: "Admin access required" });

    const { userId } = req.params;

    const profile = await UserPoints.findOne({ userId });
    if (!profile) {
      return res.status(200).json({ success: true, data: { userId, totalPoints: 0 } });
    }

    return res.status(200).json({
      success: true,
      data: { userId, totalPoints: profile.totalPoints },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};