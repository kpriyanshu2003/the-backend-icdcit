import express from "express";
const router = express.Router();

import userRoutes from "./user";
import conditionsRoutes from "./conditions";
import appointmentRoutes from "./appointments";
import aggregateRoutes from "./aggregate";

router.use("/user", userRoutes);
router.use("/conditions", conditionsRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/aggregate", aggregateRoutes);

export default router;
