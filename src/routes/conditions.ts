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
router.get("/", getConditions);
router.get("/:id", getConditionById);
// needs fixing
router.post(
  "/chain",
  upload.array("appointments[]"),
  addConditionWithAppointments
);
router.get("/lab-results", getlabResults);

export default router;
