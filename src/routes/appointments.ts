import express from "express";
const router = express.Router();
import {
  createAppointment,
  createLabResult,
  getAppointmentById,
  getAllAppointments,
} from "../controllers/appointments";

router.post("/", createAppointment);
router.get("/:id", getAppointmentById);
router.post("/lab", createLabResult);
router.get("/", getAllAppointments);

export default router;
