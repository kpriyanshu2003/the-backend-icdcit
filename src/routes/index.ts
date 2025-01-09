import express from "express";
const router = express.Router();

import userRoutes from "./user";
import conditionsRoutes from "./conditions";
import appointmentRoutes from "./appointments";
import aggregateRoutes from "./aggregate";
import { authToken } from "../middlewares/auth";
import doctorRoutes from "./doctor";

router.use("/user", authToken, userRoutes);
router.use("/conditions", authToken, conditionsRoutes);
router.use("/appointments", authToken, appointmentRoutes);
router.use("/aggregate", aggregateRoutes);
router.use("/doctor", doctorRoutes);

export default router;
