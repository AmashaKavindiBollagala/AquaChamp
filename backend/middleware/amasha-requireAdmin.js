const requireAdmin = (req, res, next) => {
  try {
    console.log("🔐 [Admin Check] Roles:", req.roles);

    if (!req.roles || !Array.isArray(req.roles)) {
      return res.status(403).json({
        success: false,
        message: "Admin access required (no roles found)",
      });
    }

    const isAdmin =
      req.roles.includes("Activity_ADMIN") ||
      req.roles.includes("admin");

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};

export { requireAdmin };