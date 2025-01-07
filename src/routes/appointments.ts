import express from "express";
const router = express.Router();
import { authToken } from "../middlewares/auth";
import {
  createAppointment,
  createLabResult,
  getAppointmentById,
  getAllAppointments
} from "../controllers/appointments";

router.post("/", authToken, createAppointment);
router.get("/:id", getAppointmentById);
router.post("/lab", authToken, createLabResult);
router.get("/", getAllAppointments);

export default router;
