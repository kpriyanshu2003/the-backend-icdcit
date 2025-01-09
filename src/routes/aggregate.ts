import express from "express";
import upload from "../libs/multer";
import { Aggr, healthRecommendation } from "../controllers/aggregate";
import { FileHandler } from "../middlewares/fileHandler";
import { OCR } from "../middlewares/ocr";
import { authToken } from "../middlewares/auth";
const router = express.Router();

router.post("/upload", upload.array("file"), FileHandler, Aggr);
router.get("/risk-predict", authToken, healthRecommendation);

export default router;
