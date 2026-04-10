import Activity from "../models/amasha-activity.js";
import User from "../models/dushani-User.js";

import Admin from "../models/dilshara-Admin.js";

const getUser = async (req) => {
  const user = await User.findOne({ username: req.user });
  if (user) return user;
  // Fallback: check Admin collection (for admin dashboard access)
  return await Admin.findOne({ username: req.user });
};

//  Admin: Create a System Activity 
export const createSystemActivity = async (req, res) => {
  try {
    const isAdmin = req.roles?.includes("Activity_ADMIN");
    if (!isAdmin) return res.status(403).json({ success: false, message: "Admin access required" });

    const { name, description, icon, points } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Activity name is required" });

    const activity = await Activity.create({
      userId: null,
      name,
      description,
      icon: icon || "🧼",
      points: points || 10,
      source: "system",
    });

    return res.status(201).json({ success: true, message: "System activity created", data: activity });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//  User: Add a Custom Activity 
export const createCustomActivity = async (req, res) => {
  try {
    const dbUser = await getUser(req);
    if (!dbUser) return res.status(404).json({ success: false, message: "User not found" });

    const { name, description, icon, points } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Activity name is required" });

    const activity = await Activity.create({
      userId: dbUser._id,
      name,
      description,
      icon: icon || "⭐",
      points: 10, 
      source: "custom",
    });

    return res.status(201).json({ success: true, message: "Custom activity added", data: activity });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//  Get All Activities For a User
export const getAllActivities = async (req, res) => {
  try {
    const dbUser = await getUser(req);
    if (!dbUser) return res.status(404).json({ success: false, message: "User not found" });

    const isAdmin = req.roles?.includes("Activity_ADMIN");
    const query = isAdmin
      ? {}  // Admin sees ALL activities
      : { isActive: true, $or: [{ source: "system" }, { userId: dbUser._id }] };

    const activities = await Activity.find(query).sort({ source: -1, createdAt: 1 })
    .populate("userId", "name email age");

    return res.status(200).json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//Update an Activity 
export const updateActivity = async (req, res) => {
  try {
    const dbUser = await getUser(req);
    if (!dbUser) return res.status(404).json({ success: false, message: "User not found" });

    const { id } = req.params;
    const isAdmin = req.roles?.includes("Activity_ADMIN");

    const activity = await Activity.findById(id);
    if (!activity) return res.status(404).json({ success: false, message: "Activity not found" });

    const isOwner = activity.userId?.toString() === dbUser._id.toString();
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: "You can only update your own activities" });
    }

    const { name, description, icon, points, isActive } = req.body;
    if (name !== undefined) activity.name = name;
    if (description !== undefined) activity.description = description;
    if (icon !== undefined) activity.icon = icon;
    if (points !== undefined) activity.points = points;
    if (isActive !== undefined) activity.isActive = isActive;

    await activity.save();

    return res.status(200).json({ success: true, message: "Activity updated", data: activity });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//  Delete an Activity 
export const deleteActivity = async (req, res) => {
  try {
    const dbUser = await getUser(req);
    if (!dbUser) return res.status(404).json({ success: false, message: "User not found" });

    const { id } = req.params;
    const isAdmin = req.roles?.includes("Activity_ADMIN");

    const activity = await Activity.findById(id);
    if (!activity) return res.status(404).json({ success: false, message: "Activity not found" });

    const isOwner = activity.userId?.toString() === dbUser._id.toString();
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: "You can only delete your own activities" });
    }

 await Activity.findByIdAndDelete(id);

return res.status(200).json({ success: true, message: "Activity permanently deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};