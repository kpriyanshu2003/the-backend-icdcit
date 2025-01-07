import express from "express";
const router = express.Router();
import { authToken } from "../middlewares/auth";
import {
  createAppointment,
  createLabResult,
  getAppointmentById,
} from "../controllers/appointments";

router.post("/", authToken, createAppointment);
router.get("/:id", getAppointmentById);
router.post("/lab", authToken, createLabResult);

export default router;
