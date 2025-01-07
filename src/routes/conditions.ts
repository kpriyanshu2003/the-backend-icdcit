import express from "express";
import {
  createCondition,
  getConditionById,
  addConditionWithAppointments,
} from "../controllers/conditions";
import { authToken } from "../middlewares/auth";
import upload from "../libs/multer";
const router = express.Router();

router.post("/", authToken, createCondition);
router.get("/:id", getConditionById);
router.post(
  "/chain",
  authToken,
  upload.array("appointments[]"),
  addConditionWithAppointments
);
export default router;
