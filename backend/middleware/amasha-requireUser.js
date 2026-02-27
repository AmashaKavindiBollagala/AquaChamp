const requireUser = (req, res, next) => {
  if (req.roles?.includes("Activity_ADMIN")) {
    return res.status(403).json({ success: false, message: "This action is for users only" });
  }
  next();
};

export { requireUser };