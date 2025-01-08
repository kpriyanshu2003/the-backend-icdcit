import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

const tempPath = path.join(__dirname, "../uploads/temp");

if (!fs.existsSync(tempPath)) {
  fs.mkdirSync(tempPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempPath); // Save the file temporarily
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname)); // Preserve the original extension
  },
});

export default multer({ storage: storage });
