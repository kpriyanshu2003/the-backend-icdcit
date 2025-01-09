import express from "express";
const router = express.Router();
import {
  createAppointment,
  createLabResult,
  getAppointmentById,
  getAllAppointments,
} from "../controllers/appointments";
import { FileHandler } from "../middlewares/fileHandler";
import upload from "../libs/multer";
import { OCR } from "../middlewares/ocr";

router.post("/", upload.array("file"), OCR, FileHandler, createAppointment);
router.get("/:id", getAppointmentById);
router.post("/lab", createLabResult);
router.get("/", getAllAppointments);

export default router;
