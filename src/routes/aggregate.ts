import express from "express";
import upload from "../libs/multer";
import { Aggr } from "../controllers/aggregate";
import { FileHandler } from "../middlewares/fileHandler";
import { OCR } from "../middlewares/ocr";
const router = express.Router();

router.post("/upload", upload.array("file"), OCR, FileHandler, Aggr);

export default router;
