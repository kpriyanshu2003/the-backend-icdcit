import multer from "multer";

// Multer configuration for S3 uploads
const upload = multer({
  storage: multer.memoryStorage(),
});
