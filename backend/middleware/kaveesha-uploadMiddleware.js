import multer from "multer";
import fs from "fs";
import path from "path";

// storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/images");
  },
  filename: (req, file, cb) => {
    let originalName = file.originalname;
    const uploadPath = path.join("uploads/images", originalName);

    // Check if file already exists
    if (fs.existsSync(uploadPath)) {
      const name = path.parse(file.originalname).name; 
      const ext = path.extname(file.originalname);     
      const timestamp = Date.now();                  
      originalName = `${name}-${timestamp}${ext}`;   
    }

    cb(null, originalName);
  },
});

// allow only image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;

  if (allowedTypes.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
});