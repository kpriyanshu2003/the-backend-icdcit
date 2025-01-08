import express from "express";
import upload from "../libs/multer";
import { Aggr } from "../controllers/aggregate";
import { FileHandler } from "../middlewares/fileHandler";
const router = express.Router();

router.post("/upload", upload.single("file"), FileHandler, Aggr);

export default router;
