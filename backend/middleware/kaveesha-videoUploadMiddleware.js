import multer from "multer";
import fs from "fs";
import path from "path";

// storage configuration for videos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/videos";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, "video-" + uniqueSuffix + ext);
  },
});

// allow only video files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /mp4|webm|avi|mov|mkv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /video/.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Only video files are allowed (MP4, WebM, AVI, MOV, MKV)"), false);
  }
};

export const videoUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});
