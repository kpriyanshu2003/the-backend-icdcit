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

router.post("/", upload.array("files", 10), FileHandler, createAppointment);
router.get("/:id", getAppointmentById);
router.post("/lab", createLabResult);
router.get("/", getAllAppointments);

export default router;
