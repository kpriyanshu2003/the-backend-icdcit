import express from "express";
const router = express.Router();

import {
  createAppointment,
  createLabResult,
  getAppointmentById,
} from "../controllers/appointments";

router.post("/", createAppointment);
router.get("/:id", getAppointmentById);
router.post("/lab", createLabResult);

export default router;
