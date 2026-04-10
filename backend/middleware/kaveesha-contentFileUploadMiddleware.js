import multer from "multer";
import fs from "fs";
import path from "path";

// storage configuration for content files (PDF, presentations)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/content";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, "content-" + uniqueSuffix + ext);
  },
});

// allow PDF and presentation files
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ];
  
  const allowedExts = [".pdf", ".ppt", ".pptx"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and Presentation files are allowed (PDF, PPT, PPTX)"), false);
  }
};

export const contentUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
});
