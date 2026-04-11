import multer from "multer";
import path from "path";

// ☁️ memory storage (required for Cloudinary uploads)
const storage = multer.memoryStorage();

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
