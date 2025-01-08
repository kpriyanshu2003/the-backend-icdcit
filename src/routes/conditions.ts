import express from "express";
import {
  createCondition,
  getConditionById,
  addConditionWithAppointments,
  getConditions,
  getlabResults,
} from "../controllers/conditions";
import upload from "../libs/multer";
const router = express.Router();

router.post("/", createCondition);
router.get("/:id", getConditionById);
router.post(
  "/chain",
  upload.array("appointments[]"),
  addConditionWithAppointments
);
router.get("/", getConditions);
router.get("/lab-results", getlabResults);

export default router;
