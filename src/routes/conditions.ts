import express from "express";
import { createCondition, getConditionById } from "../controllers/conditions";
const router = express.Router();

router.post("/", createCondition);
router.get("/:id", getConditionById);

export default router;
