
const requireAdmin = (req, res, next) => {
  if (!req.roles?.includes("Activity_ADMIN")) {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};

export { requireAdmin };