import express from "express";
import {
  createCondition,
  getConditionById,
  // addConditionWithAppointments,
  getConditions,
  getlabResults,
} from "../controllers/conditions";
import upload from "../libs/multer";
import { FileHandler } from "../middlewares/fileHandler";
const router = express.Router();

router.post("/", upload.array("file"), FileHandler, createCondition);
router.get("/", getConditions);
router.get("/:id", getConditionById);
// needs fixing
// router.post(
//   "/chain",
//   upload.array("appointments[]"),
//   addConditionWithAppointments
// );
router.get("/lab-results", getlabResults);

export default router;
